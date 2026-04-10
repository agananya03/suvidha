import { getSession, saveSession, WhatsAppSession } from "@/lib/redisClient";
import {
  sendMetaTextMessage,
  markMetaMessageAsRead,
  downloadMetaMedia,
} from "@/lib/metaMessaging";

// Construct BASE_URL with Vercel support
const getBaseUrl = () => {
  // Vercel environment
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  // Explicit env variable
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }
  // Localhost fallback
  return "http://localhost:3000";
};

const BASE_URL = getBaseUrl();

const DONE_MSG = (token: string) =>
  `✅ *Document received & encrypted!*\n\n🔐 *Your Secure Token:* \`${token}\`\n⏰ Valid for exactly *48 hours*\n\nAt the kiosk:\n1. Select your service\n2. When asked for documents, enter token *${token}*\n3. Your file loads instantly — no scanning needed!\n\n❓ Cannot travel? Reply *HOME VISIT* to book a mobile agent (₹50 fee).\n\n_SUVIDHA — One visit. Everything done._`;

/**
 * Handle incoming Meta WhatsApp message
 * Supports text messages, media, and interactive messages
 * @param senderPhone - Sender's phone number (without +)
 * @param messageType - Type of message (text, image, document, etc.)
 * @param messageContent - Content object from Meta webhook
 * @param messageId - Message ID from Meta (for marking as read)
 * @returns Promise<string> - Response message
 */
export async function handleMetaMessage(
  senderPhone: string,
  messageType: string,
  messageContent: any,
  messageId?: string
): Promise<string> {
  try {
    // Mark message as read (fire-and-forget)
    if (messageId) {
      markMetaMessageAsRead(messageId).catch((err) => {
        console.error("[MetaBot] Failed to mark message as read:", err);
      });
    }

    const session = await getSession(senderPhone);

    // Handle media attachments (document upload flow)
    if (
      session.step === "WAITING_UPLOAD" &&
      (messageType === "image" ||
        messageType === "document" ||
        messageType === "audio" ||
        messageType === "video")
    ) {
      try {
        const immediateResponse =
          "⏳ Got your document! Processing securely...";

        // Process media upload in background (fire-and-forget)
        processMetaMediaUpload(
          senderPhone,
          messageType,
          messageContent,
          session,
          BASE_URL
        ).catch((err) => {
          console.error("[MetaBot] Background processing failed:", err);
        });

        return immediateResponse;
      } catch (err) {
        console.error("[MetaBot] Media upload error:", err);
        return `❌ Could not process your document. Try again or use:\n${BASE_URL}/upload/${encodeURIComponent(senderPhone)}`;
      }
    }

    // Handle text messages and interactive responses
    let messageBody = "";
    if (messageType === "text") {
      messageBody = messageContent.body || "";
    } else if (messageType === "button") {
      messageBody = messageContent.button_payload || "";
    } else if (messageType === "interactive") {
      // Handle interactive message responses
      if (messageContent.interactive?.button_reply?.id) {
        messageBody = messageContent.interactive.button_reply.id;
      }
    } else {
      messageBody = `[Received ${messageType} message]`;
    }

    // Use AI bot for all text messages
    try {
      const { getAiResponse } = await import("@/lib/suvidhaAiBot");
      const aiResponse = await getAiResponse(session, messageBody);

      session.step = aiResponse.newStep;
      if (aiResponse.serviceType) session.serviceType = aiResponse.serviceType;
      if (aiResponse.detectedLanguage)
        session.language = aiResponse.detectedLanguage;

      let finalReply = aiResponse.reply;
      if (
        aiResponse.readyForUpload &&
        session.step === "WAITING_UPLOAD"
      ) {
        finalReply += `\n\n📎 *Two ways to upload:*\n1️⃣ Send photo/PDF directly here\n2️⃣ Use link: ${BASE_URL}/upload/${encodeURIComponent(senderPhone)}`;
      }

      session.history.push(
        { role: "user", content: messageBody },
        { role: "assistant", content: aiResponse.reply }
      );
      if (session.history.length > 20) {
        session.history = session.history.slice(-20);
      }

      await saveSession(senderPhone, session);

      return finalReply;
    } catch (err) {
      console.error("[MetaBot] AI error:", err);
      return `Sorry, I'm having trouble right now. Please call *1800-111-2026* or type *MENU* to try again.`;
    }
  } catch (err) {
    console.error("[MetaBot] Message handler error:", err);
    return `Sorry, something went wrong. Please try again.`;
  }
}

/**
 * Background task to process media upload from Meta
 * Downloads media, encrypts, uploads to storage service
 * Runs asynchronously without blocking the webhook response
 */
