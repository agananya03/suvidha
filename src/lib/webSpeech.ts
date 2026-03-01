import { useStore } from './store';

export const webSpeech = {
    isSupported: () => typeof window !== 'undefined' && 'speechSynthesis' in window,

    speak: (text: string, lang = 'en-US') => {
        if (!webSpeech.isSupported()) return;

        // Check if voice mode is active before speaking
        const state = useStore.getState();
        if (!state.voiceMode) return;

        webSpeech.stopSpeaking();
        const utterance = new SpeechSynthesisUtterance(text);

        // Map existing languages to TTS supported voices
        const langMap: Record<string, string> = {
            en: 'en-US',
            hi: 'hi-IN'
        };

        utterance.lang = langMap[lang] || langMap[state.language] || 'en-US';
        window.speechSynthesis.speak(utterance);
    },

    stopSpeaking: () => {
        if (!webSpeech.isSupported()) return;
        window.speechSynthesis.cancel();
    },

    autoReadHeadings: () => {
        if (!webSpeech.isSupported()) return;

        const state = useStore.getState();
        if (!state.voiceMode) return;

        // Get all headings visible on the page
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let text = '';
        headings.forEach(h => {
            // Basic check to see if element is visible
            const style = window.getComputedStyle(h);
            if (style.display !== 'none' && style.visibility !== 'hidden') {
                text += h.textContent + '. ';
            }
        });

        if (text) {
            webSpeech.speak(text, state.language);
        }
    }
};
