import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Testing OpenAI API key...');

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    // If no API key provided in request body, check environment
    let apiKeyToTest = openAIApiKey;
    
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        if (body.apiKey) {
          apiKeyToTest = body.apiKey;
        }
      } catch (e) {
        // If body parsing fails, continue with env key
      }
    }

    if (!apiKeyToTest) {
      console.log('No OpenAI API key found');
      return new Response(
        JSON.stringify({ 
          status: 'not-configured',
          message: 'OpenAI API key not configured'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Testing API key with OpenAI...');

    // Test the API key with a simple request to OpenAI
    const testResponse = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKeyToTest}`,
        'Content-Type': 'application/json',
      },
    });

    if (testResponse.ok) {
      console.log('OpenAI API key is valid');
      return new Response(
        JSON.stringify({ 
          status: 'connected',
          valid: true,
          message: 'OpenAI API key is working correctly'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      const errorText = await testResponse.text();
      console.error('OpenAI API key test failed:', testResponse.status, errorText);
      
      return new Response(
        JSON.stringify({ 
          status: 'error',
          valid: false,
          message: `API key test failed: ${testResponse.status}`,
          details: errorText
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

  } catch (error) {
    console.error('Error testing OpenAI API key:', error);
    return new Response(
      JSON.stringify({ 
        status: 'error',
        valid: false,
        message: 'Failed to test API key',
        details: error.message
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});