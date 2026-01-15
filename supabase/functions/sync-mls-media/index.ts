import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MLSMedia {
  MediaKey: string;
  ResourceRecordKeyNumeric: string;
  MediaURL: string;
  Order: number;
  MediaCategory: string;
  ImageWidth?: number;
  ImageHeight?: number;
  ShortDescription?: string;
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

    // Build filter for Media endpoint - fetch media for all our listing IDs
    const listingIds = Array.from(listingIdMap.keys());
    
    let totalMediaSynced = 0;
    let propertiesWithMedia = 0;
    const errors: string[] = [];

    // Process in batches of 10 properties to avoid overwhelming the API
    const batchSize = 10;
    for (let i = 0; i < listingIds.length; i += batchSize) {
      const batch = listingIds.slice(i, i + batchSize);
      
      // Build OData filter for batch
      const filterParts = batch.map(id => `ResourceRecordKeyNumeric eq '${id}'`);
      const filter = filterParts.join(' or ');
      
      const mediaUrl = `${mlsBaseUrl}/Media?$filter=(${filter}) and MediaCategory eq 'Photo'&$orderby=Order&$top=500`;
      
      console.log(`Fetching media batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(listingIds.length/batchSize)}`);
      
      try {
        const response = await fetch(mediaUrl, {
          headers: {
            'Authorization': `Bearer ${mlsAccessToken}`,
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`MLS Grid Media API error: ${response.status} - ${errorText}`);
          errors.push(`Batch ${Math.floor(i/batchSize) + 1}: API error ${response.status}`);
          continue;
        }

        const data = await response.json();
        const mediaItems: MLSMedia[] = data.value || [];
        
        console.log(`Received ${mediaItems.length} media items for batch`);

        // Group media by listing_id
        const mediaByListing = new Map<string, MLSMedia[]>();
        mediaItems.forEach(media => {
          const listingId = media.ResourceRecordKeyNumeric;
          if (!mediaByListing.has(listingId)) {
            mediaByListing.set(listingId, []);
          }
          mediaByListing.get(listingId)!.push(media);
        });

        // Process each property's media
        for (const [listingId, mediaList] of mediaByListing) {
          const propertyId = listingIdMap.get(listingId);
          if (!propertyId) continue;

          // Sort by Order
          mediaList.sort((a, b) => (a.Order || 0) - (b.Order || 0));

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
          const imagesToInsert = mediaList.map((media, index) => ({
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
