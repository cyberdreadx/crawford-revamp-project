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

async function downloadAndUploadImage(
  supabase: any,
  imageUrl: string,
  propertyId: string,
  imageIndex: number
): Promise<string | null> {
  try {
    // Download the image
    const response = await fetch(imageUrl);
    if (!response.ok) {
      console.error(`Failed to download image: ${response.status}`);
      return null;
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Determine file extension
    let extension = 'jpg';
    if (contentType.includes('png')) extension = 'png';
    else if (contentType.includes('webp')) extension = 'webp';
    else if (contentType.includes('gif')) extension = 'gif';

    // Create unique filename
    const filename = `${propertyId}/${imageIndex}.${extension}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('property-images')
      .upload(filename, uint8Array, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error(`Failed to upload image: ${error.message}`);
      return null;
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('property-images')
      .getPublicUrl(filename);

    return urlData?.publicUrl || null;
  } catch (err: any) {
    console.error(`Error processing image: ${err.message}`);
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

    // Parse request body for optional limit parameter
    let limit = 10; // Default to 10 properties at a time to avoid timeout
    try {
      const body = await req.json();
      if (body.limit) limit = Math.min(body.limit, 50); // Max 50 at a time
    } catch {
      // No body or invalid JSON, use defaults
    }

    // Get MLS properties that need media synced
    // Prioritize properties without images first
    const { data: mlsProperties, error: propsError } = await supabase
      .from('properties')
      .select(`
        id, 
        listing_id, 
        title,
        property_images(id)
      `)
      .eq('is_mls_listing', true)
      .not('listing_id', 'is', null)
      .limit(limit);

    if (propsError) {
      throw new Error(`Failed to fetch MLS properties: ${propsError.message}`);
    }

    // Filter to properties with few or no images
    const propertiesNeedingImages = (mlsProperties || [])
      .filter(p => !p.property_images || p.property_images.length < 3)
      .slice(0, limit);

    if (propertiesNeedingImages.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'All properties have images synced', synced: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing ${propertiesNeedingImages.length} MLS properties for media sync`);

    // Create a map of listing_id -> property_id
    const listingIdMap = new Map<string, string>();
    propertiesNeedingImages.forEach(prop => {
      if (prop.listing_id) {
        listingIdMap.set(prop.listing_id, prop.id);
      }
    });

    const listingIds = Array.from(listingIdMap.keys());
    
    let totalMediaSynced = 0;
    let propertiesWithMedia = 0;
    const errors: string[] = [];

    // Process in batches of 5 for image downloads (to avoid overwhelming the server)
    const batchSize = 5;
    for (let i = 0; i < listingIds.length; i += batchSize) {
      const batch = listingIds.slice(i, i + batchSize);
      
      // Build OData filter for batch
      const filterParts = batch.map(id => `ListingId eq '${id}'`);
      const filter = filterParts.join(' or ');
      
      // Use Property endpoint with $expand=Media
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
          
          // Filter to only photos and get ONLY the first one (primary image)
          const photos = mediaList
            .filter(m => {
              const mediaType = (m.MediaType || '').toLowerCase();
              const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(mediaType);
              const cat = (m.MediaCategory || '').toLowerCase();
              const isCategoryPhoto = cat === 'photo' || cat === 'image' || cat.includes('photo');
              return isImage || isCategoryPhoto;
            })
            .sort((a, b) => (a.Order || 0) - (b.Order || 0))
            .slice(0, 1); // Only keep the PRIMARY image to save storage

          if (photos.length === 0) {
            console.log(`No photos for listing ${listingId}`);
            continue;
          }

          // Delete existing images for this property
          await supabase
            .from('property_images')
            .delete()
            .eq('property_id', propertyId);

          // Also delete from storage
          const { data: existingFiles } = await supabase.storage
            .from('property-images')
            .list(propertyId);

          if (existingFiles && existingFiles.length > 0) {
            const filesToDelete = existingFiles.map(f => `${propertyId}/${f.name}`);
            await supabase.storage.from('property-images').remove(filesToDelete);
          }

          // Download and upload each image
          const uploadedImages: { url: string; order: number }[] = [];
          
          for (let idx = 0; idx < photos.length; idx++) {
            const media = photos[idx];
            console.log(`Downloading image ${idx + 1}/${photos.length} for ${listingId}`);
            
            const uploadedUrl = await downloadAndUploadImage(
              supabase,
              media.MediaURL,
              propertyId,
              idx
            );

            if (uploadedUrl) {
              uploadedImages.push({ url: uploadedUrl, order: media.Order || idx });
            }
          }

          if (uploadedImages.length === 0) {
            console.log(`No images uploaded for ${listingId}`);
            continue;
          }

          // Insert new images into database
          const imagesToInsert = uploadedImages.map((img, index) => ({
            property_id: propertyId,
            image_url: img.url,
            is_primary: index === 0,
            display_order: img.order,
          }));

          const { error: insertError } = await supabase
            .from('property_images')
            .insert(imagesToInsert);

          if (insertError) {
            console.error(`Error inserting images for ${listingId}: ${insertError.message}`);
            errors.push(`${listingId}: Failed to insert images`);
            continue;
          }

          console.log(`Synced ${imagesToInsert.length} images for listing ${listingId}`);
          totalMediaSynced += imagesToInsert.length;
          propertiesWithMedia++;
        }
      } catch (batchError: any) {
        console.error(`Batch error: ${batchError.message}`);
        errors.push(`Batch ${Math.floor(i/batchSize) + 1}: ${batchError.message}`);
      }

      // Delay between batches
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`Media sync complete: ${totalMediaSynced} images for ${propertiesWithMedia} properties`);

    return new Response(
      JSON.stringify({
        success: true,
        totalMediaSynced,
        propertiesWithMedia,
        totalProperties: propertiesNeedingImages.length,
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
