'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin,
  Zap,
  Flame,
  Droplets,
  Building2,
  Mic,
  QrCode,
  Loader2,
  Check,
  AlertCircle,
  Link as LinkIcon,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAuthStore } from '@/lib/auth-store'

/**
 * Service type from API
 */
interface DiscoveredService {
  type: 'ELECTRICITY' | 'GAS' | 'WATER' | 'PROPERTY_TAX'
  provider: string
  consumerNo: string
  outstanding: number
  lastBill?: number
  dueDate?: string
  status: 'ACTIVE' | 'OVERDUE' | 'PENDING'
  selected?: boolean
}

/**
 * Loading step for multi-step animation
 */
interface LoadingStep {
  id: number
  text: string
  duration: number
  completed: boolean
}

/**
 * Services Discovery Page
 * 
 * Allows user to enter their address and discover linked utility services.
 * Supports text input, voice input, and QR/Barcode scanning (mock).
 */
export default function ServicesPage() {
  const router = useRouter()
  const { user, token } = useAuthStore()

  // Address input state
  const [address, setAddress] = useState('')
  const [isListening, setIsListening] = useState(false)
  
  // Loading states
  const [isLoading, setIsLoading] = useState(false)
  const [loadingSteps, setLoadingSteps] = useState<LoadingStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  
  // Services state
  const [services, setServices] = useState<DiscoveredService[]>([])
  const [totalOutstanding, setTotalOutstanding] = useState(0)
  const [showServices, setShowServices] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pre-fill address from user profile
  useEffect(() => {
    if (user?.address) {
      setAddress(user.address)
    }
  }, [user])

  // Icon mapping for service types
  const serviceIcons = {
    ELECTRICITY: Zap,
    GAS: Flame,
    WATER: Droplets,
    PROPERTY_TAX: Building2,
  }

  const serviceColors = {
    ELECTRICITY: { bg: 'bg-yellow-100', text: 'text-yellow-600', border: 'border-yellow-300' },
    GAS: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-300' },
    WATER: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-300' },
    PROPERTY_TAX: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-300' },
  }

  // Handle voice input (Web Speech API)
  const handleVoiceInput = () => {
    // Check for Web Speech API support
    const windowWithSpeech = window as typeof window & {
      SpeechRecognition?: typeof window.SpeechRecognition
      webkitSpeechRecognition?: typeof window.SpeechRecognition
    }
    
    const SpeechRecognitionAPI = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition
    
    if (!SpeechRecognitionAPI) {
      setError('Voice input is not supported in this browser')
      return
    }

    const recognition = new SpeechRecognitionAPI()

    recognition.lang = 'en-IN'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setAddress(transcript)
    }

    recognition.onerror = () => {
      setIsListening(false)
      setError('Voice recognition failed. Please try again.')
    }

    recognition.start()
  }

  // Handle QR/Barcode scan (mock)
  const handleScanQR = () => {
    // In production, this would open camera and scan QR/barcode
    setError('QR/Barcode scanning would open camera here (demo mode)')
  }

  // Handle service discovery
  const handleDiscover = async () => {
    if (!address.trim()) {
      setError('Please enter your address')
      return
    }

    setError(null)
    setIsLoading(true)
    setShowServices(false)
    setCurrentStep(0)

    // Initialize loading steps
    const steps: LoadingStep[] = [
      { id: 1, text: 'Connecting to utility databases...', duration: 500, completed: false },
      { id: 2, text: 'Discovering linked services...', duration: 800, completed: false },
      { id: 3, text: 'Validating with India Post PIN...', duration: 400, completed: false },
      { id: 4, text: 'Services found!', duration: 300, completed: false },
    ]
    setLoadingSteps(steps)

    // Animate through steps
    for (let i = 0; i < steps.length - 1; i++) {
      setCurrentStep(i)
      setLoadingSteps(prev => prev.map((s, idx) => 
        idx === i ? { ...s, completed: true } : s
      ))
      await new Promise(resolve => setTimeout(resolve, steps[i].duration))
    }

    try {
      const response = await fetch('/api/services/discover', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          address,
          userId: user?.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Discovery failed')
      }

      // Complete final step
      setCurrentStep(steps.length - 1)
      setLoadingSteps(prev => prev.map(s => ({ ...s, completed: true })))
      
      // Wait a moment then show services
      await new Promise(resolve => setTimeout(resolve, 300))

      setServices(data.services.map((s: DiscoveredService) => ({ ...s, selected: true })))
      setTotalOutstanding(data.totalOutstanding)
      setShowServices(true)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to discover services')
    } finally {
      setIsLoading(false)
    }
  }

  // Toggle service selection
  const toggleServiceSelection = (index: number) => {
    setServices(prev => prev.map((s, i) => 
      i === index ? { ...s, selected: !s.selected } : s
    ))
  }

  // Handle link all services
  const handleLinkAll = () => {
    // In production, this would save all selected services to user account
    const selectedServices = services.filter(s => s.selected)
    console.log('Linking services:', selectedServices)
    
    // Navigate to service selection/payment menu
    router.push('/kiosk/dashboard')
  }

  // Calculate selected total
  const selectedTotal = services
    .filter(s => s.selected)
    .reduce((sum, s) => sum + s.outstanding, 0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            One Address — All Your Services
          </h1>
          <p className="text-gray-600">
            Enter your address to discover all linked utility connections
          </p>
        </motion.div>

        {/* Address Input Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-2 border-orange-200 mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-orange-500" />
                Your Address
              </CardTitle>
              <CardDescription>
                Type, speak, or scan to enter your address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Address input with autocomplete */}
              <div className="relative">
                <Input
                  type="text"
                  placeholder="12, Civil Lines, Nagpur"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="text-lg h-14 pr-24"
                  disabled={isLoading}
                />
                
                {/* Voice & QR buttons */}
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleVoiceInput}
                    disabled={isLoading}
                    className={isListening ? 'bg-red-100 text-red-600' : ''}
                  >
                    <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleScanQR}
                    disabled={isLoading}
                  >
                    <QrCode className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Demo placeholder */}
              {!address && (
                <p className="text-sm text-gray-400 italic">
                  Try: "12, Civil Lines, Nagpur" (demo placeholder)
                </p>
              )}

              {/* Error message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 text-red-500 text-sm"
                >
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </motion.div>
              )}

              {/* Discover button */}
              <Button
                onClick={handleDiscover}
                disabled={isLoading || !address.trim()}
                className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>Discover Services</>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Loading Animation */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <Card className="border-2 border-orange-100">
                <CardContent className="py-6">
                  <div className="space-y-3">
                    {loadingSteps.map((step, index) => (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.2 }}
                        className="flex items-center gap-3"
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          step.completed
                            ? 'bg-green-500'
                            : currentStep === index
                            ? 'bg-orange-500'
                            : 'bg-gray-200'
                        }`}>
                          {step.completed ? (
                            <Check className="w-4 h-4 text-white" />
                          ) : currentStep === index ? (
                            <Loader2 className="w-4 h-4 text-white animate-spin" />
                          ) : (
                            <span className="text-xs text-gray-500">{step.id}</span>
                          )}
                        </div>
                        <span className={`text-sm ${
                          step.completed
                            ? 'text-green-600 font-medium'
                            : currentStep === index
                            ? 'text-orange-600 font-medium'
                            : 'text-gray-400'
                        }`}>
                          {step.text}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Services List */}
        <AnimatePresence>
          {showServices && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              {/* Services grid */}
              <div className="grid gap-4">
                {services.map((service, index) => {
                  const Icon = serviceIcons[service.type]
                  const colors = serviceColors[service.type]
                  const isOverdue = service.status === 'OVERDUE'

                  return (
                    <motion.div
                      key={service.consumerNo}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all ${
                          service.selected
                            ? `border-2 ${colors.border} shadow-md`
                            : 'border border-gray-200 opacity-60'
                        }`}
                        onClick={() => toggleServiceSelection(index)}
                      >
                        <CardContent className="py-4">
                          <div className="flex items-center gap-4">
                            {/* Icon */}
                            <div className={`w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center`}>
                              <Icon className={`w-6 h-6 ${colors.text}`} />
                            </div>

                            {/* Details */}
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold text-gray-900">
                                  {service.provider}
                                </h3>
                                {isOverdue && (
                                  <Badge variant="destructive" className="text-xs">
                                    OVERDUE
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">
                                {service.consumerNo}
                              </p>
                            </div>

                            {/* Amount */}
                            <div className="text-right">
                              <p className={`text-xl font-bold ${
                                isOverdue ? 'text-red-600' : 'text-gray-900'
                              }`}>
                                ₹{service.outstanding.toLocaleString()}
                              </p>
                              <p className="text-xs text-gray-500">Outstanding</p>
                            </div>

                            {/* Selection indicator */}
                            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                              service.selected
                                ? 'bg-orange-500 border-orange-500'
                                : 'border-gray-300'
                            }`}>
                              {service.selected && (
                                <Check className="w-4 h-4 text-white" />
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>

              {/* Total and Link Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: services.length * 0.1 }}
              >
                <Card className="bg-orange-50 border-2 border-orange-200">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-gray-600">Total Outstanding</span>
                      <span className="text-2xl font-bold text-orange-600">
                        ₹{selectedTotal.toLocaleString()}
                      </span>
                    </div>

                    <Button
                      onClick={handleLinkAll}
                      className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                    >
                      <LinkIcon className="w-5 h-5 mr-2" />
                      Link All Services to My Account
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
