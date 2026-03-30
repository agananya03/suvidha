import { NextRequest, NextResponse } from "next/server";
import { handleWhatsAppMessage } from "@/lib/whatsappBot";
import twilio from "twilio";

// 🔹 TWILIO VERIFICATION - Twilio checks webhook on setup
export async function GET(req: NextRequest) {
  // Twilio doesn't actually verify via GET, but some setups might check
  return NextResponse.json({ status: "ok" });
}

// 🔹 TWILIO WEBHOOK - Receive WhatsApp messages
export async function POST(req: NextRequest) {
  try {
    // Parse Twilio's form-encoded request
    const formData = await req.formData();
    
    const fromPhone = formData.get("From") as string; // whatsapp:+1234567890
    const messageBody = formData.get("Body") as string;
    const numMedia = parseInt(formData.get("NumMedia") as string, 10) || 0;

    console.log("📩 Incoming Twilio Message:", {
      from: fromPhone,
      body: messageBody,
      mediaCount: numMedia,
    });

    // Don't fail if no message body - Twilio always sends these fields
    if (!fromPhone) {
      console.warn("⚠️ No 'From' field in Twilio request");
      return NextResponse.json({ success: true }, { status: 200 });
    }

    // Handle media if present
    let mediaUrl: string | undefined;
    let mediaContentType: string | undefined;

    if (numMedia > 0) {
      mediaUrl = formData.get("MediaUrl0") as string | undefined;
      mediaContentType = formData.get("MediaContentType0") as string | undefined;
      console.log("📎 Media attached:", { mediaUrl, mediaContentType });
    }

    // Process message/media
    if (messageBody || mediaUrl) {
      await handleWhatsAppMessage(fromPhone, messageBody || "", mediaUrl, mediaContentType);
    }

    // Always return 200 OK to Twilio
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    // Still return 200 so Twilio doesn't retry
    return NextResponse.json({ error: "Processed" }, { status: 200 });
  }
}
