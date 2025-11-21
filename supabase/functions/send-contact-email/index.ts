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

    // Get the origin from the request to construct the PDF URL
    const origin = new URL(req.url).origin.replace('functions.supabase.co', 'supabase.co');
    const pdfUrl = `${origin}/guides/sellers-guide.pdf`;

    console.log("Fetching seller's guide PDF from:", pdfUrl);

    // Fetch the seller's guide PDF
    let pdfBase64: string | undefined;
    try {
      const pdfResponse = await fetch(pdfUrl);
      if (pdfResponse.ok) {
        const pdfBuffer = await pdfResponse.arrayBuffer();
        pdfBase64 = btoa(String.fromCharCode(...new Uint8Array(pdfBuffer)));
        console.log("PDF fetched and encoded successfully");
      } else {
        console.warn("Could not fetch PDF, will send email without attachment");
      }
    } catch (pdfError) {
      console.warn("Error fetching PDF:", pdfError);
    }

    // Send email to the admin/agent
    const adminEmailResponse = await resend.emails.send({
      from: "Crawford Team <hello@yourcrawfordteam.com>",
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

    console.log("Admin notification email sent successfully:", adminEmailResponse);

    // Send thank you email with PDF to the customer
    const customerEmailData: any = {
      from: "Crawford Team <hello@yourcrawfordteam.com>",
      to: [safeEmail],
      subject: "Thank You for Your Interest - Seller's Guide Enclosed",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Thank You, ${safeName}!</h2>
          <p>We've received your inquiry and appreciate your interest in working with the Crawford Team.</p>
          <p>As requested, please find our comprehensive Seller's Guide attached to this email. This guide contains valuable information about:</p>
          <ul>
            <li>Preparing your home for sale</li>
            <li>Understanding the selling process</li>
            <li>Pricing strategies</li>
            <li>Marketing your property</li>
            <li>And much more!</li>
          </ul>
          <p>One of our team members will be in touch with you shortly to discuss your needs in more detail.</p>
          <p>If you have any immediate questions, please don't hesitate to reach out to us.</p>
          <br>
          <p>Best regards,<br>
          <strong>The Crawford Team</strong><br>
          📞 Phone: <a href="tel:7275991944">(727) 599-1944</a><br>
          📧 Email: <a href="mailto:yourcrawfordteam@gmail.com">yourcrawfordteam@gmail.com</a></p>
        </div>
      `,
    };

    // Add PDF attachment if successfully fetched
    if (pdfBase64) {
      customerEmailData.attachments = [
        {
          filename: "Crawford-Team-Sellers-Guide.pdf",
          content: pdfBase64,
        },
      ];
    }

    const customerEmailResponse = await resend.emails.send(customerEmailData);

    console.log("Customer thank you email sent successfully:", customerEmailResponse);

    return new Response(JSON.stringify({ 
      adminEmail: adminEmailResponse,
      customerEmail: customerEmailResponse 
    }), {
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
