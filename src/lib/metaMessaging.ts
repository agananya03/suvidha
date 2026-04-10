/**
 * Meta WhatsApp Cloud API Messaging Client
 * Handles all communication with Meta's WhatsApp Business API
 */

const META_API_URL = "https://graph.instagram.com/v18.0";

interface TextMessage {
  type: "text";
  text: {
    body: string;
  };
}

interface MediaMessage {
  type: "image" | "document" | "audio" | "video";
  [key: string]: any;
}

interface ButtonMessage {
  type: "button";
  button: {
    text: string;
    buttons: Array<{
      type: "reply";
      reply: {
        id: string;
        title: string;
      };
    }>;
  };
}

// Validate required environment variables
function getMetaConfig() {
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    console.error(
      "[Meta] Missing configuration: META_PHONE_NUMBER_ID or META_ACCESS_TOKEN"
    );
    throw new Error("Meta WhatsApp API credentials not configured");
  }

  return { phoneNumberId, accessToken };
}

/**
 * Send a text message via Meta WhatsApp API
 * @param recipientPhone - Recipient phone number (with country code, e.g., "1234567890")
 * @param messageText - Message text to send
 * @returns Promise<boolean> - Success status
 */
export async function sendMetaTextMessage(
  recipientPhone: string,
  messageText: string
): Promise<boolean> {
  try {
    const { phoneNumberId, accessToken } = getMetaConfig();

    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipientPhone,
      type: "text",
      text: {
        body: messageText,
      },
    };

    const response = await fetch(
      `${META_API_URL}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("[Meta] Message send failed:", error);
      return false;
    }

    const result = await response.json();
    console.log("[Meta] Message sent successfully:", result.messages?.[0]?.id);
    return true;
  } catch (error) {
    console.error("[Meta] Error sending text message:", error);
    return false;
  }
}

/**
 * Send an image message via Meta WhatsApp API
 * @param recipientPhone - Recipient phone number
 * @param imageUrl - URL to the image
 * @param caption - Optional image caption
 * @returns Promise<boolean> - Success status
 */
export async function sendMetaImageMessage(
  recipientPhone: string,
  imageUrl: string,
  caption?: string
): Promise<boolean> {
  try {
    const { phoneNumberId, accessToken } = getMetaConfig();

    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipientPhone,
      type: "image",
      image: {
        link: imageUrl,
        ...(caption && { caption }),
      },
    };

    const response = await fetch(
      `${META_API_URL}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("[Meta] Image send failed:", error);
      return false;
    }

    console.log("[Meta] Image sent successfully");
    return true;
  } catch (error) {
    console.error("[Meta] Error sending image message:", error);
    return false;
  }
}

/**
 * Send a document message via Meta WhatsApp API
 * @param recipientPhone - Recipient phone number
 * @param documentUrl - URL to the document
 * @param fileName - Optional filename for the document
 * @returns Promise<boolean> - Success status
 */
export async function sendMetaDocumentMessage(
  recipientPhone: string,
  documentUrl: string,
  fileName?: string
): Promise<boolean> {
  try {
    const { phoneNumberId, accessToken } = getMetaConfig();

    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipientPhone,
      type: "document",
      document: {
        link: documentUrl,
        ...(fileName && { filename: fileName }),
      },
    };

    const response = await fetch(
      `${META_API_URL}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("[Meta] Document send failed:", error);
      return false;
    }

    console.log("[Meta] Document sent successfully");
    return true;
  } catch (error) {
    console.error("[Meta] Error sending document message:", error);
    return false;
  }
}

/**
 * Send a location message via Meta WhatsApp API
 * @param recipientPhone - Recipient phone number
 * @param latitude - Latitude coordinate
 * @param longitude - Longitude coordinate
 * @param locationName - Optional location name
 * @returns Promise<boolean> - Success status
 */
export async function sendMetaLocationMessage(
  recipientPhone: string,
  latitude: number,
  longitude: number,
  locationName?: string
): Promise<boolean> {
  try {
    const { phoneNumberId, accessToken } = getMetaConfig();

    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipientPhone,
      type: "location",
      location: {
        latitude,
        longitude,
        ...(locationName && { name: locationName }),
      },
    };

    const response = await fetch(
      `${META_API_URL}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("[Meta] Location send failed:", error);
      return false;
    }

    console.log("[Meta] Location sent successfully");
    return true;
  } catch (error) {
    console.error("[Meta] Error sending location message:", error);
    return false;
  }
}

/**
 * Mark a message as read
 * @param messageId - ID of the message to mark as read
 * @returns Promise<boolean> - Success status
 */
export async function markMetaMessageAsRead(messageId: string): Promise<boolean> {
  try {
    const { phoneNumberId, accessToken } = getMetaConfig();

    const payload = {
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId,
    };

    const response = await fetch(
      `${META_API_URL}/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("[Meta] Mark read failed:", error);
      return false;
    }

    console.log("[Meta] Message marked as read");
    return true;
  } catch (error) {
    console.error("[Meta] Error marking message as read:", error);
    return false;
  }
}

/**
 * Download media from Meta webhook
 * @param mediaUrl - URL of the media from webhook
 * @param mimeType - MIME type of the media
 * @returns Promise<Buffer> - Media buffer
 */
export async function downloadMetaMedia(
  mediaUrl: string,
  mimeType: string
): Promise<Buffer> {
  try {
    const { accessToken } = getMetaConfig();

    const response = await fetch(mediaUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to download media: ${response.status} ${response.statusText}`
      );
    }

    return Buffer.from(await response.arrayBuffer());
  } catch (error) {
    console.error("[Meta] Error downloading media:", error);
    throw error;
  }
}

export const metaMessaging = {
  sendTextMessage: sendMetaTextMessage,
  sendImageMessage: sendMetaImageMessage,
  sendDocumentMessage: sendMetaDocumentMessage,
  sendLocationMessage: sendMetaLocationMessage,
  markMessageAsRead: markMetaMessageAsRead,
  downloadMedia: downloadMetaMedia,
};
