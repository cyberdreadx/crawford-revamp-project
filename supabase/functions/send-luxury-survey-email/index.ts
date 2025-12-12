import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LuxurySurveyRequest {
  name: string;
  email: string;
  phone?: string;
  serviceTypes: string[];
  advisorQualities: string[];
  propertyTypes: string[];
  lifestylePreferences: string[];
  valueFactors: string[];
  priceRange: string;
  preferredLocations: string[];
  timeline: string;
  contactPreference: string[];
}

const formatArrayField = (arr: string[], label: string): string => {
  if (!arr || arr.length === 0) return "";
  return `<p><strong>${label}:</strong><br/>${arr.map(item => `• ${item}`).join("<br/>")}</p>`;
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: LuxurySurveyRequest = await req.json();
    console.log("Received luxury survey submission:", data.name, data.email);

    // Build the team notification email content
    const teamEmailContent = `
      <h2>New Luxury Survey Submission</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Phone:</strong> ${data.phone || "Not provided"}</p>
      <hr/>
      ${formatArrayField(data.serviceTypes, "Service Types")}
      ${formatArrayField(data.advisorQualities, "Advisor Qualities (Top 3)")}
      ${formatArrayField(data.propertyTypes, "Property Types of Interest")}
      ${formatArrayField(data.lifestylePreferences, "Lifestyle Preferences")}
      ${formatArrayField(data.valueFactors, "Value Factors (Top 2)")}
      <p><strong>Price Range:</strong> ${data.priceRange || "Not specified"}</p>
      ${formatArrayField(data.preferredLocations, "Preferred Locations")}
      <p><strong>Timeline:</strong> ${data.timeline || "Not specified"}</p>
      ${formatArrayField(data.contactPreference, "Contact Preference")}
    `;

    // Send notification to team
    const teamEmailResponse = await resend.emails.send({
      from: "Crawford Team <hello@yourcrawfordteam.com>",
      to: ["hello@yourcrawfordteam.com"],
      subject: `New Luxury Survey: ${data.name}`,
      html: teamEmailContent,
    });

    console.log("Team email sent:", teamEmailResponse);

    // Send thank-you email to customer
    const customerEmailContent = `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
        <h1 style="color: #2c3e50; border-bottom: 2px solid #d4af37; padding-bottom: 15px;">Thank You, ${data.name}</h1>
        
        <p style="font-size: 16px; line-height: 1.8;">
          We've received your Luxury Survey and are excited to begin curating your personalized Luxury Match Report.
        </p>
        
        <p style="font-size: 16px; line-height: 1.8;">
          Based on your preferences, our team will analyze the St. Petersburg luxury market to identify properties 
          that align with your lifestyle, investment goals, and unique vision for waterfront living.
        </p>
        
        <p style="font-size: 16px; line-height: 1.8;">
          A member of our team will be in touch within 24-48 hours to discuss your results and next steps.
        </p>
        
        <div style="background: #f8f6f0; padding: 20px; margin: 30px 0; border-left: 4px solid #d4af37;">
          <p style="margin: 0; font-style: italic;">
            "Luxury is not about price. It's about precision, personalization, and the perfect match."
          </p>
        </div>
        
        <p style="font-size: 16px; line-height: 1.8;">
          Warm regards,<br/>
          <strong>The Crawford Team</strong><br/>
          (727) 599-1944<br/>
          <a href="mailto:hello@yourcrawfordteam.com" style="color: #d4af37;">hello@yourcrawfordteam.com</a>
        </p>
      </div>
    `;

    const customerEmailResponse = await resend.emails.send({
      from: "Crawford Team <hello@yourcrawfordteam.com>",
      to: [data.email],
      subject: "Your Luxury Match Report is Being Prepared",
      html: customerEmailContent,
    });

    console.log("Customer email sent:", customerEmailResponse);

    return new Response(
      JSON.stringify({ success: true, teamEmail: teamEmailResponse, customerEmail: customerEmailResponse }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-luxury-survey-email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
