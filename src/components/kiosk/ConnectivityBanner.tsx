'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { flushSyncQueue } from '@/lib/syncFlush';

export function ConnectivityBanner() {
  const { isOnline, wasOffline } = useOnlineStatus();

  useEffect(() => {
    if (isOnline && wasOffline) {
      flushSyncQueue();
    }
  }, [isOnline, wasOffline]);

  const showOffline = !isOnline;
  const showReconnected = isOnline && wasOffline;

  if (!showOffline && !showReconnected) return null;

  return (
    <AnimatePresence>
      {showOffline && (
        <motion.div
          key="offline"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="w-full bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2"
        >
          <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
          <p className="text-amber-800 text-sm">
            No internet connection — your actions are saved and will sync automatically.
          </p>
        </motion.div>
      )}
      {showReconnected && (
        <motion.div
          key="reconnected"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="w-full bg-green-50 border-b border-green-200 px-4 py-2 flex items-center gap-2"
        >
          <Wifi className="w-4 h-4 text-green-600 shrink-0" />
          <p className="text-green-800 text-sm">
            Connection restored — syncing your data...
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
