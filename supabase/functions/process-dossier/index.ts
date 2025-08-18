import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExtractedData {
  title: string;
  location: string;
  price: string;
  bedrooms: number;
  bathrooms: number;
  area: string;
  propertyType: string;
  description: string;
  features: string[];
  agent: {
    name: string;
    phone: string;
    email: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting dossier processing...');
    
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const propertyId = formData.get('propertyId') as string;

    if (!file) {
      throw new Error('No file provided');
    }

    console.log('Processing file:', file.name, 'Type:', file.type, 'Size:', file.size);

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const dataURL = `data:${file.type};base64,${base64}`;

    console.log('Sending to OpenAI Vision...');

    // Call OpenAI Vision API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a property data extraction expert. Analyze the property dossier image and extract all relevant information. Return a JSON object with this exact structure:
{
  "title": "Property title or address",
  "location": "Full address or location",
  "price": "Price as shown (keep original format)",
  "bedrooms": number,
  "bathrooms": number,
  "area": "Area with units (e.g., '1,200 sq ft')",
  "propertyType": "Type (e.g., 'Condo', 'House', 'Apartment')",
  "description": "Property description",
  "features": ["feature1", "feature2", ...],
  "agent": {
    "name": "Agent name",
    "phone": "Phone number",
    "email": "Email address"
  }
}

If information is not available, use empty strings for text fields, 0 for numbers, and empty arrays for lists.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Please extract all property information from this real estate dossier image.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: dataURL
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const extractedText = data.choices[0].message.content;
    
    console.log('Raw OpenAI response:', extractedText);

    // Parse the JSON response
    let extractedData: ExtractedData;
    try {
      extractedData = JSON.parse(extractedText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response as JSON:', parseError);
      // Fallback extraction
      extractedData = {
        title: "Property details extracted",
        location: "Location not specified",
        price: "Price not specified",
        bedrooms: 0,
        bathrooms: 0,
        area: "Area not specified",
        propertyType: "Property",
        description: extractedText.substring(0, 500),
        features: [],
        agent: {
          name: "Agent not specified",
          phone: "",
          email: ""
        }
      };
    }

    console.log('Extracted data:', extractedData);

    return new Response(
      JSON.stringify({ 
        success: true,
        extractedData,
        message: 'Property data extracted successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error processing dossier:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Processing failed',
        message: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});