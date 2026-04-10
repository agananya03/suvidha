import { NextRequest, NextResponse } from "next/server";
import { handleMetaMessage } from "@/lib/metaBot";

/**
 * 🚀 META WHATSAPP CLOUD API WEBHOOK (Vercel-Compatible)
 *
 * Architecture:
 * 1. GET: Webhook verification from Meta (challenge token)
 * 2. POST: Incoming messages, handles async processing in background
 * 3. HTTP 200: Always return immediately for Vercel compatibility
 */

/**
 * Verify webhook token from Meta
 * Meta sends: GET /?hub.mode=subscribe&hub.challenge=TOKEN&hub.verify_token=TOKEN
 */
export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const challenge = url.searchParams.get("hub.challenge");
    const verifyToken = url.searchParams.get("hub.verify_token");

    const webhookVerifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;

    if (!webhookVerifyToken) {
      console.error("[Meta Webhook] META_WEBHOOK_VERIFY_TOKEN not configured");
      return new NextResponse("Webhook token not configured", { status: 500 });
    }

    // Verify the webhook
    if (mode === "subscribe" && verifyToken === webhookVerifyToken) {
      console.log("[Meta Webhook] Webhook verified successfully");
      return new NextResponse(challenge, { status: 200 });
    }

    console.warn("[Meta Webhook] Verification failed:", { mode, verifyToken });
    return new NextResponse("Verification failed", { status: 403 });
  } catch (err) {
    console.error("[Meta Webhook] GET handler error:", err);
    return new NextResponse("Internal error", { status: 500 });
  }
}

/**
 * Handle incoming messages from Meta WhatsApp
 * Supports:
 * - Text messages
 * - Media (images, documents, audio, video)
 * - Interactive messages (buttons, lists)
 * - Message status updates
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json();

    // Log the incoming webhook for debugging
    console.log("[Meta Webhook] Received:", JSON.stringify(body, null, 2));

    // Meta sends events in batches under 'entry'
    const entry = body.entry?.[0];
    if (!entry) {
      console.warn("[Meta Webhook] No entry found in webhook payload");
      return new NextResponse(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check for changes (messages, message_template_status_update, etc.)
    const changes = entry.changes?.[0];
    if (!changes) {
      console.warn("[Meta Webhook] No changes found in entry");
      return new NextResponse(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { value } = changes;
    if (!value) {
      console.warn("[Meta Webhook] No value in changes");
      return new NextResponse(JSON.stringify({ received: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Handle incoming messages
    const messages = value.messages || [];
    for (const message of messages) {
      try {
        await handleIncomingMessage(message, value);
      } catch (msgErr) {
        console.error(
          "[Meta Webhook] Error handling individual message:",
          msgErr
        );
        // Continue processing other messages
      }
    }

    // Handle message status updates (optional logging)
    const statuses = value.statuses || [];
    for (const status of statuses) {
      console.log("[Meta Webhook] Message status update:", {
        messageId: status.id,
        status: status.status,
        timestamp: status.timestamp,
      });
    }

    // Always return 200 immediately for Vercel compatibility
    // Process messages asynchronously in background
    return new NextResponse(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("[Meta Webhook] POST handler error:", err);
    // Always return 200 to prevent Meta from retrying
    return new NextResponse(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * Process a single incoming message
 * Extracts sender, message type, and content
 */
async function handleIncomingMessage(message: any, context: any): Promise<void> {
  try {
    const from = message.from; // Sender's phone number
    const messageId = message.id;
    const timestamp = message.timestamp;

    if (!from) {
      console.warn("[Meta Webhook] Message missing 'from' field");
      return;
    }

    console.log("[Meta Webhook] Processing message from:", from);

    // Determine message type and extract content
    let messageType = "unknown";
    let messageContent: any = {};

    if (message.type === "text") {
      messageType = "text";
      messageContent = message.text;
    } else if (message.type === "image") {
      messageType = "image";
      messageContent = message.image;
    } else if (message.type === "document") {
      messageType = "document";
      messageContent = message.document;
    } else if (message.type === "audio") {
      messageType = "audio";
      messageContent = message.audio;
    } else if (message.type === "video") {
      messageType = "video";
      messageContent = message.video;
    } else if (message.type === "location") {
      messageType = "location";
      messageContent = message.location;
    } else if (message.type === "button") {
      messageType = "button";
      messageContent = message.button;
    } else if (message.type === "interactive") {
      messageType = "interactive";
      messageContent = message.interactive;
    } else {
      console.warn("[Meta Webhook] Unsupported message type:", message.type);
      return;
    }

    // Process the message asynchronously (fire-and-forget)
    // This ensures webhook returns quickly to Meta
    handleMetaMessage(from, messageType, messageContent, messageId)
      .then((response) => {
        console.log("[Meta Webhook] Message handled successfully:", {
          from,
          messageType,
          responseLength: response?.length || 0,
        });

        // Send response back to user (fire-and-forget)
        if (response) {
          import("@/lib/metaMessaging")
            .then(({ sendMetaTextMessage }) => {
              sendMetaTextMessage(from, response).catch((err) => {
                console.error(
                  "[Meta Webhook] Failed to send response message:",
                  err
                );
              });
            })
            .catch((err) => {
              console.error("[Meta Webhook] Failed to import messaging:", err);
            });
        }
      })
      .catch((err) => {
        console.error(
          "[Meta Webhook] Error handling message:",
          err instanceof Error ? err.message : String(err)
        );
      });

    console.log("[Meta Webhook] Message queued for async processing");
  } catch (err) {
    console.error("[Meta Webhook] Error in handleIncomingMessage:", err);
    throw err;
  }
}
