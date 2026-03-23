import dotenv from "dotenv";
dotenv.config();


async function sendMessage(to:string, message:string) {
  
  const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
  const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
  
  if (!ACCESS_TOKEN) {
    console.log("🧪 Mock reply:", message);
    return;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to,
          text: { body: message },
        }),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      console.error("❌ WhatsApp API Error:", data);
      return;
    }
    
    console.log("✅ Message sent:", data);
  } catch (err) {
    console.error("❌ Send error:", err);
  }
}

