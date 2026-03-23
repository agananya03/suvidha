import twilio from 'twilio';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

const FROM = process.env.TWILIO_WHATSAPP_NUMBER!; // whatsapp:+14155238886

export async function sendWhatsAppMessage(
  toPhone: string,
  message: string
): Promise<boolean> {
  try {
    const to = toPhone.startsWith('whatsapp:')
      ? toPhone
      : `whatsapp:${toPhone}`;

    await client.messages.create({
      from: FROM,
      to,
      body: message,
    });
    return true;
  } catch (err) {
    console.error('[SUVIDHA WhatsApp] Send failed:', err);
    return false;
  }
}

export async function sendArattaiMessage(
  phone: string,
  text: string
): Promise<boolean> {
  // Arattai integration — stub until API key available
  console.log(`[Arattai] To ${phone}: ${text}`);
  return true;
}
