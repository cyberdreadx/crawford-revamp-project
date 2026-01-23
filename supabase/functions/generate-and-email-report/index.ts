import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Parse price range from survey to min/max values
function parsePriceRange(priceRange: string | null): { min: number; max: number } {
  if (!priceRange) return { min: 0, max: Infinity };
  
  const ranges: Record<string, { min: number; max: number }> = {
    '$750,000 - $1.2M': { min: 750000, max: 1200000 },
    '$1.2M - $2.5M': { min: 1200000, max: 2500000 },
    '$2.5M - $5M': { min: 2500000, max: 5000000 },
    '$5M - $10M': { min: 5000000, max: 10000000 },
    '$10M+': { min: 10000000, max: Infinity },
    'Open / based on value': { min: 0, max: Infinity },
  };
  
  return ranges[priceRange] || { min: 0, max: Infinity };
}

// Map location preferences to search keywords
function getLocationKeywords(locations: string[] | null): string[] {
  if (!locations || locations.length === 0) return [];
  
  const locationMap: Record<string, string[]> = {
    'Downtown St. Petersburg': ['ST PETERSBURG', 'DOWNTOWN', 'DTSP'],
    'Snell Isle': ['SNELL ISLE', 'SNELL'],
    'Old Northeast': ['OLD NORTHEAST', 'ONE'],
    'Kenwood': ['KENWOOD', 'HISTORIC KENWOOD'],
    'Beach communities': ['BEACH', 'PASS-A-GRILLE', 'TREASURE ISLAND', 'ST PETE BEACH', 'MADEIRA BEACH', 'INDIAN ROCKS'],
    'Tampa': ['TAMPA'],
    'Clearwater': ['CLEARWATER'],
    'Open to recommendations': [],
  };
  
  const keywords: string[] = [];
  for (const loc of locations) {
    const mapped = locationMap[loc];
    if (mapped) keywords.push(...mapped);
  }
  
  return keywords;
}

// Get valid image URL (only Supabase Storage URLs, not expired MLS URLs)
function getValidImageUrl(property: any, supabaseUrl: string): string | null {
  const primaryImage = property.property_images?.find((img: any) => img.is_primary)?.image_url;
  const firstImage = property.property_images?.[0]?.image_url;
  const imageUrl = primaryImage || firstImage;
  
  // Only return Supabase Storage URLs
  if (imageUrl && imageUrl.includes('supabase')) {
    return imageUrl;
  }
  
  return null;
}

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
    console.log('Survey preferences:', {
      priceRange: survey.price_range,
      locations: survey.preferred_locations,
      propertyTypes: survey.property_types,
    });

    // Parse price range for filtering
    const { min: minPrice, max: maxPrice } = parsePriceRange(survey.price_range);
    const locationKeywords = getLocationKeywords(survey.preferred_locations);
    
    console.log('Filter criteria:', { minPrice, maxPrice, locationKeywords });

    // Fetch ALL properties (MLS + featured) with images
    const { data: allProperties, error: propertiesError } = await supabase
      .from('properties')
      .select(`
        *,
        property_images (image_url, is_primary, display_order)
      `)
      .order('price', { ascending: false });

    if (propertiesError) {
      console.error('Error fetching properties:', propertiesError);
    }

    console.log('Total properties fetched:', allProperties?.length || 0);

    // Filter properties based on survey preferences
    let matchedProperties = (allProperties || []).filter((p: any) => {
      // Price filter
      const price = p.price || 0;
      const priceMatch = price >= minPrice && (maxPrice === Infinity || price <= maxPrice);
      
      // Status filter - only active listings
      const activeStatuses = ['Active', 'Active Under Contract', 'Coming Soon', 'For Sale', null];
      const statusMatch = activeStatuses.includes(p.mls_status) || activeStatuses.includes(p.status);
      
      // Location filter (if specified)
      let locationMatch = true;
      if (locationKeywords.length > 0) {
        const propertyLocation = (p.location || '').toUpperCase();
        locationMatch = locationKeywords.some(keyword => propertyLocation.includes(keyword.toUpperCase()));
      }
      
      return priceMatch && statusMatch && locationMatch;
    });

    console.log('Properties after filtering:', matchedProperties.length);

    // If no matches with all filters, relax location filter
    if (matchedProperties.length < 3 && locationKeywords.length > 0) {
      console.log('Relaxing location filter due to low matches');
      matchedProperties = (allProperties || []).filter((p: any) => {
        const price = p.price || 0;
        const priceMatch = price >= minPrice && (maxPrice === Infinity || price <= maxPrice);
        const activeStatuses = ['Active', 'Active Under Contract', 'Coming Soon', 'For Sale', null];
        const statusMatch = activeStatuses.includes(p.mls_status) || activeStatuses.includes(p.status);
        return priceMatch && statusMatch;
      });
      console.log('Properties after relaxed filtering:', matchedProperties.length);
    }

    // If still no matches, fall back to featured properties + top priced
    if (matchedProperties.length === 0) {
      console.log('No price matches, falling back to featured + top listings');
      matchedProperties = (allProperties || [])
        .filter((p: any) => p.is_featured || p.price >= 500000)
        .slice(0, 10);
    }

    // Sort by relevance: featured first, then by price
    matchedProperties.sort((a: any, b: any) => {
      if (a.is_featured && !b.is_featured) return -1;
      if (!a.is_featured && b.is_featured) return 1;
      return (b.price || 0) - (a.price || 0);
    });

    // Limit to top 10 matches
    const topMatches = matchedProperties.slice(0, 10);
    
    console.log('Top matches for AI:', topMatches.map((p: any) => ({
      title: p.title,
      price: p.price,
      location: p.location,
      is_mls: p.is_mls_listing,
      is_featured: p.is_featured,
    })));

    // Build AI prompt with survey data and filtered properties
    const systemPrompt = `You are a luxury real estate advisor for The Crawford Team in St. Petersburg, Florida. 
Your role is to analyze client preferences and match them with available luxury properties, providing personalized recommendations.

You have access to the client's survey responses and ${topMatches.length} pre-filtered property listings that match their criteria.
Generate a comprehensive, personalized property match report that includes:

1. **Client Profile Summary**: Summarize their preferences, lifestyle needs, and priorities
2. **Market Insights**: Brief overview of the St. Petersburg luxury market relevant to their criteria (price range: ${survey.price_range || 'flexible'})
3. **Top Property Matches**: Analyze each property against their preferences, explain WHY each property is a good match. Include specific match scores (0-100%) based on alignment with their stated preferences.
4. **Personalized Recommendations**: Specific advice based on their timeline (${survey.timeline || 'not specified'}), budget, and preferences
5. **Next Steps**: Actionable recommendations for their property search

Be specific, professional, and provide genuine value. Use markdown formatting.
Keep the report concise but comprehensive - aim for about 800-1000 words.
Reference actual properties by name and explain specific features that match their lifestyle preferences.`;

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

