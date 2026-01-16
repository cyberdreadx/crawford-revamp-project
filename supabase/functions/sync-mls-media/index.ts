import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MLSMedia {
  MediaKey: string;
  MediaURL: string;
  Order: number;
  MediaCategory: string;
}

interface MLSProperty {
  ListingId: string;
  Media?: MLSMedia[];
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

    // Create a map of listing_id -> property_id for quick lookup
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

    // Process in batches of 20 properties using $expand=Media on Property endpoint
    const batchSize = 20;
    for (let i = 0; i < listingIds.length; i += batchSize) {
      const batch = listingIds.slice(i, i + batchSize);
      
      // Build OData filter for batch - use $expand=Media to get media with properties
      const filterParts = batch.map(id => `ListingId eq '${id}'`);
      const filter = filterParts.join(' or ');
      
      // Use Property endpoint with $expand=Media (required for MLS Grid v2)
      // Note: Don't use $select with $expand as it excludes the expanded data
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
        
        // Debug: Log first property's raw media data to understand the structure
        if (properties.length > 0) {
          const firstProp = properties[0];
          console.log(`First property ${firstProp.ListingId} raw Media:`, JSON.stringify(firstProp.Media?.slice(0, 3) || 'NO MEDIA ARRAY'));
          if (firstProp.Media && firstProp.Media.length > 0) {
            console.log(`Media categories found:`, [...new Set(firstProp.Media.map(m => m.MediaCategory))]);
          }
        }

        // Process each property's media
        for (const property of properties) {
          const listingId = property.ListingId;
          const propertyId = listingIdMap.get(listingId);
          if (!propertyId) continue;

          const mediaList = property.Media || [];
          
          // Log ALL media categories for debugging
          if (mediaList.length > 0) {
            const categories = [...new Set(mediaList.map(m => m.MediaCategory))];
            console.log(`Listing ${listingId}: ${mediaList.length} media items, categories: ${JSON.stringify(categories)}`);
            // Also log first media item structure
            console.log(`First media item:`, JSON.stringify(mediaList[0]));
          }
          
          // Filter to only photos and sort by Order
          // Accept any category that looks like a photo
          const photos = mediaList
            .filter(m => {
              const cat = (m.MediaCategory || '').toLowerCase();
              return cat === 'photo' || cat === 'image' || cat.includes('photo') || cat.includes('image');
            })
            .sort((a, b) => (a.Order || 0) - (b.Order || 0));

          if (photos.length === 0) {
            console.log(`No photos for listing ${listingId} after filtering (total media items: ${mediaList.length})`);
            continue;
          }

          // Delete existing images for this property
          const { error: deleteError } = await supabase
            .from('property_images')
            .delete()
            .eq('property_id', propertyId);

          if (deleteError) {
            console.error(`Error deleting existing images for ${listingId}: ${deleteError.message}`);
            errors.push(`${listingId}: Failed to clear existing images`);
            continue;
          }

          // Insert new images
          const imagesToInsert = photos.map((media, index) => ({
            property_id: propertyId,
            image_url: media.MediaURL,
            is_primary: index === 0,
            display_order: media.Order || index,
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

      // Small delay between batches to be nice to the API
      await new Promise(resolve => setTimeout(resolve, 200));
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
