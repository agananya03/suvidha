import { ReactNode } from 'react'

/**
 * Kiosk Layout
 * 
 * This layout wraps all kiosk pages (auth, services, pay, etc.)
 * Route group (kiosk) doesn't affect the URL - pages are at /kiosk/*
 */
export default function KioskLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      {children}
    </div>
  )
}