async function processMetaMediaUpload(
  senderPhone: string,
  mediaType: string,
  mediaContent: any,
  session: WhatsAppSession,
  baseUrl: string
): Promise<void> {
  try {
    console.log("[MetaBot] Starting media upload processing for:", senderPhone);

    // Meta stores media ID (not URL) in webhook
    // We need to use the media ID to download the actual file
    let mediaBuffer: Buffer;

    try {
      // Handle different media types from Meta
      let downloadUrl: string | undefined;

      if (mediaType === "image" && mediaContent.image?.id) {
        downloadUrl = await getMetaMediaUrl(mediaContent.image.id);
      } else if (mediaType === "document" && mediaContent.document?.id) {
        downloadUrl = await getMetaMediaUrl(mediaContent.document.id);
      } else if (mediaType === "audio" && mediaContent.audio?.id) {
        downloadUrl = await getMetaMediaUrl(mediaContent.audio.id);
      } else if (mediaType === "video" && mediaContent.video?.id) {
        downloadUrl = await getMetaMediaUrl(mediaContent.video.id);
      }

      if (!downloadUrl) {
        throw new Error("Could not retrieve media download URL from Meta");
      }

      console.log("[MetaBot] Downloading media from:", downloadUrl);
      mediaBuffer = await downloadMetaMedia(
        downloadUrl,
        mediaContent[mediaType]?.mime_type || "application/octet-stream"
      );
      console.log("[MetaBot] Downloaded media, size:", mediaBuffer.length);
    } catch (downloadErr) {
      console.error("[MetaBot] Media download error:", downloadErr);
      throw downloadErr;
    }

    // Determine file extension based on MIME type
    const mimeType = mediaContent[mediaType]?.mime_type || "application/octet-stream";
    const extMap: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "application/pdf": "pdf",
      "image/webp": "webp",
      "audio/mpeg": "mp3",
      "audio/ogg": "ogg",
      "video/mp4": "mp4",
    };
    const ext = extMap[mimeType] ?? mediaType;
    const filename = `meta-doc-${Date.now()}.${ext}`;

    // Upload to storage service
    const formData = new FormData();
    const bufferView = new Uint8Array(mediaBuffer);
    formData.append(
      "file",
      new Blob([bufferView], { type: mimeType }),
      filename
    );
    formData.append("serviceType", session.serviceType ?? "");

    console.log("[MetaBot] Uploading to:", `${baseUrl}/api/documents/upload`);
    const uploadRes = await fetch(`${baseUrl}/api/documents/upload`, {
      method: "POST",
      body: formData,
    });

    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      throw new Error(
        `Upload API failed: ${uploadRes.status} ${uploadRes.statusText} - ${errorText}`
      );
    }

    const { token } = (await uploadRes.json()) as { token: string };
    console.log("[MetaBot] Upload successful, token:", token);

    // Update session
    session.uploadedToken = token;
    session.step = "DONE";
    session.history.push(
      {
        role: "user",
        content: `[Citizen sent a ${mediaType} via Meta WhatsApp]`,
      },
      { role: "assistant", content: `Document received. Token: ${token}` }
    );
    await saveSession(senderPhone, session);
    console.log("[MetaBot] Session saved, now sending token message");

    // Send token to user
    await sendMetaTextMessage(senderPhone, DONE_MSG(token));
    console.log("[MetaBot] Token message sent successfully");
  } catch (err) {
    console.error("[MetaBot] Background media processing error:", {
      phone: senderPhone,
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });

    try {
      await sendMetaTextMessage(
        senderPhone,
        `❌ Could not process your document. Try again or use:\n${baseUrl}/upload/${encodeURIComponent(senderPhone)}`
      );
    } catch (sendErr) {
      console.error("[MetaBot] Failed to send error message:", sendErr);
    }
  }
}

/**
 * Get downloadable URL for Media ID from Meta
 * @param mediaId - Media ID from Meta webhook
 * @returns Promise<string> - Download URL
 */
async function getMetaMediaUrl(mediaId: string): Promise<string> {
  try {
    const accessToken = process.env.META_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error("META_ACCESS_TOKEN not configured");
    }

    // Query Meta API to get media URL
    const response = await fetch(`https://graph.instagram.com/v18.0/${mediaId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("[MetaBot] Media URL fetch failed:", error);
      throw new Error(`Failed to get media URL: ${JSON.stringify(error)}`);
    }

    const data = await response.json();
    return data.url;
  } catch (err) {
    console.error("[MetaBot] Error getting media URL:", err);
    throw err;
  }
}

export const metaBot = {
  handleMessage: handleMetaMessage,
};
