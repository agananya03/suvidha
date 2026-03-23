'use client';

import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Volume2, Pause, Play, X } from 'lucide-react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Floating Speaker Button
 * Appears on every page to enable Text-to-Speech
 * Features: Play, Pause, Resume, Stop with intelligent main content extraction
 * Auto-stops audio when navigating to a new page
 */
export function FloatingSpeakerButton() {
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();
  const prevPathnameRef = useRef<string | null>(null);
  const { speak, pause, resume, stop, isPlaying, isPaused, isLoading } = useTextToSpeech();

  useEffect(() => {
    setIsMounted(true);
    // Initialize pathname ref on mount
    prevPathnameRef.current = pathname;
  }, []);

  // Stop audio ONLY when pathname actually changes
  useEffect(() => {
    // Skip on initial mount (pathname not set yet)
    if (prevPathnameRef.current === null) {
      prevPathnameRef.current = pathname;
      return;
    }

    if (prevPathnameRef.current !== pathname) {
      console.log('[FloatingButton] Pathname changed:', prevPathnameRef.current, '→', pathname);
      // Pathname changed - stop audio
      if (isPlaying || isPaused) {
        console.log('[FloatingButton] Stopping audio due to route change');
        stop();
      }
      prevPathnameRef.current = pathname;
    }
    // IMPORTANT: Only depend on pathname, not on isPlaying/isPaused
    // Otherwise the effect triggers every time audio state changes
  }, [pathname]);

  // Don't render until client is ready
  if (!isMounted) return null;

  // Don't render until client is ready
  if (!isMounted) return null;

  return (
    <div className="floating-speaker-button fixed bottom-8 right-8 z-40 flex flex-col gap-2 items-end">
      <AnimatePresence>
        {/* Stop Button - Always visible when playing or paused */}
        {(isPlaying || isPaused) && (
          <motion.button
            key="stop"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={stop}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-full
              bg-gray-600 hover:bg-gray-700 text-white shadow-lg transition-all text-sm font-semibold"
            title="Stop"
          >
            <X className="w-4 h-4" />
            Stop
          </motion.button>
        )}

        {/* Pause Button - Visible when playing */}
        {isPlaying && !isPaused && (
          <motion.button
            key="pause"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={pause}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-full
              bg-amber-500 hover:bg-amber-600 text-white shadow-lg transition-all text-sm font-semibold"
            title="Pause"
          >
            <Pause className="w-4 h-4" />
            Pause
          </motion.button>
        )}

        {/* Resume Button - Visible when paused */}
        {isPaused && (
          <motion.button
            key="resume"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={resume}
            className="flex items-center justify-center gap-2 px-3 py-2 rounded-full
              bg-green-500 hover:bg-green-600 text-white shadow-lg transition-all text-sm font-semibold"
            title="Resume"
          >
            <Play className="w-4 h-4 ml-0.5" />
            Resume
          </motion.button>
        )}

        {/* Main Button - Changes based on state */}
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: !isLoading ? 1.1 : 1 }}
          whileTap={{ scale: !isLoading ? 0.95 : 1 }}
          onClick={isPlaying || isPaused ? undefined : speak}
          disabled={isLoading || isPlaying || isPaused}
          className={`
            flex items-center justify-center gap-2 px-4 py-3 rounded-full
            font-bold text-white shadow-lg transition-all min-w-max
            ${isLoading
              ? 'bg-blue-400 opacity-75 cursor-not-allowed'
              : isPlaying || isPaused
              ? 'bg-blue-400 opacity-50 cursor-default'
              : 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
            }
          `}
          title={isLoading ? 'Preparing...' : isPlaying || isPaused ? 'Use controls above' : 'Read page'}
        >
          {isLoading ? (
            <>
              <div className="animate-spin">
                <Volume2 className="w-5 h-5" />
              </div>
              <span className="text-sm">Preparing...</span>
            </>
          ) : isPlaying && !isPaused ? (
            <>
              <Volume2 className="w-5 h-5" />
              <span className="text-sm">Reading...</span>
            </>
          ) : isPaused ? (
            <>
              <Volume2 className="w-5 h-5" />
              <span className="text-sm">Paused</span>
            </>
          ) : (
            <>
              <Volume2 className="w-5 h-5" />
              <span className="text-sm">Read Page</span>
            </>
          )}
        </motion.button>
      </AnimatePresence>
    </div>
  );
}