## Pre-Filtered Property Matches (${topMatches.length} listings matching criteria)

${topMatches.map((p: any, index: number) => `
### ${index + 1}. ${p.title}
- **Listing ID:** ${p.listing_id || 'Featured Listing'}
- **Location:** ${p.location}
- **Price:** $${p.price?.toLocaleString()}
- **Status:** ${p.mls_status || p.status || 'Active'}
- **Type:** ${p.property_type}
- **Bedrooms:** ${p.bedrooms} | **Bathrooms:** ${p.bathrooms}
- **Square Feet:** ${p.sqft?.toLocaleString() || 'N/A'}
- **Year Built:** ${p.year_built || 'N/A'}
- **Days on Market:** ${p.days_on_market || 'New Listing'}
- **Key Features:** ${p.key_features?.join(', ') || 'N/A'}
- **Amenities:** ${p.amenities?.join(', ') || 'N/A'}
- **Lifestyle Events:** ${p.lifestyle_events?.join(', ') || 'N/A'}
- **Description:** ${p.description?.substring(0, 500) || 'Contact for details'}
${p.is_mls_listing ? '- **Source:** MLS Grid (Live Listing)' : '- **Source:** Featured Property'}
`).join('\n') || 'No properties currently matching your criteria. Our team will reach out with personalized recommendations.'}

