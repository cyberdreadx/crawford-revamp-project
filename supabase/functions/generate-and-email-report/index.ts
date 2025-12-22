import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

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
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }
    
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const resend = new Resend(RESEND_API_KEY);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Fetching survey data for:', surveyId);

    // Fetch survey data
    const { data: survey, error: surveyError } = await supabase
      .from('luxury_surveys')
      .select('*')
      .eq('id', surveyId)
      .single();

    if (surveyError || !survey) {
      console.error('Survey error:', surveyError);
      throw new Error('Survey not found');
    }

    console.log('Survey found:', survey.name, survey.email);

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

Be specific, professional, and provide genuine value. Use markdown formatting.
Keep the report concise but comprehensive - aim for about 800-1000 words.`;

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
        console.error('Rate limit exceeded');
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      if (response.status === 402) {
        console.error('AI credits exhausted');
        throw new Error("AI credits exhausted. Please contact support.");
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

    console.log('Report generated successfully, sending email...');

    // Convert markdown to HTML for email
    const reportHtml = convertMarkdownToHtml(report);

    // Build property cards HTML
    const propertyCardsHtml = properties?.slice(0, 5).map((p: any) => {
      const primaryImage = p.property_images?.find((img: any) => img.is_primary)?.image_url || p.property_images?.[0]?.image_url;
      return `
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 16px;">
          ${primaryImage ? `<img src="${primaryImage}" alt="${p.title}" style="width: 100%; height: 200px; object-fit: cover;" />` : ''}
          <div style="padding: 16px;">
            <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 18px;">${p.title}</h3>
            <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 14px;">${p.location}</p>
            <p style="margin: 0; color: #0d9488; font-size: 18px; font-weight: bold;">$${p.price?.toLocaleString()}</p>
            <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px;">${p.bedrooms} bed • ${p.bathrooms} bath • ${p.sqft?.toLocaleString()} sqft</p>
          </div>
        </div>
      `;
    }).join('') || '';

    // Send email to the user
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Luxury Property Match Report</title>
        </head>
        <body style="font-family: Georgia, 'Times New Roman', serif; line-height: 1.8; color: #1a1a1a; max-width: 700px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background-color: #ffffff; border-radius: 12px; padding: 40px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 40px; border-bottom: 2px solid #0d9488; padding-bottom: 30px;">
              <h1 style="color: #0d9488; font-size: 28px; margin: 0 0 8px 0;">The Crawford Team</h1>
              <h2 style="color: #1f2937; font-size: 24px; margin: 0 0 16px 0;">Your Luxury Property Match Report</h2>
              <p style="color: #6b7280; font-size: 14px; margin: 0;">Generated on ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <!-- Greeting -->
            <div style="margin-bottom: 30px;">
              <p style="font-size: 16px;">Dear ${survey.name},</p>
              <p style="font-size: 16px; color: #4b5563;">Thank you for completing our Luxury Survey! Based on your responses, our AI has analyzed your preferences and matched you with properties that best fit your lifestyle and investment goals.</p>
            </div>

            <!-- Report Content -->
            <div style="margin-bottom: 40px;">
              ${reportHtml}
            </div>

            <!-- Featured Properties -->
            ${properties && properties.length > 0 ? `
              <div style="margin-bottom: 40px;">
                <h2 style="color: #0d9488; font-size: 22px; margin-bottom: 20px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">Featured Properties</h2>
                ${propertyCardsHtml}
              </div>
            ` : ''}

            <!-- MLS Search CTA -->
            <div style="background-color: #f0fdfa; border-radius: 8px; padding: 24px; margin-bottom: 40px; text-align: center;">
              <h3 style="color: #0d9488; margin: 0 0 12px 0;">Explore All Available Properties</h3>
              <p style="color: #4b5563; margin: 0 0 16px 0; font-size: 14px;">
                Search our complete MLS database for real-time listings across the Tampa Bay area.
              </p>
              <a href="https://www.yourcrawfordteam.com/mls-search" style="display: inline-block; background-color: #0d9488; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">Search MLS Listings</a>
            </div>

            <!-- Contact CTA -->
            <div style="background-color: #1f2937; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 30px;">
              <h3 style="color: #ffffff; margin: 0 0 12px 0;">Ready to Take the Next Step?</h3>
              <p style="color: #d1d5db; margin: 0 0 16px 0; font-size: 14px;">
                Schedule a personalized consultation with our luxury real estate experts.
              </p>
              <a href="mailto:hello@yourcrawfordteam.com?subject=Luxury Property Consultation - ${encodeURIComponent(survey.name)}" style="display: inline-block; background-color: #0d9488; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-right: 12px;">Email Us</a>
              <a href="tel:+17275991944" style="display: inline-block; background-color: transparent; color: #0d9488; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; border: 2px solid #0d9488;">Call (727) 599-1944</a>
            </div>

            <!-- Footer -->
            <div style="text-align: center; border-top: 1px solid #e5e7eb; padding-top: 30px;">
              <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px 0;">The Crawford Team | St. Petersburg, FL</p>
              <p style="color: #6b7280; font-size: 14px; margin: 0;">
                <a href="https://www.yourcrawfordteam.com" style="color: #0d9488; text-decoration: none;">www.yourcrawfordteam.com</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email to user
    const { error: userEmailError } = await resend.emails.send({
      from: "The Crawford Team <onboarding@resend.dev>",
      to: [survey.email],
      subject: `Your Personalized Luxury Property Match Report - ${survey.name}`,
      html: emailHtml,
    });

    if (userEmailError) {
      console.error("Error sending user email:", userEmailError);
      throw new Error("Failed to send email to user");
    }

    console.log('Email sent successfully to:', survey.email);

    // Also send a copy to the team
    const { error: teamEmailError } = await resend.emails.send({
      from: "The Crawford Team <onboarding@resend.dev>",
      to: ["hello@yourcrawfordteam.com"],
      subject: `New Luxury Survey Match Report Generated - ${survey.name}`,
      html: `
        <h2>New Luxury Survey Completed</h2>
        <p><strong>Client:</strong> ${survey.name}</p>
        <p><strong>Email:</strong> ${survey.email}</p>
        <p><strong>Phone:</strong> ${survey.phone || 'Not provided'}</p>
        <p><strong>Price Range:</strong> ${survey.price_range || 'Not specified'}</p>
        <p><strong>Timeline:</strong> ${survey.timeline || 'Not specified'}</p>
        <hr />
        <h3>Generated Report</h3>
        ${reportHtml}
      `,
    });

    if (teamEmailError) {
      console.error("Error sending team email:", teamEmailError);
      // Don't throw - user email was sent successfully
    }

    return new Response(JSON.stringify({ 
      success: true,
      message: "Report generated and emailed successfully"
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating/emailing match report:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Simple markdown to HTML converter
function convertMarkdownToHtml(markdown: string): string {
  let html = markdown
    // Headers
    .replace(/^### (.*$)/gim, '<h3 style="color: #1f2937; font-size: 18px; margin: 24px 0 12px 0;">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 style="color: #0d9488; font-size: 22px; margin: 32px 0 16px 0; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 style="color: #0d9488; font-size: 26px; margin: 32px 0 16px 0;">$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Lists
    .replace(/^\- (.*$)/gim, '<li style="margin-bottom: 8px;">$1</li>')
    .replace(/^\* (.*$)/gim, '<li style="margin-bottom: 8px;">$1</li>')
    .replace(/^(\d+)\. (.*$)/gim, '<li style="margin-bottom: 8px;">$2</li>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p style="color: #4b5563; margin: 16px 0;">')
    .replace(/\n/g, '<br>');

  // Wrap lists
  html = html.replace(/(<li.*<\/li>)+/g, '<ul style="padding-left: 24px; margin: 16px 0;">$&</ul>');
  
  // Wrap in paragraph if not already
  if (!html.startsWith('<h') && !html.startsWith('<p')) {
    html = '<p style="color: #4b5563; margin: 16px 0;">' + html + '</p>';
  }

  return html;
}
