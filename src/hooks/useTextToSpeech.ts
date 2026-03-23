/**
 * useTextToSpeech Hook
 * 
 * Manages Text-to-Speech state and control
 * Calls backend /api/tts which uses Service Account for secure authentication
 * 
 * Usage:
 * const { speak, stop, isPlaying, isLoading } = useTextToSpeech();
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { playAudio, stopAudio, extractPageText } from '@/lib/textToSpeech';
import toast from 'react-hot-toast';

export function useTextToSpeech() {
  const { language } = useStore();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  /**
   * Speak: Extract page text, send to TTS API, play audio
   */
  const speak = useCallback(async () => {
    if (!isMounted) return;
    if (!language) {
      toast.error('Select a language first');
      return;
    }

    setIsLoading(true);

    try {
      // Extract all readable text from page
      const pageText = extractPageText();
      if (!pageText) {
        throw new Error('No text found on page');
      }

      // Call backend TTS API (Service Account secured)
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: pageText,
          lang: language,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate speech');
      }

      const { audioContent } = await response.json();

      // Play the audio
      setIsPlaying(true);
      await playAudio(audioContent);
      setIsPlaying(false);

      toast.success('Finished reading');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to read page';
      setIsPlaying(false);
      toast.error(errorMsg);
      console.error('[useTextToSpeech Error]', err);
    } finally {
      setIsLoading(false);
    }
  }, [isMounted, language]);

  /**
   * Stop: Stop playback and reset state
   */
  const stop = useCallback(() => {
    stopAudio();
    setIsPlaying(false);
  }, []);

  return {
    speak,
    stop,
    isPlaying,
    isLoading,
  };
}
