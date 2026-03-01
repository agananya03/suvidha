'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, Shield, Phone, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { OTPInput, CountdownTimer } from '@/components/otp-input'
import { useAuthStore } from '@/lib/auth-store'

/**
 * Kiosk Authentication Page
 * 
 * Two paths:
 * PATH A - Quick Pay: No login, just consumer number
 * PATH B - Full Access: OTP verification for full features
 */
export default function KioskAuthPage() {
  const router = useRouter()
  const {
    authMode,
    setAuthMode,
    otpSent,
    otpMobile,
    otpExpiresAt,
    demoOTP,
    setOTPSent,
    clearOTPState,
    setAuthenticated,
    isLoading,
    setLoading,
  } = useAuthStore()

  // Local state
  const [mobile, setMobile] = useState('')
  const [consumerNumber, setConsumerNumber] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [resendAvailable, setResendAvailable] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(30)

  // Animation variants
  const cardVariants = {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
    hover: { scale: 1.02, boxShadow: '0 10px 40px rgba(0,0,0,0.1)' },
    tap: { scale: 0.98 },
  }

  const stepVariants = {
    initial: { x: 50, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  }

  // Handle Quick Pay submission
  const handleQuickPay = async () => {
    if (!consumerNumber.trim()) {
      setError('Please enter your consumer number')
      return
    }
    setLoading(true)
    setAuthMode('QUICK_PAY')
    // Navigate to pay page with consumer number
    router.push(`/kiosk/pay?consumer=${encodeURIComponent(consumerNumber)}`)
  }

  // Handle Send OTP
  const handleSendOTP = async () => {
    setError(null)
    
    if (!mobile.trim()) {
      setError('Please enter your mobile number')
      return
    }

    // Basic validation (10 digits)
    const cleanMobile = mobile.replace(/\D/g, '')
    if (cleanMobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: cleanMobile }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to send OTP')
        setLoading(false)
        return
      }

      // OTP sent successfully
      const expiresAt = Date.now() + data.expiresIn * 1000
      setOTPSent(cleanMobile, expiresAt, data.otp) // data.otp only present in demo mode
      setResendAvailable(false)
      setResendCountdown(30)
      
      // Start resend countdown
      const interval = setInterval(() => {
        setResendCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            setResendAvailable(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)

    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle OTP verification
  const handleVerifyOTP = async (otp: string) => {
    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: otpMobile, otp }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Invalid OTP')
        setLoading(false)
        return
      }

      // Success! Store auth data and navigate
      setAuthenticated(data.token, data.user)
      router.push('/kiosk/services')

    } catch (err) {
      setError('Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Handle back button
  const handleBack = () => {
    if (otpSent) {
      clearOTPState()
    } else if (authMode) {
      setAuthMode(null)
      setError(null)
    }
  }

  // Render path selection (initial view)
  const renderPathSelection = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Suvidha Kiosk</h1>
        <p className="text-gray-600">Choose how you'd like to proceed</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* PATH A: Quick Pay */}
        <motion.div
          variants={cardVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          whileTap="tap"
        >
          <Card
            className="cursor-pointer border-2 hover:border-yellow-400 transition-colors h-full"
            onClick={() => setAuthMode('QUICK_PAY')}
          >
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-yellow-600" />
              </div>
              <CardTitle className="text-xl">Quick Bill Payment</CardTitle>
              <CardDescription>Pay instantly with just your consumer number</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-gray-600 space-y-2 mb-4">
                <li>✓ No OTP or registration needed</li>
                <li>✓ Enter consumer number & pay</li>
                <li>✓ Perfect for quick payments</li>
              </ul>
              <Button variant="outline" className="w-full">
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* PATH B: Full Access */}
        <motion.div
          variants={cardVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          whileTap="tap"
          transition={{ delay: 0.1 }}
        >
          <Card
            className="cursor-pointer border-2 hover:border-orange-400 transition-colors h-full"
            onClick={() => setAuthMode('FULL_ACCESS')}
          >
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-orange-600" />
              </div>
              <CardTitle className="text-xl">Full Access — All Services</CardTitle>
              <CardDescription>File complaints, manage connections, track status</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-gray-600 space-y-2 mb-4">
                <li>✓ View all your utility connections</li>
                <li>✓ File & track complaints</li>
                <li>✓ Manage family member access</li>
              </ul>
              <Button className="w-full bg-orange-500 hover:bg-orange-600">
                Login with OTP <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Family member note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200"
      >
        <p className="text-sm text-blue-800 text-center">
          <strong>Family member?</strong> Any household member can access your connections without individual registration
        </p>
      </motion.div>
    </motion.div>
  )

  // Render Quick Pay form
  const renderQuickPayForm = () => (
    <motion.div
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full max-w-md mx-auto"
    >
      <Card className="border-2 border-yellow-200">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-yellow-600" />
          </div>
          <CardTitle>Quick Bill Payment</CardTitle>
          <CardDescription>Enter your consumer number to fetch bill details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Enter Consumer Number"
              value={consumerNumber}
              onChange={(e) => setConsumerNumber(e.target.value)}
              className="text-lg h-14 text-center"
              aria-label="Consumer Number"
            />
          </div>
          
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}

          <Button
            onClick={handleQuickPay}
            disabled={isLoading}
            className="w-full h-12 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>Fetch Bill & Pay</>
            )}
          </Button>

          <Button
            variant="ghost"
            onClick={handleBack}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )

  // Render Full Access OTP flow
  const renderFullAccessForm = () => (
    <motion.div
      variants={stepVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full max-w-md mx-auto"
    >
      <Card className="border-2 border-orange-200">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            {otpSent ? (
              <Phone className="w-8 h-8 text-orange-600" />
            ) : (
              <Shield className="w-8 h-8 text-orange-600" />
            )}
          </div>
          <CardTitle>
            {otpSent ? 'Enter OTP' : 'Full Access Login'}
          </CardTitle>
          <CardDescription>
            {otpSent
              ? `We've sent a 6-digit code to ${otpMobile}`
              : 'Enter your mobile number to receive OTP'
            }
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <AnimatePresence mode="wait">
            {!otpSent ? (
              // Step 1: Mobile number input
              <motion.div
                key="mobile-input"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-4"
              >
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                    +91
                  </span>
                  <Input
                    type="tel"
                    inputMode="numeric"
                    placeholder="Enter 10-digit mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="text-lg h-14 pl-14"
                    aria-label="Mobile Number"
                  />
                </div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-500 text-sm text-center"
                  >
                    {error}
                  </motion.p>
                )}

                <Button
                  onClick={handleSendOTP}
                  disabled={isLoading || mobile.length < 10}
                  className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>Send OTP</>
                  )}
                </Button>
              </motion.div>
            ) : (
              // Step 2: OTP entry
              <motion.div
                key="otp-input"
                variants={stepVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="space-y-6"
              >
                {/* Demo mode badge */}
                {demoOTP && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex justify-center"
                  >
                    <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300 px-4 py-2 text-lg">
                      DEMO MODE — Entered OTP: {demoOTP}
                    </Badge>
                  </motion.div>
                )}

                <OTPInput
                  onComplete={handleVerifyOTP}
                  disabled={isLoading}
                  error={error}
                />

                {/* Countdown timer */}
                {otpExpiresAt && (
                  <CountdownTimer
                    expiresAt={otpExpiresAt}
                    onExpire={() => {
                      clearOTPState()
                      setError('OTP expired. Please request a new one.')
                    }}
                  />
                )}

                {/* Resend button */}
                <div className="text-center">
                  {resendAvailable ? (
                    <Button
                      variant="link"
                      onClick={handleSendOTP}
                      disabled={isLoading}
                      className="text-orange-600"
                    >
                      Resend OTP
                    </Button>
                  ) : resendCountdown > 0 ? (
                    <p className="text-sm text-gray-500">
                      Resend OTP in {resendCountdown}s
                    </p>
                  ) : null}
                </div>

                {isLoading && (
                  <div className="flex justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            variant="ghost"
            onClick={handleBack}
            className="w-full"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center p-6">
      <AnimatePresence mode="wait">
        {!authMode && renderPathSelection()}
        {authMode === 'QUICK_PAY' && renderQuickPayForm()}
        {authMode === 'FULL_ACCESS' && renderFullAccessForm()}
      </AnimatePresence>
    </div>
  )
}
