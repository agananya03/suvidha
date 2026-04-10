import { NextRequest, NextResponse } from "next/server";
import {
  sendMetaTextMessage,
  sendMetaImageMessage,
  sendMetaDocumentMessage,
  sendMetaLocationMessage,
} from "@/lib/metaMessaging";

/**
 * POST /api/meta/send
 * Send messages to users via Meta WhatsApp Cloud API
 *
 * Request body:
 * {
 *   "to": "1234567890",           // Recipient phone number (without +)
 *   "type": "text|image|document|location",
 *   "content": {
 *     "text": "Message text",     // For text type
 *     "imageUrl": "...",         // For image type
 *     "caption": "...",          // Optional image caption
 *     "documentUrl": "...",      // For document type
 *     "fileName": "...",         // Optional document filename
 *     "latitude": 0,             // For location type
 *     "longitude": 0,            // For location type
 *     "locationName": "..."      // Optional location name
 *   }
 * }
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Verify authentication (optional - add your own auth check)
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.INTERNAL_API_SECRET}`) {
      console.warn("[Meta Send] Unauthorized request");
      return new NextResponse(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { to, type, content } = body;

    // Validate required fields
    if (!to || !type || !content) {
      return new NextResponse(
        JSON.stringify({
          error: "Missing required fields: to, type, content",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("[Meta Send] Sending message:", { to, type });

    let success = false;

    switch (type) {
      case "text": {
        if (!content.text) {
          return new NextResponse(
            JSON.stringify({ error: "Missing content.text" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
        success = await sendMetaTextMessage(to, content.text);
        break;
      }

      case "image": {
        if (!content.imageUrl) {
          return new NextResponse(
            JSON.stringify({ error: "Missing content.imageUrl" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
        success = await sendMetaImageMessage(
          to,
          content.imageUrl,
          content.caption
        );
        break;
      }

      case "document": {
        if (!content.documentUrl) {
          return new NextResponse(
            JSON.stringify({ error: "Missing content.documentUrl" }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
        success = await sendMetaDocumentMessage(
          to,
          content.documentUrl,
          content.fileName
        );
        break;
      }

      case "location": {
        if (content.latitude === undefined || content.longitude === undefined) {
          return new NextResponse(
            JSON.stringify({
              error: "Missing content.latitude or content.longitude",
            }),
            { status: 400, headers: { "Content-Type": "application/json" } }
          );
        }
        success = await sendMetaLocationMessage(
          to,
          content.latitude,
          content.longitude,
          content.locationName
        );
        break;
      }

      default: {
        return new NextResponse(
          JSON.stringify({
            error: `Unsupported message type: ${type}`,
          }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    if (success) {
      return new NextResponse(
        JSON.stringify({
          success: true,
          message: `${type} message sent successfully`,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } else {
      return new NextResponse(
        JSON.stringify({
          success: false,
          error: "Failed to send message",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  } catch (err) {
    console.error("[Meta Send] Error:", err);
    return new NextResponse(
      JSON.stringify({
        error: err instanceof Error ? err.message : "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * GET /api/meta/send
 * Health check and documentation
 */
export async function GET(): Promise<NextResponse> {
  return new NextResponse(
    JSON.stringify({
      endpoint: "/api/meta/send",
      description: "Send messages via Meta WhatsApp Cloud API",
      methods: ["POST"],
      auth: "Bearer token (INTERNAL_API_SECRET)",
      examples: {
        text: {
          to: "1234567890",
          type: "text",
          content: { text: "Hello!" },
        },
        image: {
          to: "1234567890",
          type: "image",
          content: {
            imageUrl: "https://example.com/image.jpg",
            caption: "Check this out!",
          },
        },
        document: {
          to: "1234567890",
          type: "document",
          content: {
            documentUrl: "https://example.com/file.pdf",
            fileName: "document.pdf",
          },
        },
        location: {
          to: "1234567890",
          type: "location",
          content: {
            latitude: 28.7041,
            longitude: 77.1025,
            locationName: "Delhi, India",
          },
        },
      },
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}
