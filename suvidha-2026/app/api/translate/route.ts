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

        // Hit the public Google Translate API for free automated translation without a key
        // Note: This relies on the public frontend translate.googleapis.com endpoint.
        const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`);

        if (!response.ok) {
            throw new Error('Upstream translation failure');
        }

        const data = await response.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const translatedText = data[0].map((item: any) => item[0]).join('');

        return NextResponse.json({ translatedText });
    } catch (error) {
        console.error('Translation error:', error);
        return NextResponse.json({ error: 'Translation failed' }, { status: 500 });
    }
}
