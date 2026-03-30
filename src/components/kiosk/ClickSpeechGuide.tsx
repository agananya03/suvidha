"use client";

import { useEffect } from 'react';
import { useStore } from '@/lib/store';

const LANGUAGE_LOCALE_MAP: Record<string, string> = {
    en: 'en-IN',
    hi: 'hi-IN',
    mr: 'mr-IN',
    ta: 'ta-IN',
    te: 'te-IN',
    bn: 'bn-IN',
    gu: 'gu-IN',
    kn: 'kn-IN',
    ml: 'ml-IN',
    pa: 'pa-IN',
    ur: 'ur-IN',
};

function getInteractiveLabel(element: HTMLElement): string {
    const explicit = element.getAttribute('data-speech-label');
    if (explicit && explicit.trim()) return explicit.trim();

    const aria = element.getAttribute('aria-label');
    if (aria && aria.trim()) return aria.trim();

    const title = element.getAttribute('title');
    if (title && title.trim()) return title.trim();

    if (element instanceof HTMLInputElement && element.value?.trim()) {
        return element.value.trim();
    }

    const text = element.textContent?.replace(/\s+/g, ' ').trim();
    if (!text) return '';

    return text.length > 80 ? `${text.slice(0, 80)}...` : text;
}

function speakLabel(label: string, lang: string) {
    if (!label || typeof window === 'undefined' || !window.speechSynthesis) return;

    // Cancel current speech
    window.speechSynthesis.cancel();

    // Small delay to ensure full text is captured from next utterance
    setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(label);
        utterance.lang = LANGUAGE_LOCALE_MAP[lang] ?? 'en-IN';
        utterance.rate = 0.90;
        utterance.pitch = 1;
        utterance.volume = 1;

        window.speechSynthesis.speak(utterance);
    }, 50);
}

export function ClickSpeechGuide() {
    const { voiceMode, language } = useStore();

    useEffect(() => {
        if (!voiceMode) return;

        const onPointerDown = (event: PointerEvent) => {
            const target = event.target as HTMLElement | null;
            if (!target) return;

            const interactive = target.closest('button, a, [role="button"], input[type="button"], input[type="submit"]') as HTMLElement | null;
            if (!interactive) return;
            if ((interactive as HTMLButtonElement).disabled) return;

            const label = getInteractiveLabel(interactive);
            if (!label) return;

            speakLabel(label, language);
        };

        window.addEventListener('pointerdown', onPointerDown, true);
        return () => window.removeEventListener('pointerdown', onPointerDown, true);
    }, [voiceMode, language]);

    return null;
}
