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
  console.log('=== EDGE FUNCTION CALLED ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting dossier processing...');
    console.log('Environment check:');
    console.log('- OpenAI API Key exists:', !!openAIApiKey);
    console.log('- Supabase URL exists:', !!supabaseUrl);
    console.log('- Service key exists:', !!supabaseServiceKey);
    
    const formData = await req.formData();
    console.log('FormData parsed successfully');
    
    const file = formData.get('file') as File;
    const propertyId = formData.get('propertyId') as string;
    
    console.log('File info:', file ? { name: file.name, type: file.type, size: file.size } : 'No file');
    console.log('Property ID:', propertyId);

    if (!file) {
      console.error('No file provided');
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured. Please add your OpenAI API key to Supabase secrets.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing file:', file.name, 'Type:', file.type, 'Size:', file.size);

    let extractedText = '';
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';

    if (isImage) {
      console.log('Processing image file with OpenAI Vision...');
      
      // Convert image to base64 for OpenAI Vision API
      const arrayBuffer = await file.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));

      // Use OpenAI Vision API for images
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
              content: `Extract property information from this luxury property dossier image and return it as clean JSON. Extract these fields if available:
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
        console.error('OpenAI Vision API error:', errorText);
        return new Response(
          JSON.stringify({ error: 'Failed to process image with AI', details: errorText }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const openAIData = await openAIResponse.json();
      extractedText = openAIData.choices[0].message.content;

    } else if (isPDF) {
      console.log('Processing PDF file...');
      
      // For PDFs, we'll use a simpler approach - just ask the user to upload an image of the dossier
      return new Response(
        JSON.stringify({ 
          error: 'PDF processing not supported yet. Please upload an image (PNG, JPG) of your dossier instead.' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } else {
      console.error('Unsupported file type:', file.type);
      return new Response(
        JSON.stringify({ error: 'Unsupported file type. Please upload an image (PNG, JPG) of your dossier.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('AI extracted text:', extractedText);

    let propertyData;
    try {
      propertyData = JSON.parse(extractedText);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.log('Raw AI response:', extractedText);
      
      // Try to extract JSON from the response if it's wrapped in markdown
      const jsonMatch = extractedText.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
      if (jsonMatch) {
        try {
          propertyData = JSON.parse(jsonMatch[1]);
        } catch (e) {
          return new Response(
            JSON.stringify({ error: 'Failed to parse AI response', details: extractedText }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        return new Response(
          JSON.stringify({ error: 'Failed to parse AI response', details: extractedText }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log('Parsed property data:', propertyData);

    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Clean and validate the data
    const cleanedData = {
      title: propertyData.title || 'Untitled Property',
      tagline: propertyData.tagline || null,
      location: propertyData.location || 'Location TBD',
      price: propertyData.price ? Number(propertyData.price) : 0,
      bedrooms: propertyData.bedrooms ? Number(propertyData.bedrooms) : 1,
      bathrooms: propertyData.bathrooms ? Number(propertyData.bathrooms) : 1,
      sqft: propertyData.sqft ? Number(propertyData.sqft) : 1000,
      year_built: propertyData.year_built ? Number(propertyData.year_built) : null,
      description: propertyData.description || null,
      unit_features: Array.isArray(propertyData.unit_features) ? propertyData.unit_features : null,
      amenities: Array.isArray(propertyData.amenities) ? propertyData.amenities : null,
      lifestyle_events: Array.isArray(propertyData.lifestyle_events) ? propertyData.lifestyle_events : null,
      agent_name: propertyData.agent_name || null,
      agent_title: propertyData.agent_title || null,
      agent_phone: propertyData.agent_phone || null,
      agent_email: propertyData.agent_email || null,
      agent_image_url: propertyData.agent_image_url || null,
    };

    console.log('Cleaned property data:', cleanedData);

    // If propertyId is provided, update existing property, otherwise create new one
    let result;
    if (propertyId && propertyId !== 'new') {
      console.log('Updating existing property:', propertyId);
      const { data, error } = await supabase
        .from('properties')
        .update({
          ...cleanedData,
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
          ...cleanedData,
          property_type: 'Luxury',
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
        extractedData: cleanedData 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('=== CRITICAL ERROR in process-dossier ===');
    console.error('Error type:', typeof error);
    console.error('Error name:', error?.name);
    console.error('Error message:', error?.message);
    console.error('Error stack:', error?.stack);
    console.error('Full error object:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error?.message || 'Unknown error',
        errorType: error?.name || 'UnknownError'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});