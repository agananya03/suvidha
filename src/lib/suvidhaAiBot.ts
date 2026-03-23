import type { ConversationMessage, WhatsAppSession } from '@/lib/redisClient';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

const SYSTEM_PROMPT = `You are SUVIDHA Bot — the official WhatsApp assistant
for SUVIDHA 2026, India's smart city kiosk system built by C-DAC.

CORE MISSION:
Your primary goal is to provide helpful informational services:
1. Live Queue Status at nearby kiosks
2. Kiosk Visiting times & operational hours
3. General info on Municipal Services
4. Helping users upload documents remotely so they are ready BEFORE visiting the kiosk
5. Bill payments or complaints (DO NOT push payments unless the user explicitly asks to pay a bill).

PERSONALITY:
- Warm, patient, and helpful. Many users have low digital literacy.
- Reply in the SAME LANGUAGE the citizen uses (Hindi, Tamil, Marathi, English etc.).
- Keep replies SHORT — max 4-5 lines. Use simple words. 1-2 emojis max.
- IMPORTANT: NEVER aggressively push bill payments. Actively feature queue status, timings, and remote document uploads.

QUEUE STATUS & VISITING TIMES (provide enthusiastically if asked or if they plan to visit):
- Current Live Queue: LOW (5-8 mins) or MEDIUM (15-20 mins)
- Kiosk Visiting Hours: 8:00 AM to 8:00 PM (Monday-Saturday). Closed on Sundays.
- Nearest kiosks: Civil Lines Office (0.8km), Main Station (1.2km)

UPLOAD OPTIONS (propose this to save them time at the kiosk):
1. Send photo/PDF directly in this WhatsApp chat (easiest).
2. Alternatively, use upload link: BASE_URL/upload/PHONE (replace PHONE with their number).

RESPONSE FORMAT (always reply with this exact JSON, no extra text around it):
{
  "reply": "your message to the citizen (plain text, no markdown)",
  "newStep": "WELCOME | ASKED_SERVICE | ASKED_DOCS | WAITING_UPLOAD | DONE",
  "serviceType": "queue | visit | upload | complaint | electricity | gas | water | null",
  "detectedLanguage": "english | hindi | tamil | etc",
  "readyForUpload": true or false
}

STEP RULES:
- If user says MENU/hello/hi → newStep: WELCOME. Give a friendly menu listing Queue Status, Visiting Times, Document Upload, and finally Payments/Complaints.
- If they ask about queues/times → Reply with the info, newStep: DONE.
- If they want to upload docs or say yes to upload → newStep: WAITING_UPLOAD, readyForUpload: true. Tell them to send the photo now.
- If citizen says 'no' to upload → newStep: DONE.
- Never expose JSON formatting or internal step names to the user.`;

// NOTE: built lazily inside getAiResponse so process.env is always populated at call time

export interface AiBotResponse {
  reply: string;
  newStep: WhatsAppSession['step'];
  serviceType: WhatsAppSession['serviceType'];
  detectedLanguage: string;
  readyForUpload: boolean;
}

export async function getAiResponse(
  session: WhatsAppSession,
  userMessage: string
): Promise<AiBotResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const sessionContext = `[Session: step=${session.step}, service=${session.serviceType ?? 'none'}, phone=${session.phone}]`;

      // Build native Gemini contents array (role must be 'user' or 'model')
      const contents = (session.history ?? []).map((msg) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      // Append the latest user message
      contents.push({
        role: 'user',
        parts: [{ text: `${sessionContext}\n\nCitizen says: ${userMessage}` }],
      });

      // Using gemini-2.5-flash, universally available to new projects since Gemini 1.5 deprecation
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: SYSTEM_PROMPT.replace('BASE_URL', BASE_URL) }],
            },
            contents,
            generationConfig: {
              responseMimeType: 'application/json',
            },
          }),
        }
      );

      if (response.ok) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data = await response.json() as any;
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

        // Safely extract just the JSON part in case it injects markdown wrapping
        const jsonStart = rawText.indexOf('{');
        const jsonEnd = rawText.lastIndexOf('}');

        if (jsonStart !== -1 && jsonEnd !== -1) {
          const cleaned = rawText.slice(jsonStart, jsonEnd + 1);
          return JSON.parse(cleaned) as AiBotResponse;
        } else {
          console.warn('[SUVIDHA AI] No valid JSON block extracted from Gemini output.');
        }
      } else {
        const errBody = await response.text();
        console.warn(`[SUVIDHA AI] Native Gemini API failed with status ${response.status}:`, errBody);
      }
    } catch (err) {
      console.warn(
        '[SUVIDHA AI] Network/Parse Error in Gemini integration. Falling back to keywords:',
        err instanceof Error ? err.message : String(err)
      );
    }
  }

  // --- KEYWORD FALLBACK LOGIC --- //
  const msg = userMessage.toLowerCase().trim();

  let reply = "I didn't quite catch that. Please type MENU to see options.";
  let newStep = session.step;
  let serviceType = session.serviceType;
  let readyForUpload = false;

  if (msg === 'menu' || msg === 'restart' || msg === 'hi' || msg === 'hello') {
    reply =
      "Welcome to SUVIDHA 2026! How can I help you today?\n1. Electricity Bill\n2. Gas Bill\n3. Water Services\n4. File Complaint\n5. Queue Status";
    newStep = 'WELCOME';
    serviceType = null;
  } else if (['1', 'electricity'].some((k) => msg.includes(k))) {
    reply = "You selected Electricity. Please reply 'yes' to upload your bill or 'no' to skip.";
    newStep = 'ASKED_DOCS';
    serviceType = 'electricity';
  } else if (['2', 'gas'].some((k) => msg.includes(k))) {
    reply = "You selected Gas. Please reply 'yes' to upload your bill or 'no' to skip.";
    newStep = 'ASKED_DOCS';
    serviceType = 'gas';
  } else if (['3', 'water'].some((k) => msg.includes(k))) {
    reply = "You selected Water Services. Please reply 'yes' to upload your documents or 'no' to skip.";
    newStep = 'ASKED_DOCS';
    serviceType = 'water';
  } else if (['4', 'complaint'].some((k) => msg.includes(k))) {
    reply = "You selected File Complaint. Please reply 'yes' to upload a photo or 'no' to skip.";
    newStep = 'ASKED_DOCS';
    serviceType = 'complaint';
  } else if (['5', 'queue'].some((k) => msg.includes(k))) {
    reply =
      "Queue Status:\nElectricity: LOW\nGas: MEDIUM\nWater: LOW\nComplaints: MEDIUM\nNearest Kiosk: Civil Lines (0.8km)";
    newStep = 'DONE';
  } else if (session.step === 'ASKED_DOCS' || session.step === 'ASKED_SERVICE') {
    if (msg === 'yes' || msg === 'y') {
      reply = "Please upload your document now.";
      newStep = 'WAITING_UPLOAD';
      readyForUpload = true;
    } else if (msg === 'no' || msg === 'n') {
      reply = "Okay! Your request is being processed without document upload.";
      newStep = 'DONE';
    } else {
      reply = "Please reply 'yes' or 'no'.";
    }
  }

  return {
    reply,
    newStep,
    serviceType,
    detectedLanguage: 'english',
    readyForUpload,
  };
}
