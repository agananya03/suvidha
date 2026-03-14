'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { webSpeech } from '@/lib/webSpeech';
import { useStore } from '@/lib/store';
import { KIOSK_ANNOUNCEMENTS, LANGUAGE_LOCALE_MAP } from '@/lib/kioskAnnouncements';

function speakAnnouncement(text: string, lang: string) {
  if (!text || !window.speechSynthesis) return;

  window.speechSynthesis.cancel();

  const locale = LANGUAGE_LOCALE_MAP[lang] ?? 'en-IN';
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Explicitly assign lang (fallback if voice match fails)
  utterance.lang = locale;
  utterance.rate = 0.9;

  // Prevent Chrome garbage collection bug
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any)._currentUtterance = utterance;

  // For maximum compatibility across different browsers and OS (Windows, macOS, Android),
  // we do not explicitly set utterance.voice which often fails due to strict naming conventions.
  // Instead, we simply set utterance.lang and let the browser's native TTS engine automatically 
  // route the audio to the default installed voice package for that language.
  
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.addEventListener('voiceschanged', () => {
      window.speechSynthesis.speak(utterance);
    }, { once: true });
  } else {
    window.speechSynthesis.speak(utterance);
  }
}

export function VoiceNavigator() {
    const pathname = usePathname();
    const { voiceMode, language } = useStore();

    useEffect(() => {
        if (!voiceMode) {
            window.speechSynthesis?.cancel();
            return;
        }

        const lang = language ?? 'en';
        const routeAnnouncements = KIOSK_ANNOUNCEMENTS[pathname];
        const rawAnnouncement = routeAnnouncements?.[lang] ?? routeAnnouncements?.['en'] ?? '';

        if (rawAnnouncement) {
            const timeout = setTimeout(() => {
                speakAnnouncement(rawAnnouncement, lang);
            }, 800);

            return () => {
                clearTimeout(timeout);
                window.speechSynthesis?.cancel();
            };
        } else {
            // Option 2: Fallback to reading the visible headings
            const timeout = setTimeout(() => {
                webSpeech.autoReadHeadings();
            }, 1000); // Wait a bit longer for headings to translate

            return () => {
                clearTimeout(timeout);
                window.speechSynthesis?.cancel();
            };
        }
    }, [pathname, voiceMode, language]);

    return null; // This is a logic-only component
}
