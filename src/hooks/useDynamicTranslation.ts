'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslation as useOriginalTranslation } from 'react-i18next';
import { useStore } from '@/lib/store';

// --------------------------------------------------------------------------
// Global translation cache: language_text -> translated string
const translationCache: Record<string, string> = {};

// Global subscriber registry — all instances share this so they all re-render
// together when any translation batch arrives.
const subscribers = new Set<() => void>();
let batchTimer: ReturnType<typeof setTimeout> | null = null;
let pendingNotify = false;

function notifyAll() {
    if (pendingNotify) return;
    pendingNotify = true;
    // Batch in one RAF so multiple cache fills in the same tick cause a single re-render pass
    if (batchTimer) clearTimeout(batchTimer);
    batchTimer = setTimeout(() => {
        pendingNotify = false;
        subscribers.forEach(fn => fn());
    }, 30);
}
// --------------------------------------------------------------------------

export function useDynamicTranslation() {
    const { i18n } = useOriginalTranslation();
    const { language } = useStore();
    // Local counter purely to force re-render when the global notifier fires
    const [, setTick] = useState(0);

    useEffect(() => {
        const handler = () => setTick(n => n + 1);
        subscribers.add(handler);
        return () => { subscribers.delete(handler); };
    }, []);

    // When language changes, immediately re-render all subscribers so they
    // call t() with the new language and trigger fresh fetches as needed.
    useEffect(() => {
        notifyAll();
    }, [language]);


    // When language changes, nothing needs clearing — cache keys are already
    // namespaced by language (e.g., "hi_Pay Bill"), so new-language strings
    // will be fetched fresh on first render for each component.

    const t = useCallback((text: string, options?: Record<string, unknown>): string => {
        const defaultValue = (options?.defaultValue as string) || text;

        if (!language || language === 'en') {
            return defaultValue;
        }

        const cacheKey = `${language}__${defaultValue}`;

        if (translationCache[cacheKey] && translationCache[cacheKey] !== defaultValue + '__pending') {
            return translationCache[cacheKey];
        }

        // Guard against sending duplicate concurrent requests for the same key
        if (translationCache[cacheKey] === defaultValue + '__pending') {
            return defaultValue; // Still loading
        }

        translationCache[cacheKey] = defaultValue + '__pending';

        fetch('/api/translate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: defaultValue, targetLang: language })
        })
        .then(res => res.json())
        .then(data => {
            if (data.translatedText && data.translatedText !== defaultValue) {
                translationCache[cacheKey] = data.translatedText;
            } else {
                // API returned same text or empty — store original so we don't refetch
                translationCache[cacheKey] = defaultValue;
            }
            notifyAll();
        })
        .catch(() => {
            translationCache[cacheKey] = defaultValue; // Fallback on error
            notifyAll();
        });

        return defaultValue; // Show English while fetch is in-flight
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [language]);

    return { t, i18n };
}
