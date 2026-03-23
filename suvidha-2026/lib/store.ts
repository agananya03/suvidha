import { create } from 'zustand';

interface User {
    id: string;
    phone: string;
    name?: string;
    language: string;
}

interface SessionState {
    user: User | null;
    token: string | null;
    language: string;

    // Accessibility State
    voiceMode: boolean;
    highContrast: boolean;
    fontSize: 'normal' | 'large' | 'xlarge';
    isISLActive: boolean;

    // Actions
    setSession: (user: User, token: string) => void;
    clearSession: () => void;
    setLanguage: (lang: string) => void;

    // Accessibility Actions
    setVoiceMode: (active: boolean) => void;
    setHighContrast: (active: boolean) => void;
    setFontSize: (size: 'normal' | 'large' | 'xlarge') => void;
    setISLActive: (active: boolean) => void;
}

export const useStore = create<SessionState>((set) => ({
    user: null,
    token: null,
    language: 'en',

    voiceMode: false,
    highContrast: false,
    fontSize: 'normal',
    isISLActive: false,

    setSession: (user, token) => set({ user, token }),
    clearSession: () => set({ user: null, token: null }),
    setLanguage: (language) => set({ language }),

    setVoiceMode: (voiceMode) => set({ voiceMode }),
    setHighContrast: (highContrast) => set({ highContrast }),
    setFontSize: (fontSize) => set({ fontSize }),
    setISLActive: (isISLActive) => set({ isISLActive }),
}));
