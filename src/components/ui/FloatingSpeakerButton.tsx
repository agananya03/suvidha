'use client';

import { useEffect, useState } from 'react';
import { Volume2, Square } from 'lucide-react';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Floating Speaker Button
 * Appears on every page to enable Text-to-Speech
 * Reads all page content in the selected language
 */
export function FloatingSpeakerButton() {
  const [isMounted, setIsMounted] = useState(false);
  const { speak, stop, isPlaying, isLoading } = useTextToSpeech();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Don't render until client is ready
  if (!isMounted) return null;

  const handleClick = () => {
    if (isPlaying) {
      stop();
    } else {
      speak();
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-40">
      <AnimatePresence>
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleClick}
          disabled={isLoading}
          className={`
            flex items-center justify-center gap-2 px-4 py-3 rounded-full
            font-bold text-white shadow-lg transition-all
            ${isPlaying
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-blue-500 hover:bg-blue-600'
            }
            ${isLoading && 'opacity-70 cursor-not-allowed'}
            disabled:opacity-70 disabled:cursor-not-allowed
          `}
          title={isPlaying ? 'Stop reading' : 'Read page'}
        >
          {isLoading ? (
            <>
              <div className="animate-spin">
                <Volume2 className="w-5 h-5" />
              </div>
              <span className="text-sm">Preparing...</span>
            </>
          ) : isPlaying ? (
            <>
              <Square className="w-5 h-5 fill-current" />
              <span className="text-sm">Stop</span>
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
