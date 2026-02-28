import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User, Connection, Complaint } from '@prisma/client';

export type AuthMode = 'QUICK_PAY' | 'FULL_ACCESS' | null;
export type AccessibilityMode = 'standard' | 'voice' | 'visual' | 'simplified';
export type FontSize = 'normal' | 'large' | 'xlarge';

export interface ComplaintDNA {
    departments: string[];
    priority: number;
    keywords: string[];
    queuePosition: number;
}

export interface KioskState {
    // AUTH STATE
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    authMode: AuthMode;

    // KIOSK PREFERENCES
    language: string;
    accessibilityMode: AccessibilityMode;
    highContrast: boolean;
    fontSize: FontSize;

    // SESSION STATE
    sessionStartTime: Date | null;
    lastActivityTime: Date | null;
    faceLockEnabled: boolean;
    faceLockCountdown: number | null;

    // CONNECTED SERVICES
    discoveredServices: Connection[];
    selectedConnection: Connection | null;
    address: string;

    // COMPLAINT FLOW
    currentComplaint: Partial<Complaint> | null;
    complaintDNA: ComplaintDNA | null;

    // ACTIONS
    login: (token: string, user: User, mode: AuthMode) => void;
    logout: () => void;
    setLanguage: (code: string) => void;
    setAccessibilityMode: (mode: AccessibilityMode) => void;
    setHighContrast: (enabled: boolean) => void;
    setFontSize: (size: FontSize) => void;
    setServices: (services: Connection[]) => void;
    selectConnection: (connection: Connection | null) => void;
    setAddress: (address: string) => void;
    setFaceLockEnabled: (enabled: boolean) => void;
    startFaceLockCountdown: () => void;
    cancelFaceLockCountdown: () => void;
    updateLastActivity: () => void;
    updateFaceLockCountdown: (count: number) => void;
    setCurrentComplaint: (complaint: Partial<Complaint> | null) => void;
    setComplaintDNA: (dna: ComplaintDNA | null) => void;
}

const initialState = {
    // AUTH
    token: null,
    user: null,
    isAuthenticated: false,
    authMode: null,

    // PREFERENCES (these get persisted)
    language: 'en',
    accessibilityMode: 'standard' as AccessibilityMode,
    highContrast: false,
    fontSize: 'normal' as FontSize,

    // SESSION
    sessionStartTime: null,
    lastActivityTime: null,
    faceLockEnabled: false,
    faceLockCountdown: null,

    // SERVICES
    discoveredServices: [],
    selectedConnection: null,
    address: '',

    // COMPLAINTS
    currentComplaint: null,
    complaintDNA: null,
};

export const useKioskStore = create<KioskState>()(
    persist(
        (set, get) => ({
            ...initialState,

            login: (token, user, mode) =>
                set({
                    token,
                    user,
                    isAuthenticated: true,
                    authMode: mode,
                    sessionStartTime: new Date(),
                    lastActivityTime: new Date(),
                }),

            logout: () =>
                set((state) => ({
                    ...initialState,
                    // Preserve preferences on logout
                    language: state.language,
                    accessibilityMode: state.accessibilityMode,
                    highContrast: state.highContrast,
                    fontSize: state.fontSize,
                })),

            setLanguage: (code) => set({ language: code }),

            setAccessibilityMode: (mode) => set({ accessibilityMode: mode }),

            setHighContrast: (enabled) => set({ highContrast: enabled }),

            setFontSize: (size) => set({ fontSize: size }),

            setServices: (services) => set({ discoveredServices: services }),

            selectConnection: (connection) => set({ selectedConnection: connection }),

            setAddress: (address) => set({ address }),

            setFaceLockEnabled: (enabled) => set({ faceLockEnabled: enabled }),

            startFaceLockCountdown: () =>
                set({
                    faceLockCountdown: 10,
                }),

            updateFaceLockCountdown: (count) =>
                set({
                    faceLockCountdown: count,
                }),

            cancelFaceLockCountdown: () =>
                set({
                    faceLockCountdown: null,
                }),

            updateLastActivity: () =>
                set({
                    lastActivityTime: new Date(),
                }),

            setCurrentComplaint: (complaint) => set({ currentComplaint: complaint }),

            setComplaintDNA: (dna) => set({ complaintDNA: dna }),
        }),
        {
            name: 'suvidha-kiosk-storage',
            // Only persist the language and accessibility preferences
            partialize: (state) => ({
                language: state.language,
                accessibilityMode: state.accessibilityMode,
                highContrast: state.highContrast,
                fontSize: state.fontSize,
            }),
            // We can use JSON storage from zustand
            storage: createJSONStorage(() => localStorage),
        }
    )
);
