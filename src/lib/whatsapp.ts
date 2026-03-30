/**
 * ⚠️ DEPRECATED - Use @/lib/messaging.ts instead
 * 
 * This file previously contained Meta API code.
 * All WhatsApp messaging is now handled via Twilio.
 * 
 * See: /lib/messaging.ts for sendWhatsAppMessage() function
 */

export const deprecatedWarning = () => {
  console.warn("❌ whatsapp.ts is deprecated. Use messaging.ts instead.");
};

