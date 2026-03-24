/**
 * useTextToSpeech Hook
 * 
 * Manages Text-to-Speech state with proper React patterns:
 * - useRef for persistent audio instance (survives rerenders)
 * - useState for playback state
 * - No global variables = no race conditions
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/lib/store';
import { extractPageText, createAudioFromBase64, cleanupAudio } from '@/lib/textToSpeech';
import toast from 'react-hot-toast';

export function useTextToSpeech() {
  const { language } = useStore();
  const pathname = usePathname();
  
  // Use refs for audio instance - persists across rerenders
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isSpeakingRef = useRef(false);

  // State for UI
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  /**
   * Clean up audio when component unmounts or route changes
   */
  useEffect(() => {
    return () => {
      isSpeakingRef.current = false;
      if (audioRef.current) {
        cleanupAudio(audioRef.current);
        audioRef.current = null;
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [pathname]); // Also cleanup when pathname changes

  /**
   * Speak: Extract page text, call TTS API, play audio
   */
  const speak = useCallback(async () => {
    if (!isMounted) return;
    if (!language) {
      toast.error('Select a language first');
      return;
    }

    // Prevent multiple simultaneous requests
    if (isSpeakingRef.current) {
      console.log('[TTS] Already speaking, ignoring duplicate request');
      return;
    }

    isSpeakingRef.current = true;

    // Stop any currently playing audio
    if (audioRef.current) {
      cleanupAudio(audioRef.current);
      audioRef.current = null;
    }
    setIsPlaying(false);
    setIsPaused(false);

    setIsLoading(true);

    try {
      // Extract text from page
      const pageText = extractPageText();
      if (!pageText) {
        throw new Error('No text found on page');
      }

      console.log(`[TTS] Reading ${language}: ${pageText.slice(0, 50)}...`);

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      // Call backend TTS API
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: pageText,
          lang: language,
        }),
        signal: abortControllerRef.current.signal,
      });

      // Parse response once
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate speech');
      }

      const { audioContent } = data;
      if (!audioContent) {
        throw new Error('No audio content in response');
      }

      console.log('[TTS] Audio generated, starting playback...');

      // Create audio element
      const audio = createAudioFromBase64(audioContent);
      audioRef.current = audio;

      // Set up event handlers BEFORE play
      let audioCompleted = false;

      const handleEnded = () => {
        console.log('[TTS] Audio playback ended naturally');
        audioCompleted = true;
        isSpeakingRef.current = false;
        setIsPlaying(false);
        setIsPaused(false);
        cleanupAudio(audio);
        audioRef.current = null;
      };

      const handleError = (error: ErrorEvent) => {
        console.error('[TTS] Audio error:', error);
        if (!audioCompleted) {
          toast.error('Audio playback failed');
          audioCompleted = true;
          isSpeakingRef.current = false;
          setIsPlaying(false);
          setIsPaused(false);
          cleanupAudio(audio);
          audioRef.current = null;
        }
      };

      audio.addEventListener('ended', handleEnded, { once: true });
      audio.addEventListener('error', handleError, { once: true });

      // Play audio
      setIsPlaying(true);
      console.log('[TTS] About to play audio...');
      
      try {
        const playPromise = audio.play();
        console.log('[TTS] play() called, promise:', playPromise);
        
        // Wait for play to start
        if (playPromise && typeof playPromise.then === 'function') {
          await playPromise;
          console.log('[TTS] Audio started playing successfully!');
        }
      } catch (playError) {
        console.error('[TTS] Play error:', playError);
        // AbortError is expected if user clicks stop/pause quickly
        if ((playError as any)?.name !== 'AbortError') {
          throw playError;
        }
        console.log('[TTS] Playback was cancelled by user');
        isSpeakingRef.current = false;
        cleanupAudio(audio);
        audioRef.current = null;
        setIsPlaying(false);
        setIsPaused(false);
      }
    } catch (err) {
      if ((err as any)?.name === 'AbortError') {
        console.log('[TTS] Request cancelled');
        isSpeakingRef.current = false;
        return;
      }

      const errorMsg = err instanceof Error ? err.message : 'Failed to read page';
      isSpeakingRef.current = false;
      setIsPlaying(false);
      setIsPaused(false);
      toast.error(errorMsg);
      console.error('[TTS] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isMounted, language]);

  /**
   * Pause: Pause playback
   */
  const pause = useCallback(() => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      setIsPaused(true);
      setIsPlaying(false);
      console.log('[TTS] Paused');
    }
  }, []);

  /**
   * Resume: Resume from pause
   */
  const resume = useCallback(async () => {
    if (audioRef.current && audioRef.current.paused) {
      try {
        await audioRef.current.play();
        setIsPaused(false);
        setIsPlaying(true);
        console.log('[TTS] Resumed');
      } catch (err) {
        console.error('[TTS] Resume error:', err);
        toast.error('Failed to resume playback');
      }
    }
  }, []);

  /**
   * Stop: Stop playback and cleanup
   */
  const stop = useCallback(() => {
    console.log('[TTS] stop() called');
    isSpeakingRef.current = false;
    if (audioRef.current) {
      cleanupAudio(audioRef.current);
      audioRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  return {
    speak,
    pause,
    resume,
    stop,
    isPlaying,
    isPaused,
    isLoading,
  };
}
