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
    setSession: (user: User, token: string) => void;
    clearSession: () => void;
    setLanguage: (lang: string) => void;
}

export const useStore = create<SessionState>((set) => ({
    user: null,
    token: null,
    language: 'en',
    setSession: (user, token) => set({ user, token }),
    clearSession: () => set({ user: null, token: null }),
    setLanguage: (language) => set({ language }),
}));
