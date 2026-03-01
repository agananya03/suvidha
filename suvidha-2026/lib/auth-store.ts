import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * User type from our Prisma schema
 */
interface User {
  id: string
  mobile: string
  name?: string | null
  address?: string | null
  connections?: Connection[]
  isNewUser?: boolean
}

interface Connection {
  id: string
  type: 'ELECTRICITY' | 'GAS' | 'WATER' | 'PROPERTY_TAX'
  provider: string
  consumerNumber: string
  address: string
  outstandingAmt: number
  lastBillAmt: number
}

/**
 * Auth modes for the kiosk
 * QUICK_PAY: No login needed, just enter consumer number
 * FULL_ACCESS: OTP login required for full features
 */
type AuthMode = 'QUICK_PAY' | 'FULL_ACCESS' | null

/**
 * Auth Store State
 */
interface AuthState {
  // Current auth mode
  authMode: AuthMode
  
  // JWT token (set after OTP verification)
  token: string | null
  
  // User data (set after OTP verification)
  user: User | null
  
  // OTP flow state
  otpSent: boolean
  otpMobile: string | null
  otpExpiresAt: number | null // Unix timestamp
  demoOTP: string | null // Only in demo mode
  
  // Loading states
  isLoading: boolean
  
  // Actions
  setAuthMode: (mode: AuthMode) => void
  setOTPSent: (mobile: string, expiresAt: number, demoOTP?: string) => void
  clearOTPState: () => void
  setAuthenticated: (token: string, user: User) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  updateUser: (updates: Partial<User>) => void
}

/**
 * Auth Store using Zustand
 * 
 * Persists to localStorage so user stays logged in across page refreshes.
 * Uses 'suvidha-auth' as the storage key.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Initial state
      authMode: null,
      token: null,
      user: null,
      otpSent: false,
      otpMobile: null,
      otpExpiresAt: null,
      demoOTP: null,
      isLoading: false,

      // Set auth mode (QUICK_PAY or FULL_ACCESS)
      setAuthMode: (mode) => set({ authMode: mode }),

      // Called after OTP is sent successfully
      setOTPSent: (mobile, expiresAt, demoOTP) => set({
        otpSent: true,
        otpMobile: mobile,
        otpExpiresAt: expiresAt,
        demoOTP: demoOTP || null,
      }),

      // Clear OTP state (for retry or timeout)
      clearOTPState: () => set({
        otpSent: false,
        otpMobile: null,
        otpExpiresAt: null,
        demoOTP: null,
      }),

      // Called after successful OTP verification
      setAuthenticated: (token, user) => set({
        token,
        user,
        otpSent: false,
        otpMobile: null,
        otpExpiresAt: null,
        demoOTP: null,
      }),

      // Logout - clear all auth state
      logout: () => set({
        authMode: null,
        token: null,
        user: null,
        otpSent: false,
        otpMobile: null,
        otpExpiresAt: null,
        demoOTP: null,
        isLoading: false,
      }),

      // Set loading state
      setLoading: (loading) => set({ isLoading: loading }),

      // Update user data (e.g., after profile edit)
      updateUser: (updates) => set((state) => ({
        user: state.user ? { ...state.user, ...updates } : null,
      })),
    }),
    {
      name: 'suvidha-auth', // Key in localStorage
      partialize: (state) => ({
        // Only persist these fields
        token: state.token,
        user: state.user,
        authMode: state.authMode,
      }),
    }
  )
)

/**
 * Helper hook to check if user is authenticated
 */
export const useIsAuthenticated = () => {
  const token = useAuthStore((state) => state.token)
  return !!token
}

/**
 * Helper hook to get auth header for API calls
 */
export const useAuthHeader = () => {
  const token = useAuthStore((state) => state.token)
  return token ? { Authorization: `Bearer ${token}` } : {}
}
