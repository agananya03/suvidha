import { Translate } from "@google-cloud/translate/build/src";

const SUPPORTED_LANGUAGES = {
  en: "en",
  hi: "hi",
  mr: "mr",
  te: "te",
  ta: "ta",
  bn: "bn",
  pa: "pa",
  gu: "gu",
  kn: "kn",
  ml: "ml",
  or: "or",
  as: "as",
  ur: "ur",
  sd: "sd",
  sa: "sa",
  ks: "ks",
  ne: "ne",
  kok: "kok",
  doi: "doi",
  mai: "mai",
};

let translateClient: Translate | null = null;

function getTranslateClient() {
  if (!translateClient) {
    // Using API key approach instead of service account
    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    if (!apiKey) {
      console.warn("⚠️ GOOGLE_TRANSLATE_API_KEY not set");
      return null;
    }
    // We'll use fetch API directly since the Google Cloud library has auth complexities
  }
  return null;
}

export async function translateText(
  text: string,
  targetLanguage: string
): Promise<string> {
  // If target language is English, return as is
  if (targetLanguage === "en") {
    return text;
  }

  // Validate language code
  if (!SUPPORTED_LANGUAGES[targetLanguage as keyof typeof SUPPORTED_LANGUAGES]) {
    console.warn(`⚠️ Unsupported language: ${targetLanguage}`);
    return text;
  }

  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) {
    console.error("❌ GOOGLE_TRANSLATE_API_KEY not configured");
    return text;
  }

  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: text,
          target: targetLanguage,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ Translation API error:", error);
      return text;
    }

    const data = (await response.json()) as {
      data: {
        translations: Array<{
          translatedText: string;
          detectedSourceLanguage?: string;
        }>;
      };
    };

    const translatedText =
      data.data.translations[0]?.translatedText || text;

    // Decode HTML entities (Google Translate returns HTML-encoded text)
    return decodeHtmlEntities(translatedText);
  } catch (error) {
    console.error("❌ Translation error:", error);
    return text;
  }
}

export async function translateBatch(
  texts: string[],
  targetLanguage: string
): Promise<string[]> {
  // If target language is English, return as is
  if (targetLanguage === "en") {
    return texts;
  }

  // Validate language code
  if (!SUPPORTED_LANGUAGES[targetLanguage as keyof typeof SUPPORTED_LANGUAGES]) {
    console.warn(`⚠️ Unsupported language: ${targetLanguage}`);
    return texts;
  }

  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
  if (!apiKey) {
    console.error("❌ GOOGLE_TRANSLATE_API_KEY not configured");
    return texts;
  }

  try {
    const response = await fetch(
      `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: texts,
          target: targetLanguage,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ Translation API error:", error);
      return texts;
    }

    const data = (await response.json()) as {
      data: {
        translations: Array<{
          translatedText: string;
          detectedSourceLanguage?: string;
        }>;
      };
    };

    return data.data.translations.map((t) =>
      decodeHtmlEntities(t.translatedText)
    );
  } catch (error) {
    console.error("❌ Translation error:", error);
    return texts;
  }
}

function decodeHtmlEntities(text: string): string {
  const entities: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
    "&apos;": "'",
  };

  return text.replace(/&[a-zA-Z0-9#]+;/g, (match) => entities[match] || match);
}

export function isValidLanguage(code: string): boolean {
  return code in SUPPORTED_LANGUAGES;
}

export function getLanguageList() {
  return Object.keys(SUPPORTED_LANGUAGES);
}
