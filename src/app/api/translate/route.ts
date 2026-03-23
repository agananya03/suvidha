import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const { text, targetLang } = await request.json();

        if (!text || !targetLang) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        if (targetLang === 'en') {
            return NextResponse.json({ translatedText: text }); // Bypass English
        }

        const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
        
        if (!apiKey) {
            console.warn('⚠️ GOOGLE_TRANSLATE_API_KEY not set, using free endpoint');
            // Fallback to free endpoint if API key not configured
            return fallbackTranslate(text, targetLang);
        }

        // Use the official Google Cloud Translation API
        const response = await fetch(
            `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    q: text,
                    target: targetLang,
                }),
            }
        );

        if (!response.ok) {
            const error = await response.json();
            console.error('❌ Google Translate API error:', error);
            // Fallback to free endpoint on error
            return fallbackTranslate(text, targetLang);
        }

        const data = (await response.json()) as {
            data: {
                translations: Array<{
                    translatedText: string;
                    detectedSourceLanguage?: string;
                }>;
            };
        };

        const translatedText = decodeHtmlEntities(
            data.data.translations[0]?.translatedText || text
        );

        return NextResponse.json({ translatedText });
    } catch (error) {
        console.error('❌ Translation error:', error);
        // On error, try free endpoint
        const { text, targetLang } = await request.json();
        return fallbackTranslate(text, targetLang);
    }
}

async function fallbackTranslate(text: string, targetLang: string) {
    try {
        const response = await fetch(
            `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`
        );

        if (!response.ok) {
            throw new Error('Upstream translation failure');
        }

        const data = await response.json();
        const translatedText = data[0].map((item: any) => item[0]).join('');

        return NextResponse.json({ translatedText });
    } catch (error) {
        console.error('Fallback translation failed:', error);
        return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
    }
}

function decodeHtmlEntities(text: string): string {
    const entities: Record<string, string> = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&apos;': "'",
    };

    return text.replace(/&[a-zA-Z0-9#]+;/g, (match) => entities[match] || match);
}
