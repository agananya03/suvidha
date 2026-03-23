/**
 * Text-to-Speech Service
 * Handles audio playback from translated text
 * 
 * This is a FRONTEND-ONLY library that:
 * - Makes secure calls to /api/tts endpoint (backend handles Google auth)
 * - Plays and controls audio
 * - Does NOT expose any API keys
 */

/**
 * Extract readable text from the current page
 * Excludes navigation, scripts, and hidden content
 */
export function extractPageText(): string {
  const excludeSelectors = [
    'script',
    'style',
    'nav',
    '[aria-hidden="true"]',
    '.sr-only',
  ];

  const clone = document.documentElement.cloneNode(true) as HTMLElement;
  excludeSelectors.forEach((selector) => {
    clone.querySelectorAll(selector).forEach((el) => el.remove());
  });

  const text = clone.innerText
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .slice(0, 5000) // Limit to 5000 words for API constraints
    .join(' ');

  return text;
}

let currentAudio: HTMLAudioElement | null = null;

/**
 * Play audio from base64 MP3 content
 */
export async function playAudio(audioBase64: string): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Stop any existing audio
      stopAudio();

      // Convert base64 to blob
      const binaryString = atob(audioBase64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create and play audio
      const audio = new Audio(audioUrl);

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        currentAudio = null;
        resolve();
      };

      audio.onerror = (error) => {
        URL.revokeObjectURL(audioUrl);
        currentAudio = null;
        reject(error);
      };

      currentAudio = audio;
      audio.play().catch(reject);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Stop playback and cleanup
 */
export function stopAudio(): void {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
}
