import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { surveyId } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch survey data
    const { data: survey, error: surveyError } = await supabase
      .from('luxury_surveys')
      .select('*')
      .eq('id', surveyId)
      .single();

    if (surveyError || !survey) {
      throw new Error('Survey not found');
    }

    // Fetch all luxury properties
    const { data: properties, error: propertiesError } = await supabase
      .from('properties')
      .select(`
        *,
        property_images (image_url, is_primary)
      `)
      .eq('is_featured', true);

    if (propertiesError) {
      console.error('Error fetching properties:', propertiesError);
    }

    // Build AI prompt with survey data and properties
    const systemPrompt = `You are a luxury real estate advisor for The Crawford Team in St. Petersburg, Florida. 
Your role is to analyze client preferences and match them with available luxury properties, providing personalized recommendations.

You have access to the client's survey responses and current luxury property listings. 
Generate a comprehensive, personalized property match report that includes:

1. **Client Profile Summary**: Summarize their preferences, lifestyle needs, and priorities
2. **Market Insights**: Brief overview of the St. Petersburg luxury market relevant to their criteria
3. **Top Property Matches**: Analyze each property against their preferences and rank them with match scores (0-100%)
4. **Personalized Recommendations**: Specific advice based on their timeline, budget, and preferences
5. **Next Steps**: Actionable recommendations for their property search

Be specific, professional, and provide genuine value. Use markdown formatting.`;

    const userPrompt = `
## Client Survey Responses

**Name:** ${survey.name}
**Email:** ${survey.email}
**Phone:** ${survey.phone || 'Not provided'}

**Service Types:** ${survey.service_types?.join(', ') || 'Not specified'}
**Advisor Qualities Valued:** ${survey.advisor_qualities?.join(', ') || 'Not specified'}
**Property Types Interested In:** ${survey.property_types?.join(', ') || 'Not specified'}
**Lifestyle Preferences:** ${survey.lifestyle_preferences?.join(', ') || 'Not specified'}
**Value Factors:** ${survey.value_factors?.join(', ') || 'Not specified'}
**Price Range:** ${survey.price_range || 'Not specified'}
**Preferred Locations:** ${survey.preferred_locations?.join(', ') || 'Not specified'}
**Timeline:** ${survey.timeline || 'Not specified'}
**Contact Preference:** ${survey.contact_preference?.join(', ') || 'Not specified'}

## Available Luxury Properties

${properties?.map((p: any) => `
### ${p.title}
- **Location:** ${p.location}
- **Price:** $${p.price?.toLocaleString()}
- **Type:** ${p.property_type}
- **Bedrooms:** ${p.bedrooms} | **Bathrooms:** ${p.bathrooms}
- **Square Feet:** ${p.sqft?.toLocaleString()}
- **Year Built:** ${p.year_built || 'N/A'}
- **Key Features:** ${p.key_features?.join(', ') || 'N/A'}
- **Amenities:** ${p.amenities?.join(', ') || 'N/A'}
- **Lifestyle Events:** ${p.lifestyle_events?.join(', ') || 'N/A'}
- **Description:** ${p.description || 'N/A'}
`).join('\n') || 'No properties currently available'}

Please generate a comprehensive property match report for this client.`;

    console.log('Sending request to Lovable AI...');

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please contact support." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const report = data.choices?.[0]?.message?.content;

    if (!report) {
      throw new Error("No report generated");
    }

    console.log('Report generated successfully');

    return new Response(JSON.stringify({ 
      report,
      survey,
      properties: properties || []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating match report:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
