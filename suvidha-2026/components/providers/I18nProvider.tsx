'use client';

import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';
import { ReactNode, useEffect } from 'react';
import { useStore } from '@/lib/store';

export function I18nProvider({ children }: { children: ReactNode }) {
    const { language } = useStore();

    useEffect(() => {
        // Sync i18n language with Zustand store immediately when it mounts or changes
        if (i18n.language !== language) {
            i18n.changeLanguage(language);
        }
    }, [language]);

    return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
