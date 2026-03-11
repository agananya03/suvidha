import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Dynamic Translation Fetcher Plugin
const backendIntegration = {
    type: 'backend' as const,
    read: async (language: string, namespace: string, callback: (errorValue: unknown, namespace: null | boolean | Record<string, string>) => void) => {
        // Enforce fallback immediately for 'en' to avoid infinite backend calls since code is written in EN
        if (language === 'en') {
            return callback(null, {});
        }

        try {
            // Because i18next requires fetching huge dictionary chunks (which we lack in a dynamic mock),
            // this custom backend simply returns an empty object {} initially so that components mount.
            // When translating strings dynamically later via a useDynamicTranslation hook or inline fetches,
            // we will query our `/api/translate` endpoint independently on-demand.
            // For now, satisfy i18next backend requirement:
            callback(null, {});
        } catch (error) {
            callback(error, null);
        }
    }
};

i18n
    .use(backendIntegration)
    .use(initReactI18next)
    .init({
        fallbackLng: 'en',
        lng: 'en', // default, overridden by Zustand store at runtime
        ns: ['translation'],
        defaultNS: 'translation',
        interpolation: {
            escapeValue: false // React already escapes values natively preventing XSS
        },
        react: {
            useSuspense: false, // Prevents loading screens flashing over the Kiosk when switching languages quickly
        }
    });

export default i18n;
