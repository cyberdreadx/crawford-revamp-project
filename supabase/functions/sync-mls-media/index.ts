import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MLSMedia {
  MediaKey: string;
  MediaURL: string;
  Order: number;
  MediaCategory?: string;
  MediaType?: string;
  LongDescription?: string;
}

interface MLSProperty {
  ListingId: string;
  Media?: MLSMedia[];
}

// Helper to download image and upload to Supabase Storage
async function downloadAndStoreImage(
  supabase: any,
  mlsAccessToken: string,
  imageUrl: string,
  listingId: string,
  imageIndex: number
): Promise<string | null> {
  try {
    // Download from MLS Grid with auth
    const response = await fetch(imageUrl, {
      headers: {
        'Authorization': `Bearer ${mlsAccessToken}`,
        'Accept': 'image/*',
      },
    });

    if (!response.ok) {
      console.error(`Failed to download image for ${listingId}: ${response.status}`);
      return null;
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const imageData = await response.arrayBuffer();
    
    // Determine file extension from content type
    let ext = 'jpg';
    if (contentType.includes('png')) ext = 'png';
    else if (contentType.includes('gif')) ext = 'gif';
    else if (contentType.includes('webp')) ext = 'webp';

    const fileName = `mls/${listingId}/${imageIndex}.${ext}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('property-images')
      .upload(fileName, imageData, {
        contentType,
        upsert: true, // Overwrite if exists
      });

    if (uploadError) {
      console.error(`Failed to upload image for ${listingId}: ${uploadError.message}`);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('property-images')
      .getPublicUrl(fileName);

    return urlData?.publicUrl || null;
  } catch (error: any) {
    console.error(`Error processing image for ${listingId}: ${error.message}`);
    return null;
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const mlsBaseUrl = Deno.env.get('MLS_GRID_BASE_URL');
    const mlsAccessToken = Deno.env.get('MLS_GRID_ACCESS_TOKEN');

    if (!mlsBaseUrl || !mlsAccessToken) {
      return new Response(
        JSON.stringify({ success: false, error: 'MLS Grid credentials not configured' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Ensure the storage bucket exists
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((b: any) => b.name === 'property-images');
    
    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket('property-images', {
        public: true,
        fileSizeLimit: 10485760, // 10MB
      });
      if (createError && !createError.message.includes('already exists')) {
        console.error('Failed to create bucket:', createError.message);
      } else {
        console.log('Created property-images bucket');
      }
    }

    // Get all MLS properties that need media synced
    const { data: mlsProperties, error: propsError } = await supabase
      .from('properties')
      .select('id, listing_id, title')
      .eq('is_mls_listing', true)
      .not('listing_id', 'is', null);

    if (propsError) {
      throw new Error(`Failed to fetch MLS properties: ${propsError.message}`);
    }

    if (!mlsProperties || mlsProperties.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No MLS properties to sync media for', synced: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${mlsProperties.length} MLS properties to sync media for`);

    // Create a map of listing_id -> property_id
    const listingIdMap = new Map<string, string>();
    mlsProperties.forEach(prop => {
      if (prop.listing_id) {
        listingIdMap.set(prop.listing_id, prop.id);
      }
    });

    const listingIds = Array.from(listingIdMap.keys());
    
    let totalMediaSynced = 0;
    let propertiesWithMedia = 0;
    const errors: string[] = [];

    // Process in batches of 10 properties (smaller to avoid rate limits)
    const batchSize = 10;
    for (let i = 0; i < listingIds.length; i += batchSize) {
      const batch = listingIds.slice(i, i + batchSize);
      
      // Build OData filter for batch
      const filterParts = batch.map(id => `ListingId eq '${id}'`);
      const filter = filterParts.join(' or ');
      
      const propertyUrl = `${mlsBaseUrl}/Property?$filter=${filter}&$expand=Media`;
      
      console.log(`Fetching media batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(listingIds.length/batchSize)}`);
      
      try {
        const response = await fetch(propertyUrl, {
          headers: {
            'Authorization': `Bearer ${mlsAccessToken}`,
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`MLS Grid API error: ${response.status} - ${errorText}`);
          errors.push(`Batch ${Math.floor(i/batchSize) + 1}: API error ${response.status}`);
          continue;
        }

        const data = await response.json();
        const properties: MLSProperty[] = data.value || [];
        
        console.log(`Received ${properties.length} properties with media data`);

        // Process each property's media
        for (const property of properties) {
          const listingId = property.ListingId;
          const propertyId = listingIdMap.get(listingId);
          if (!propertyId) continue;

          const mediaList = property.Media || [];
          
          // Filter to only photos and get FIRST image only (primary)
          const photos = mediaList
            .filter(m => {
              const mediaType = (m.MediaType || '').toLowerCase();
              const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(mediaType);
              const cat = (m.MediaCategory || '').toLowerCase();
              const isCategoryPhoto = cat === 'photo' || cat === 'image' || cat.includes('photo');
              // If no MediaType or MediaCategory, check if MediaURL looks like an image
              const urlLooksLikeImage = m.MediaURL && /\.(jpg|jpeg|png|gif|webp)/i.test(m.MediaURL);
              return isImage || isCategoryPhoto || urlLooksLikeImage;
            })
            .sort((a, b) => (a.Order || 0) - (b.Order || 0))
            .slice(0, 1); // Only primary image

          if (photos.length === 0) {
            // If no photos found with strict filter, try to get ANY media URL
            const anyMedia = mediaList.filter(m => m.MediaURL).slice(0, 1);
            if (anyMedia.length > 0) {
              photos.push(anyMedia[0]);
              console.log(`Using fallback media for ${listingId}`);
            }
          }

          if (photos.length === 0) {
            console.log(`No photos for listing ${listingId} (total media: ${mediaList.length})`);
            continue;
          }

          // Download and store each image
          const imagesToInsert: any[] = [];
          
          for (let imgIndex = 0; imgIndex < photos.length; imgIndex++) {
            const media = photos[imgIndex];
            const storedUrl = await downloadAndStoreImage(
              supabase,
              mlsAccessToken,
              media.MediaURL,
              listingId,
              imgIndex
            );

            if (storedUrl) {
              imagesToInsert.push({
                property_id: propertyId,
                image_url: storedUrl,
                is_primary: imgIndex === 0,
                display_order: media.Order || imgIndex,
              });
            }
            
            // Small delay between image downloads to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          if (imagesToInsert.length === 0) {
            console.log(`No images stored for ${listingId}`);
            continue;
          }

          // Delete existing images for this property
          const { error: deleteError } = await supabase
            .from('property_images')
            .delete()
            .eq('property_id', propertyId);

          if (deleteError) {
            console.error(`Error deleting existing images for ${listingId}: ${deleteError.message}`);
          }

          // Insert new images with Supabase Storage URLs
          const { error: insertError } = await supabase
            .from('property_images')
            .insert(imagesToInsert);

          if (insertError) {
            console.error(`Error inserting images for ${listingId}: ${insertError.message}`);
            errors.push(`${listingId}: Failed to insert images`);
            continue;
          }

          console.log(`Synced ${imagesToInsert.length} image(s) for listing ${listingId}`);
          totalMediaSynced += imagesToInsert.length;
          propertiesWithMedia++;
        }
      } catch (batchError: any) {
        console.error(`Batch error: ${batchError.message}`);
        errors.push(`Batch ${Math.floor(i/batchSize) + 1}: ${batchError.message}`);
      }

      // Delay between batches to avoid rate limits (500ms)
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`Media sync complete: ${totalMediaSynced} images for ${propertiesWithMedia} properties`);

    return new Response(
      JSON.stringify({
        success: true,
        totalMediaSynced,
        propertiesWithMedia,
        totalProperties: mlsProperties.length,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in sync-mls-media:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
