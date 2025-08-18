import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const propertyId = formData.get('propertyId') as string;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing file:', file.name, 'Size:', file.size);

    // Convert file to base64 for OpenAI Vision API
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

    console.log('Sending to OpenAI for analysis...');

    // Use OpenAI Vision API to extract text and data from PDF/image
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: `You are a real estate data extraction expert. Extract property information from luxury property dossiers and return it as JSON. 

            Extract these fields if available:
            - title: Property name/title
            - tagline: Marketing tagline or subtitle
            - location: Full address or location
            - price: Numeric price value (extract numbers only, no $ or commas)
            - bedrooms: Number of bedrooms
            - bathrooms: Number of bathrooms (can be decimal like 2.5)
            - sqft: Square footage (numbers only)
            - year_built: Year the property was built
            - description: Property description or summary
            - unit_features: Array of unit-specific features
            - amenities: Array of building/community amenities
            - lifestyle_events: Array of lifestyle events or activities mentioned
            - agent_name: Agent or contact person name
            - agent_title: Agent title/position
            - agent_phone: Agent phone number
            - agent_email: Agent email address

            Return ONLY valid JSON without any markdown formatting or explanations.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all property information from this luxury property dossier:'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${file.type};base64,${base64}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_completion_tokens: 2000
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to process with AI', details: errorText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const openAIData = await openAIResponse.json();
    console.log('OpenAI response:', openAIData);

    const extractedText = openAIData.choices[0].message.content;
    console.log('Extracted data:', extractedText);

    let propertyData;
    try {
      propertyData = JSON.parse(extractedText);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      return new Response(
        JSON.stringify({ error: 'Failed to parse AI response', details: extractedText }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // If propertyId is provided, update existing property, otherwise create new one
    let result;
    if (propertyId && propertyId !== 'new') {
      console.log('Updating existing property:', propertyId);
      const { data, error } = await supabase
        .from('properties')
        .update({
          ...propertyData,
          updated_at: new Date().toISOString()
        })
        .eq('id', propertyId)
        .select()
        .single();

      if (error) {
        console.error('Error updating property:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to update property', details: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      result = data;
    } else {
      console.log('Creating new property');
      const { data, error } = await supabase
        .from('properties')
        .insert([{
          ...propertyData,
          property_type: propertyData.property_type || 'Luxury',
          status: 'For Sale',
          is_featured: true
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating property:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to create property', details: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      result = data;
    }

    console.log('Property saved successfully:', result.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        property: result,
        extractedData: propertyData 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in process-dossier function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});