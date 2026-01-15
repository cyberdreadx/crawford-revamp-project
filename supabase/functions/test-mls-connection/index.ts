import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const mlsGridToken = Deno.env.get('MLS_GRID_ACCESS_TOKEN');
    const mlsGridBaseUrl = Deno.env.get('MLS_GRID_BASE_URL');

    if (!mlsGridToken || !mlsGridBaseUrl) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'MLS Grid credentials not configured',
          details: {
            hasToken: !!mlsGridToken,
            hasBaseUrl: !!mlsGridBaseUrl
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log('Testing MLS Grid connection to:', mlsGridBaseUrl);

    // Test connection by fetching a small sample of properties
    const response = await fetch(
      `${mlsGridBaseUrl}/Property?$top=5&$select=ListingId,ListPrice,City,StateOrProvince,StandardStatus`,
      {
        headers: {
          'Authorization': `Bearer ${mlsGridToken}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MLS Grid API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `MLS Grid API returned ${response.status}`,
          details: errorText
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
      );
    }

    const data = await response.json();
    const properties = data.value || [];
    
    console.log('Successfully fetched', properties.length, 'sample properties');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'MLS Grid connection successful',
        sampleCount: properties.length,
        sampleData: properties,
        apiUrl: mlsGridBaseUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error testing MLS Grid connection:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
