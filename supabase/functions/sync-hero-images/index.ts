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

    const { folderId } = await req.json()
    
    if (!folderId) {
      return new Response(
        JSON.stringify({ error: 'Google Drive folder ID is required' }),
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

    console.log('Fetching images from Google Drive folder:', folderId)

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
          folderId: folderId
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Clear existing hero images
    const { error: deleteError } = await supabaseClient
      .from('hero_images')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (deleteError) {
      console.error('Error clearing existing hero images:', deleteError)
    }

    // Insert new hero images from Google Drive
    const heroImages = files.map((file, index) => ({
      title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
      description: `Image from Google Drive: ${file.name}`,
      image_url: `https://drive.google.com/uc?id=${file.id}`,
      display_order: index + 1,
      is_active: true
    }))

    const { data, error } = await supabaseClient
      .from('hero_images')
      .insert(heroImages)
      .select()

    if (error) {
      console.error('Error inserting hero images:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to save images to database' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Successfully synced ${data.length} hero images`)

    return new Response(
      JSON.stringify({ 
        message: 'Successfully synced hero images from Google Drive',
        count: data.length,
        images: data
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in sync-hero-images function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})