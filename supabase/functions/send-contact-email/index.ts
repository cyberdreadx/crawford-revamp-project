import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { z } from "npm:zod@3.23.8";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// HTML encoding function to prevent XSS
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Input validation schema
const ContactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email").max(255, "Email too long"),
  phone: z.string().regex(/^[\d\s\-\(\)\+]*$/, "Invalid phone format").max(20, "Phone too long").optional(),
  propertyType: z.string().max(100, "Property type too long").optional(),
  message: z.string().trim().min(1, "Message is required").max(2000, "Message too long")
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  phone?: string;
  propertyType?: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawData = await req.json();
    
    // Validate input data
    const validatedData = ContactSchema.parse(rawData);
    const { name, email, phone, propertyType, message } = validatedData;

    console.log("Sending contact form email for:", email);

    // Sanitize all inputs for HTML output to prevent XSS
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = phone ? escapeHtml(phone) : undefined;
    const safePropertyType = propertyType ? escapeHtml(propertyType) : undefined;
    const safeMessage = escapeHtml(message);

    // Send email to the admin/agent
    const emailResponse = await resend.emails.send({
      from: "Crawford Team <onboarding@resend.dev>",
      to: ["yourcrawfordteam@gmail.com"],
      subject: `New Contact Form Submission from ${safeName}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        ${safePhone ? `<p><strong>Phone:</strong> ${safePhone}</p>` : ''}
        ${safePropertyType ? `<p><strong>Property Interest:</strong> ${safePropertyType}</p>` : ''}
        <p><strong>Message:</strong></p>
        <p>${safeMessage}</p>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
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
