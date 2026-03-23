import { NextRequest, NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';

interface TTSRequest {
  text: string;
  lang: string;
}

/**
 * Language to Google TTS voice mapping
 * Neural voices only where supported
 */
const LANGUAGE_VOICE_MAP: Record<
  string,
  { code: string; name?: string }
> = {
  en: { code: 'en-US', name: 'en-US-Neural2-C' },
  hi: { code: 'hi-IN', name: 'hi-IN-Neural2-A' },

  mr: { code: 'mr-IN' },
  te: { code: 'te-IN' },
  ta: { code: 'ta-IN' },
  bn: { code: 'bn-IN' },
  pa: { code: 'pa-IN' },
  gu: { code: 'gu-IN' },
  kn: { code: 'kn-IN' },
  ml: { code: 'ml-IN' },
  or: { code: 'or-IN' },
  as: { code: 'as-IN' },

  ur: { code: 'ur-PK' },
  sd: { code: 'sd-PK' },

  sa: { code: 'en-IN', name: 'en-IN-Neural2-B' },
  ks: { code: 'en-IN', name: 'en-IN-Neural2-B' },
  kok: { code: 'en-IN', name: 'en-IN-Neural2-B' },
  doi: { code: 'en-IN', name: 'en-IN-Neural2-B' },
  mai: { code: 'en-IN', name: 'en-IN-Neural2-B' },

  ne: { code: 'ne-NP' },
};

/**
 * Generate OAuth 2.0 access token
 */
async function getAccessToken(): Promise<string> {
  const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;

  if (!serviceAccountJson) {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_JSON not set');
  }

  const credentials = JSON.parse(serviceAccountJson);

  const auth = new GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  const client = await auth.getClient();
  const token = await client.getAccessToken();

  if (!token.token) {
    throw new Error('Failed to get access token');
  }

  return token.token;
}

/**
 * POST /api/tts
 */
export async function POST(request: NextRequest) {
  try {
    const { text, lang } = (await request.json()) as TTSRequest;

    if (!text?.trim()) {
      return NextResponse.json({ error: 'Text required' }, { status: 400 });
    }

    if (!lang) {
      return NextResponse.json({ error: 'Language required' }, { status: 400 });
    }

    const voiceConfig = LANGUAGE_VOICE_MAP[lang] || { code: 'en-US' };

    // 🔥 FIX: Conditional voice object
    const voice = voiceConfig.name
      ? {
          languageCode: voiceConfig.code,
          name: voiceConfig.name,
        }
      : {
          languageCode: voiceConfig.code,
        };

    const accessToken = await getAccessToken();

    const response = await fetch(
      'https://texttospeech.googleapis.com/v1/text:synthesize',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          input: { text },
          voice,
          audioConfig: {
            audioEncoding: 'MP3',
            pitch: 0,
            speakingRate: 1.0,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[TTS ERROR]', errorData);

      return NextResponse.json(
        { error: errorData.error?.message || 'TTS failed' },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json({
      audioContent: data.audioContent,
    });

  } catch (err) {
    console.error('[TTS ROUTE ERROR]', err);

    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal error' },
      { status: 500 }
    );
  }
}