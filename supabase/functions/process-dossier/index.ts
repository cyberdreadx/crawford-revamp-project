import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('=== FUNCTION START ===');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing request...');
    
    // Try to parse formData but don't fail if it doesn't work
    let hasFile = false;
    try {
      const formData = await req.formData();
      const file = formData.get('file') as File;
      hasFile = !!file;
      console.log('File present:', hasFile);
      if (file) {
        console.log('File details:', { name: file.name, type: file.type, size: file.size });
      }
    } catch (formError) {
      console.log('FormData parsing failed:', formError.message);
    }
    
    // Simple success response for testing
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Function is working!',
        hasFile: hasFile,
        timestamp: new Date().toISOString()
      }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Function error',
        message: error.message
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});