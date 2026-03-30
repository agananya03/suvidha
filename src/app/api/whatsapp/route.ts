import { NextRequest, NextResponse } from "next/server";
import { handleWhatsAppMessage } from "@/lib/whatsappBot";

/**
 * 🚀 VERCEL-COMPATIBLE TWILIO WEBHOOK
 * 
 * Key changes for Vercel serverless:
 * 1. Uses formData() for Twilio's form-encoded requests
 * 2. Returns TwiML XML (not JSON)
 * 3. Fire-and-forget async processing
 * 4. Fast response (& lt;100ms)
 */

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // 📥 Parse Twilio's form-encoded data
    const formData = await req.formData();
    
    const fromPhone = formData.get("From") as string;
    const messageBody = (formData.get("Body") as string) ?? "";
    const numMedia = parseInt((formData.get("NumMedia") as string) ?? "0", 10);

    // 📎 Extract media if present
    let mediaUrl: string | undefined;
    let mediaContentType: string | undefined;

    if (numMedia > 0) {
      mediaUrl = (formData.get("MediaUrl0") as string) ?? undefined;
      mediaContentType = (formData.get("MediaContentType0") as string) ?? undefined;
    }

    // ✅ Validate minimum requirements
    if (!fromPhone) {
      return new NextResponse(
        '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
        { status: 200, headers: { "Content-Type": "text/xml" } }
      );
    }

    // 🔥 CRITICAL: Fire-and-forget (don't await!)
    // This ensures Vercel returns response within timeout
    handleWhatsAppMessage(fromPhone, messageBody, mediaUrl, mediaContentType).catch(
      (err) => console.error("❌ WhatsApp message handler error:", err)
    );

    // ✨ Return TwiML immediately (Vercel-compatible)
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        status: 200,
        headers: { "Content-Type": "text/xml" },
      }
    );
  } catch (err) {
    console.error("❌ Webhook error:", err);

    // Even on error, return valid TwiML so Twilio doesn't retry
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        status: 200,
        headers: { "Content-Type": "text/xml" },
      }
    );
  }
}

// GET for Twilio verification (optional)
export async function GET(): Promise<NextResponse> {
  return new NextResponse(
    '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
    {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    }
  );
}
