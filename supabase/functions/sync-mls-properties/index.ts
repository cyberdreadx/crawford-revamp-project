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
  CountyOrParish?: string;
}

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

function passesFilters(prop: MLSProperty, minPrice?: number, maxPrice?: number, county?: string): boolean {
  const price = prop.ListPrice || 0;
  if (minPrice && price < minPrice) return false;
  if (maxPrice && price > maxPrice) return false;
  if (county) {
    const propCounty = (prop.CountyOrParish || '').toUpperCase();
    if (!propCounty.includes(county.toUpperCase())) return false;
  }
  return true;
}

function isTestListing(prop: MLSProperty): boolean {
  const address = (prop.UnparsedAddress || '').toLowerCase();
  const remarks = (prop.PublicRemarks || '').toLowerCase();
  return address.includes('test') || remarks.includes('test listing') || remarks.includes('do not show');
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
    const { 
      syncType = 'full', 
      limit = 100,
      minPrice,
      maxPrice,
      county,
      propertyTypes,
      startOffset = 0  // Allow resuming from a specific offset
    } = await req.json().catch(() => ({}));

    if (!mlsGridToken || !mlsGridBaseUrl) {
      return new Response(
        JSON.stringify({ success: false, error: 'MLS Grid credentials not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const { data: syncLog } = await supabase
      .from('mls_sync_log')
      .insert({
        sync_type: syncType,
        status: 'running',
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    const syncLogId = syncLog?.id;
    const hasLocalFilters = minPrice || maxPrice || county;

    console.log(`Sync starting - limit: ${limit}, minPrice: ${minPrice}, county: ${county}, offset: ${startOffset}`);

    // Build API filter
    const activeStatusFilter = "StandardStatus eq 'Active' or StandardStatus eq 'Active Under Contract' or StandardStatus eq 'Pending' or StandardStatus eq 'Coming Soon'";
    const filterParts: string[] = [`(${activeStatusFilter})`];
    
    if (propertyTypes?.length > 0) {
      const typeFilters = propertyTypes.map((t: string) => `PropertyType eq '${t}'`).join(' or ');
      filterParts.push(`(${typeFilters})`);
    }
    
    const filter = `&$filter=${filterParts.join(' and ')}`;
    console.log('Filter:', filter);

    // Use smaller batch for faster processing
    const batchSize = 200;
    let skip = startOffset;
    let totalFetched = 0;
    let recordsCreated = 0;
    let recordsUpdated = 0;
    let recordsMatched = 0;
    const errors: Array<{ listingId: string; error: string }> = [];
    let hasMore = true;
    
    // Track how many we need to save vs skip (for upsert optimization)
    const propertiesToUpsert: any[] = [];

    while (hasMore && recordsMatched < limit) {
      const url = `${mlsGridBaseUrl}/Property?$top=${batchSize}&$skip=${skip}${filter}`;
      console.log(`Batch at skip=${skip}, matched so far: ${recordsMatched}`);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${mlsGridToken}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error:', response.status);
        
        if (syncLogId) {
          await supabase
            .from('mls_sync_log')
            .update({
              status: 'failed',
              completed_at: new Date().toISOString(),
              errors: [{ message: `API error: ${response.status}`, offset: skip }]
            })
            .eq('id', syncLogId);
        }

        return new Response(
          JSON.stringify({ success: false, error: `API error: ${response.status}`, lastOffset: skip }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
        );
      }

      const data = await response.json();
      const properties: MLSProperty[] = data.value || [];
      totalFetched += properties.length;

      // Filter and collect properties
      for (const prop of properties) {
        if (recordsMatched >= limit) break;
        if (isTestListing(prop)) continue;
        if (hasLocalFilters && !passesFilters(prop, minPrice, maxPrice, county)) continue;
        
        recordsMatched++;
        
        propertiesToUpsert.push({
          listing_id: prop.ListingId,
          title: prop.UnparsedAddress || `${prop.City}, ${prop.StateOrProvince}`,
          price: prop.ListPrice || 0,
          bedrooms: prop.BedroomsTotal || 0,
          bathrooms: prop.BathroomsTotalInteger || 0,
          sqft: prop.LivingArea || 0,
          year_built: prop.YearBuilt,
          location: [prop.UnparsedAddress, prop.City, prop.StateOrProvince, prop.PostalCode].filter(Boolean).join(', '),
          property_type: mapPropertyType(prop.PropertyType),
          status: mapStatus(prop.StandardStatus),
          description: prop.PublicRemarks,
          latitude: prop.Latitude,
          longitude: prop.Longitude,
          days_on_market: prop.DaysOnMarket,
          original_list_price: prop.OriginalListPrice,
          virtual_tour_url: prop.VirtualTourURLUnbranded,
          listing_agent_mls_id: prop.ListAgentMlsId,
          listing_office_mls_id: prop.ListOfficeMlsId,
          modification_timestamp: prop.ModificationTimestamp,
          originating_system_name: prop.OriginatingSystemName || 'Stellar MLS',
          is_mls_listing: true,
          is_featured: false,
          mls_status: prop.StandardStatus,
          mls_raw_data: prop,
        });
      }

      // Batch upsert every 50 properties to save time
      if (propertiesToUpsert.length >= 50) {
        const batch = propertiesToUpsert.splice(0, 50);
        const { error: upsertError, data: upsertData } = await supabase
          .from('properties')
          .upsert(batch, { onConflict: 'listing_id', ignoreDuplicates: false })
          .select('id');
        
        if (upsertError) {
          console.error('Upsert error:', upsertError.message);
          errors.push({ listingId: 'batch', error: upsertError.message });
        } else {
          recordsCreated += batch.length;
        }
      }

      hasMore = properties.length === batchSize;
      skip += batchSize;

      // Safety limit
      if (totalFetched > 30000) {
        console.log('Safety limit reached');
        break;
      }
    }

    // Upsert remaining properties
    if (propertiesToUpsert.length > 0) {
      const { error: upsertError } = await supabase
        .from('properties')
        .upsert(propertiesToUpsert, { onConflict: 'listing_id', ignoreDuplicates: false });
      
      if (upsertError) {
        errors.push({ listingId: 'final_batch', error: upsertError.message });
      } else {
        recordsCreated += propertiesToUpsert.length;
      }
    }

    // Update sync log
    if (syncLogId) {
      await supabase
        .from('mls_sync_log')
        .update({
          status: errors.length > 0 ? 'completed_with_errors' : 'completed',
          completed_at: new Date().toISOString(),
          records_processed: totalFetched,
          records_created: recordsMatched,
          records_updated: recordsUpdated,
          errors: errors.length > 0 ? errors.slice(0, 20) : null
        })
        .eq('id', syncLogId);
    }

    console.log(`Done: ${recordsMatched} matched, ${recordsCreated} saved, fetched ${totalFetched} from API`);

    return new Response(
      JSON.stringify({
        success: true,
        syncLogId,
        totalFetched,
        recordsMatched,
        recordsSaved: recordsCreated,
        errorCount: errors.length,
        lastOffset: skip,
        // If we didn't find enough matches, provide next offset for continuation
        nextOffset: recordsMatched < limit && hasMore ? skip : null,
        message: recordsMatched < limit 
          ? `Found ${recordsMatched} matching properties. Run again with startOffset=${skip} to continue.`
          : `Successfully synced ${recordsMatched} properties.`
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
