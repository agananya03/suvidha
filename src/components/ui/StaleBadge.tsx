'use client';

import { useEffect, useState } from 'react';

interface StaleBadgeProps {
  lastSynced: number | null;
  className?: string;
}

function timeAgo(timestamp: number): string {
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} days ago`;
}

export function StaleBadge({ lastSynced, className = '' }: StaleBadgeProps) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);

  if (!lastSynced) return null;

  const ageMs = now - lastSynced;
  const fiveMin = 5 * 60 * 1000;
  const thirtyMin = 30 * 60 * 1000;

  if (ageMs < fiveMin) return null;

  const label = `Last synced ${timeAgo(lastSynced)}`;

  if (ageMs < thirtyMin) {
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full
        text-xs bg-gray-100 text-gray-500 border border-gray-200 ${className}`}>
        {label}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full
      text-xs bg-amber-50 text-amber-700 border border-amber-200 ${className}`}>
      {label} — may be outdated
    </span>
  );
}
