/**
 * Text-to-Speech Utilities
 * Pure functions - no state management
 * State is managed in the React hook (useRef)
 */

/**
 * Extract readable text from MAIN CONTENT AREA only
 */
export function extractPageText(): string {
  const mainSelectors = [
    'main',
    '[role="main"]',
    'article',
    '.main-content',
    '.content',
    '.page-content',
  ];

  let contentElement: HTMLElement | null = null;
  for (const selector of mainSelectors) {
    contentElement = document.querySelector(selector) as HTMLElement;
    if (contentElement) break;
  }

  if (!contentElement) {
    contentElement = document.body;
  }

  const clone = contentElement.cloneNode(true) as HTMLElement;

  const excludeSelectors = [
    'script',
    'style',
    'nav',
    'header',
    'footer',
    'aside',
    '[aria-hidden="true"]',
    '.sr-only',
    '.navigation',
    '.sidebar',
    '.mobile-nav',
    '.floating-speaker-button',
    '.accessibility',
    '.accessibility-toolbar',
    '.accessibility-menu',
    '.accessibility-tools',
    '[class*="accessibility"]',
    '[id*="accessibility"]',
    '[class*="a11y"]',
    '[role="complementary"]',
    '[role="navigation"]',
  ];

  excludeSelectors.forEach((selector) => {
    clone.querySelectorAll(selector).forEach((el) => el.remove());
  });

  const text = clone.innerText
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .slice(0, 5000)
    .join(' ');

  return text;
}

/**
 * Create Audio element from base64 MP3
 * Returns the audio element - caller is responsible for managing its lifecycle
 */
export function createAudioFromBase64(audioBase64: string): HTMLAudioElement {
  const binaryString = atob(audioBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const audioBlob = new Blob([bytes], { type: 'audio/mpeg' });
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  
  // Store URL on audio element so it can be cleaned up later
  (audio as any).__audioUrl = audioUrl;
  
  return audio;
}

/**
 * Clean up audio element and its resources
 */
export function cleanupAudio(audio: HTMLAudioElement | null): void {
  if (!audio) return;
  
  try {
    audio.pause();
    audio.currentTime = 0;
    
    const audioUrl = (audio as any).__audioUrl;
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      (audio as any).__audioUrl = null;
    }
  } catch (error) {
    console.error('[TTS] Error cleaning up audio:', error);
  }
}
