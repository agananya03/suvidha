'use client'

import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface OTPInputProps {
  length?: number
  onComplete: (otp: string) => void
  disabled?: boolean
  error?: string | null
  autoFocus?: boolean
}

/**
 * OTP Input Component
 * 
 * Features:
 * - 6 individual input boxes (configurable)
 * - Auto-advance focus on input
 * - Backspace moves to previous box
 * - Paste support (pastes across all boxes)
 * - Shake animation on error
 * - Auto-submit when complete
 */
export function OTPInput({
  length = 6,
  onComplete,
  disabled = false,
  error = null,
  autoFocus = true,
}: OTPInputProps) {
  const [otp, setOtp] = useState<string[]>(Array(length).fill(''))
  const [shake, setShake] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Trigger shake animation when error changes
  useEffect(() => {
    if (error) {
      setShake(true)
      // Reset OTP on error
      setOtp(Array(length).fill(''))
      // Focus first input
      inputRefs.current[0]?.focus()
      // Stop shake after animation
      setTimeout(() => setShake(false), 500)
    }
  }, [error, length])

  // Auto-focus first input on mount
  useEffect(() => {
    if (autoFocus) {
      inputRefs.current[0]?.focus()
    }
  }, [autoFocus])

  // Handle input change
  const handleChange = (index: number, value: string) => {
    // Only allow digits
    const digit = value.replace(/\D/g, '').slice(-1)
    
    const newOtp = [...otp]
    newOtp[index] = digit
    setOtp(newOtp)

    // Auto-advance to next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Check if OTP is complete
    if (newOtp.every((d) => d !== '')) {
      onComplete(newOtp.join(''))
    }
  }

  // Handle keyboard events
  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    // Backspace - move to previous input
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus()
      }
    }
    
    // Arrow keys for navigation
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  // Handle paste
  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    
    if (pastedData) {
      const newOtp = [...otp]
      for (let i = 0; i < pastedData.length; i++) {
        newOtp[i] = pastedData[i]
      }
      setOtp(newOtp)
      
      // Focus last filled input or last input
      const focusIndex = Math.min(pastedData.length, length - 1)
      inputRefs.current[focusIndex]?.focus()

      // Check if complete
      if (newOtp.every((d) => d !== '')) {
        onComplete(newOtp.join(''))
      }
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        className="flex gap-3"
        animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el }}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={otp[index]}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            className={cn(
              'w-14 h-16 text-center text-2xl font-bold rounded-xl border-2 transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500',
              'disabled:bg-gray-100 disabled:cursor-not-allowed',
              error
                ? 'border-red-500 bg-red-50 text-red-600'
                : otp[index]
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-300 bg-white',
              disabled && 'opacity-50'
            )}
            aria-label={`OTP digit ${index + 1}`}
          />
        ))}
      </motion.div>
      
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-sm font-medium"
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}

/**
 * Countdown Timer Component
 * Shows remaining time for OTP expiry
 */
interface CountdownTimerProps {
  expiresAt: number // Unix timestamp in milliseconds
  onExpire?: () => void
}

export function CountdownTimer({ expiresAt, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    const updateTimer = () => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000))
      setTimeLeft(remaining)
      
      if (remaining === 0 && onExpire) {
        onExpire()
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)

    return () => clearInterval(interval)
  }, [expiresAt, onExpire])

  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60

  const progressPercent = (timeLeft / 300) * 100 // 300 seconds = 5 minutes

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-lg font-mono font-semibold text-gray-700">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      
      {/* Progress bar */}
      <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className={cn(
            'h-full rounded-full',
            progressPercent > 50 ? 'bg-green-500' :
            progressPercent > 20 ? 'bg-yellow-500' : 'bg-red-500'
          )}
          initial={{ width: '100%' }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      
      <p className="text-sm text-gray-500">
        OTP expires in {minutes > 0 ? `${minutes}m ` : ''}{seconds}s
      </p>
    </div>
  )
}