Please generate a comprehensive property match report for this client, specifically referencing these properties and explaining why each is a good match for their stated preferences.`;

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

    // Build property cards HTML with valid images only
    const propertyCardsHtml = topMatches.slice(0, 6).map((p: any) => {
      const imageUrl = getValidImageUrl(p, supabaseUrl);
      const statusColor = p.mls_status === 'Active' ? '#10b981' : 
                         p.mls_status === 'Active Under Contract' ? '#f59e0b' : 
                         p.mls_status === 'Coming Soon' ? '#3b82f6' : '#6b7280';
      const statusLabel = p.mls_status || p.status || 'Active';
      const propertyUrl = `https://www.yourcrawfordteam.com/property/${p.id}`;
      
      return `
        <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden; margin-bottom: 16px; background: #fff;">
          ${imageUrl ? `<img src="${imageUrl}" alt="${p.title}" style="width: 100%; height: 180px; object-fit: cover;" />` : 
            `<div style="width: 100%; height: 180px; background: linear-gradient(135deg, #0d9488 0%, #115e59 100%); display: flex; align-items: center; justify-content: center;">
              <span style="color: #fff; font-size: 14px; text-align: center; padding: 20px;">${p.title}</span>
            </div>`}
          <div style="padding: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
              <h3 style="margin: 0; color: #1f2937; font-size: 16px; flex: 1;">${p.title}</h3>
              <span style="background: ${statusColor}; color: #fff; font-size: 10px; padding: 2px 8px; border-radius: 12px; white-space: nowrap; margin-left: 8px;">${statusLabel}</span>
            </div>
            <p style="margin: 0 0 4px 0; color: #6b7280; font-size: 13px;">${p.location}</p>
            <p style="margin: 0 0 8px 0; color: #0d9488; font-size: 20px; font-weight: bold;">$${p.price?.toLocaleString()}</p>
            <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 13px;">${p.bedrooms} bed • ${p.bathrooms} bath • ${p.sqft?.toLocaleString() || 'N/A'} sqft</p>
            ${p.listing_id ? `<p style="margin: 0 0 12px 0; color: #9ca3af; font-size: 11px;">MLS# ${p.listing_id}</p>` : ''}
            <a href="${propertyUrl}" style="display: inline-block; background-color: #0d9488; color: #ffffff; padding: 8px 16px; border-radius: 4px; text-decoration: none; font-size: 13px;">View Details</a>
          </div>
        </div>
      `;
    }).join('') || '';

    // Determine email subject based on match count
    const matchCount = topMatches.length;
    const emailSubject = matchCount > 0 
      ? `Your Personalized Match Report: ${matchCount} Properties Found - ${survey.name}`
      : `Your Luxury Property Match Report - ${survey.name}`;

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
              ${matchCount > 0 ? `<p style="color: #0d9488; font-size: 16px; margin: 12px 0 0 0; font-weight: bold;">${matchCount} Properties Matched to Your Criteria</p>` : ''}
            </div>

            <!-- Greeting -->
            <div style="margin-bottom: 30px;">
              <p style="font-size: 16px;">Dear ${survey.name},</p>
              <p style="font-size: 16px; color: #4b5563;">Thank you for completing our Luxury Survey! Based on your responses${survey.price_range ? ` (budget: ${survey.price_range})` : ''}, our AI has analyzed your preferences and matched you with ${matchCount > 0 ? `${matchCount} properties` : 'our luxury listings'} that best fit your lifestyle and investment goals.</p>
            </div>

            <!-- Report Content -->
            <div style="margin-bottom: 40px;">
              ${reportHtml}
            </div>

            <!-- Matched Properties -->
            ${topMatches.length > 0 ? `
              <div style="margin-bottom: 40px;">
                <h2 style="color: #0d9488; font-size: 22px; margin-bottom: 20px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">Your Property Matches</h2>
                ${propertyCardsHtml}
              </div>
            ` : ''}

            <!-- MLS Search CTA -->
            <div style="background-color: #f0fdfa; border-radius: 8px; padding: 24px; margin-bottom: 40px; text-align: center;">
              <h3 style="color: #0d9488; margin: 0 0 12px 0;">Explore All Available Properties</h3>
              <p style="color: #4b5563; margin: 0 0 16px 0; font-size: 14px;">
                Search our complete MLS database with ${allProperties?.length || 0}+ real-time listings across the Tampa Bay area.
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
      from: "The Crawford Team <hello@yourcrawfordteam.com>",
      to: [survey.email],
      subject: emailSubject,
      html: emailHtml,
    });

    if (userEmailError) {
      console.error("Error sending user email:", userEmailError);
      
      // Update survey with failed status
      await supabase
        .from('luxury_surveys')
        .update({
          email_status: 'failed',
          email_error: userEmailError.message || 'Failed to send email',
          matched_properties_count: matchCount,
        })
        .eq('id', surveyId);
      
      throw new Error("Failed to send email to user");
    }

    console.log('Email sent successfully to:', survey.email);

    // Update survey with success status
    await supabase
      .from('luxury_surveys')
      .update({
        email_status: 'sent',
        email_sent_at: new Date().toISOString(),
        email_error: null,
        matched_properties_count: matchCount,
      })
      .eq('id', surveyId);

    // Also send a copy to the team with more details
    const { error: teamEmailError } = await resend.emails.send({
      from: "The Crawford Team <hello@yourcrawfordteam.com>",
      to: ["hello@yourcrawfordteam.com"],
      subject: `New Luxury Survey Match Report Generated - ${survey.name}`,
      html: `
        <h2>New Luxury Survey Completed</h2>
        <p><strong>Client:</strong> ${survey.name}</p>
        <p><strong>Email:</strong> ${survey.email}</p>
        <p><strong>Phone:</strong> ${survey.phone || 'Not provided'}</p>
        <p><strong>Price Range:</strong> ${survey.price_range || 'Not specified'}</p>
        <p><strong>Preferred Locations:</strong> ${survey.preferred_locations?.join(', ') || 'Not specified'}</p>
        <p><strong>Property Types:</strong> ${survey.property_types?.join(', ') || 'Not specified'}</p>
        <p><strong>Timeline:</strong> ${survey.timeline || 'Not specified'}</p>
        <p><strong>Properties Matched:</strong> ${matchCount}</p>
        <hr />
        <h3>Matched Properties</h3>
        <ul>
          ${topMatches.map((p: any) => `<li>${p.title} - $${p.price?.toLocaleString()} (${p.location})</li>`).join('')}
        </ul>
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
      message: "Report generated and emailed successfully",
      matchCount: matchCount,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating/emailing match report:', error);
    
    // Update survey with failed status if we have the surveyId
    try {
      const { surveyId } = await req.clone().json();
      if (surveyId) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        await supabase
          .from('luxury_surveys')
          .update({
            email_status: 'failed',
            email_error: error.message || 'Unknown error',
          })
          .eq('id', surveyId);
      }
    } catch (e) {
      console.error('Could not update survey status:', e);
    }
    
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
