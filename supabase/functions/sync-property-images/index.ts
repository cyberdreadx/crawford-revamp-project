import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GoogleDriveFile {
  id: string
  name: string
  mimeType: string
  webViewLink: string
  webContentLink: string
  thumbnailLink?: string
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { folderId, propertyId } = await req.json()
    
    if (!folderId || !propertyId) {
      return new Response(
        JSON.stringify({ error: 'Google Drive folder ID and property ID are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const apiKey = Deno.env.get('GOOGLE_DRIVE_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Google Drive API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Fetching images from Google Drive folder:', folderId, 'for property:', propertyId)

    // Fetch images from Google Drive folder
    const driveResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q='${folderId}'+in+parents+and+mimeType+contains+'image/'&fields=files(id,name,mimeType,webViewLink,webContentLink,thumbnailLink)&key=${apiKey}`
    )

    if (!driveResponse.ok) {
      const errorText = await driveResponse.text()
      console.error('Google Drive API error:', driveResponse.status, errorText)
      return new Response(
        JSON.stringify({ error: `Google Drive API error: ${driveResponse.status}. ${errorText}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const driveData = await driveResponse.json()
    const files: GoogleDriveFile[] = driveData.files || []

    console.log(`Found ${files.length} images in Google Drive folder`)
    console.log('Files:', files.map(f => ({ name: f.name, mimeType: f.mimeType })))

    if (files.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No images found in the specified folder. Make sure the folder contains images and is publicly accessible.',
          count: 0,
          folderId: folderId,
          propertyId: propertyId
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Clear existing property images
    const { error: deleteError } = await supabaseClient
      .from('property_images')
      .delete()
      .eq('property_id', propertyId)

    if (deleteError) {
      console.error('Error clearing existing property images:', deleteError)
    }

    // Insert new property images from Google Drive
    const propertyImages = files.map((file, index) => {
      // Use thumbnail API for better performance
      let imageUrl = `https://drive.google.com/thumbnail?id=${file.id}&sz=w2000`;
      
      return {
        property_id: propertyId,
        image_url: imageUrl,
        is_primary: index === 0, // First image is primary
        display_order: index + 1
      };
    })

    const { data, error } = await supabaseClient
      .from('property_images')
      .insert(propertyImages)
      .select()

    if (error) {
      console.error('Error inserting property images:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to save images to database' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Successfully synced ${data.length} property images`)

    return new Response(
      JSON.stringify({ 
        message: 'Successfully synced property images from Google Drive',
        count: data.length,
        propertyId: propertyId,
        images: data
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in sync-property-images function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})