import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MLSProperty {
  ListingId: string;
  ListPrice?: number;
  BedroomsTotal?: number;
  BathroomsTotalInteger?: number;
  LivingArea?: number;
  YearBuilt?: number;
  UnparsedAddress?: string;
  City?: string;
  StateOrProvince?: string;
  PostalCode?: string;
  PropertyType?: string;
  StandardStatus?: string;
  PublicRemarks?: string;
  Latitude?: number;
  Longitude?: number;
  DaysOnMarket?: number;
  OriginalListPrice?: number;
  VirtualTourURLUnbranded?: string;
  ListAgentMlsId?: string;
  ListOfficeMlsId?: string;
  ModificationTimestamp?: string;
  OriginatingSystemName?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const mlsGridToken = Deno.env.get('MLS_GRID_ACCESS_TOKEN');
  const mlsGridBaseUrl = Deno.env.get('MLS_GRID_BASE_URL');

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { syncType = 'full', limit = 100 } = await req.json().catch(() => ({}));

    if (!mlsGridToken || !mlsGridBaseUrl) {
      return new Response(
        JSON.stringify({ success: false, error: 'MLS Grid credentials not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Create sync log entry
    const { data: syncLog, error: syncLogError } = await supabase
      .from('mls_sync_log')
      .insert({
        sync_type: syncType,
        status: 'running',
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (syncLogError) {
      console.error('Error creating sync log:', syncLogError);
    }

    const syncLogId = syncLog?.id;

    console.log(`Starting ${syncType} sync with limit ${limit}`);

    let allProperties: MLSProperty[] = [];
    let skip = 0;
    const top = Math.min(limit, 5000); // MLS Grid max is 5000 per request
    let hasMore = true;

    // Build filter - always exclude Closed/Sold properties
    // Active statuses we want: Active, Active Under Contract, Pending, Coming Soon
    const activeStatusFilter = "StandardStatus eq 'Active' or StandardStatus eq 'Active Under Contract' or StandardStatus eq 'Pending' or StandardStatus eq 'Coming Soon'";
    
    let filter = `&$filter=(${activeStatusFilter})`;
    
    if (syncType === 'incremental') {
      // Get last successful sync timestamp
      const { data: lastSync } = await supabase
        .from('mls_sync_log')
        .select('completed_at')
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

      if (lastSync?.completed_at) {
        filter = `&$filter=(${activeStatusFilter}) and ModificationTimestamp gt ${lastSync.completed_at}`;
        console.log('Incremental sync from:', lastSync.completed_at);
      }
    }
    
    console.log('Using filter:', filter);

    // Fetch properties with pagination
    while (hasMore && allProperties.length < limit) {
      const url = `${mlsGridBaseUrl}/Property?$top=${top}&$skip=${skip}${filter}`;
      console.log('Fetching:', url);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${mlsGridToken}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('MLS Grid API error:', response.status, errorText);
        
        // Update sync log with error
        if (syncLogId) {
          await supabase
            .from('mls_sync_log')
            .update({
              status: 'failed',
              completed_at: new Date().toISOString(),
              errors: [{ message: `API error: ${response.status}`, details: errorText }]
            })
            .eq('id', syncLogId);
        }

        return new Response(
          JSON.stringify({ success: false, error: `MLS Grid API error: ${response.status}` }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
        );
      }

      const data = await response.json();
      const properties = data.value || [];
      
      allProperties = [...allProperties, ...properties];
      console.log(`Fetched ${properties.length} properties, total: ${allProperties.length}`);

      // Check if there are more results
      hasMore = properties.length === top && allProperties.length < limit;
      skip += top;
    }

    // Limit to requested amount
    allProperties = allProperties.slice(0, limit);

    console.log(`Processing ${allProperties.length} properties`);

    let recordsCreated = 0;
    let recordsUpdated = 0;
    const errors: Array<{ listingId: string; error: string }> = [];

    // Process each property
    for (const mlsProp of allProperties) {
      try {
        // Map MLS property to our schema
        const propertyData = {
          listing_id: mlsProp.ListingId,
          title: mlsProp.UnparsedAddress || `${mlsProp.City}, ${mlsProp.StateOrProvince}`,
          price: mlsProp.ListPrice || 0,
          bedrooms: mlsProp.BedroomsTotal || 0,
          bathrooms: mlsProp.BathroomsTotalInteger || 0,
          sqft: mlsProp.LivingArea || 0,
          year_built: mlsProp.YearBuilt,
          location: [mlsProp.UnparsedAddress, mlsProp.City, mlsProp.StateOrProvince, mlsProp.PostalCode]
            .filter(Boolean)
            .join(', '),
          property_type: mapPropertyType(mlsProp.PropertyType),
          status: mapStatus(mlsProp.StandardStatus),
          description: mlsProp.PublicRemarks,
          latitude: mlsProp.Latitude,
          longitude: mlsProp.Longitude,
          days_on_market: mlsProp.DaysOnMarket,
          original_list_price: mlsProp.OriginalListPrice,
          virtual_tour_url: mlsProp.VirtualTourURLUnbranded,
          listing_agent_mls_id: mlsProp.ListAgentMlsId,
          listing_office_mls_id: mlsProp.ListOfficeMlsId,
          modification_timestamp: mlsProp.ModificationTimestamp,
          originating_system_name: mlsProp.OriginatingSystemName || 'Stellar MLS',
          is_mls_listing: true,
          is_featured: false,
          mls_status: mlsProp.StandardStatus,
          mls_raw_data: mlsProp,
        };

        // Check if property already exists
        const { data: existing } = await supabase
          .from('properties')
          .select('id')
          .eq('listing_id', mlsProp.ListingId)
          .maybeSingle();

        if (existing) {
          // Update existing property
          const { error: updateError } = await supabase
            .from('properties')
            .update(propertyData)
            .eq('id', existing.id);

          if (updateError) {
            console.error('Error updating property:', mlsProp.ListingId, updateError);
            errors.push({ listingId: mlsProp.ListingId, error: updateError.message });
          } else {
            recordsUpdated++;
          }
        } else {
          // Insert new property
          const { error: insertError } = await supabase
            .from('properties')
            .insert(propertyData);

          if (insertError) {
            console.error('Error inserting property:', mlsProp.ListingId, insertError);
            errors.push({ listingId: mlsProp.ListingId, error: insertError.message });
          } else {
            recordsCreated++;
          }
        }
      } catch (propError) {
        console.error('Error processing property:', mlsProp.ListingId, propError);
        errors.push({ listingId: mlsProp.ListingId, error: propError.message });
      }
    }

    // Update sync log
    if (syncLogId) {
      await supabase
        .from('mls_sync_log')
        .update({
          status: errors.length > 0 ? 'completed_with_errors' : 'completed',
          completed_at: new Date().toISOString(),
          records_processed: allProperties.length,
          records_created: recordsCreated,
          records_updated: recordsUpdated,
          errors: errors.length > 0 ? errors : null
        })
        .eq('id', syncLogId);
    }

    console.log(`Sync complete: ${recordsCreated} created, ${recordsUpdated} updated, ${errors.length} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        syncLogId,
        recordsProcessed: allProperties.length,
        recordsCreated,
        recordsUpdated,
        errorCount: errors.length,
        errors: errors.slice(0, 10) // Return first 10 errors
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Sync error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Map MLS property types to our schema
function mapPropertyType(mlsType?: string): string {
  if (!mlsType) return 'House';
  
  const typeMap: Record<string, string> = {
    'Residential': 'House',
    'Single Family Residence': 'House',
    'Condominium': 'Condo',
    'Condo': 'Condo',
    'Townhouse': 'Townhouse',
    'Land': 'Land',
    'Commercial': 'Commercial',
    'Multi Family': 'Multi-Family',
    'Manufactured Home': 'House',
  };
  
  return typeMap[mlsType] || 'House';
}

// Map MLS status to our schema
function mapStatus(mlsStatus?: string): string {
  if (!mlsStatus) return 'For Sale';
  
  const statusMap: Record<string, string> = {
    'Active': 'For Sale',
    'Active Under Contract': 'Pending',
    'Pending': 'Pending',
    'Closed': 'Sold',
    'Sold': 'Sold',
    'Coming Soon': 'Coming Soon',
    'Withdrawn': 'Off Market',
    'Expired': 'Off Market',
    'Canceled': 'Off Market',
  };
  
  return statusMap[mlsStatus] || 'For Sale';
}
