import twilio from 'twilio'

/**
 * Twilio SMS Service
 * 
 * Handles sending OTP messages via SMS.
 * In production, this sends real SMS.
 * In demo mode, we skip SMS and show OTP on screen.
 */

// Initialize Twilio client
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

const FROM_NUMBER = process.env.TWILIO_PHONE_NUMBER!

/**
 * Generate a cryptographically secure 6-digit OTP
 */
export function generateOTP(): string {
  // Use crypto for secure random number generation
  // Math.random() is NOT secure for OTPs!
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  
  // Generate a number between 100000 and 999999
  const otp = 100000 + (array[0] % 900000)
  return otp.toString()
}

/**
 * Send OTP via SMS using Twilio
 * 
 * @param to - Recipient phone number (with country code, e.g., +919876543210)
 * @param otp - 6-digit OTP code
 * @returns { success: boolean, error?: string, messageId?: string }
 */
export async function sendOTPviaSMS(
  to: string,
  otp: string
): Promise<{ success: boolean; error?: string; messageId?: string }> {
  // Check if we're in demo mode
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'
  
  if (isDemoMode) {
    // In demo mode, we don't actually send SMS
    // Just pretend we did and log for debugging
    console.log(`[DEMO MODE] OTP for ${to}: ${otp}`)
    return { 
      success: true, 
      messageId: 'DEMO_' + Date.now() 
    }
  }
  
  try {
    // Format phone number if needed (add +91 for Indian numbers)
    const formattedNumber = formatPhoneNumber(to)
    
    // Send SMS via Twilio
    const message = await client.messages.create({
      body: `Your Suvidha verification code is: ${otp}. Valid for 5 minutes. Do not share this code with anyone.`,
      from: FROM_NUMBER,
      to: formattedNumber,
    })
    
    console.log(`SMS sent to ${formattedNumber}, SID: ${message.sid}`)
    
    return {
      success: true,
      messageId: message.sid,
    }
  } catch (error: unknown) {
    console.error('Twilio SMS error:', error)
    
    // Handle specific Twilio errors
    const twilioError = error as { code?: number; message?: string }
    
    if (twilioError.code === 21211) {
      return { success: false, error: 'Invalid phone number format' }
    }
    if (twilioError.code === 21608) {
      return { success: false, error: 'Phone number is not verified (Twilio trial)' }
    }
    if (twilioError.code === 21610) {
      return { success: false, error: 'Phone number is blocked from receiving messages' }
    }
    
    return { 
      success: false, 
      error: twilioError.message || 'Failed to send SMS. Please try again.' 
    }
  }
}

/**
 * Format phone number for Twilio
 * Ensures the number has correct country code
 */
function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')
  
  // If it already has country code (10+ digits starting with country code)
  if (digits.length > 10 && digits.startsWith('91')) {
    return '+' + digits
  }
  
  // If it's a 10-digit Indian number, add +91
  if (digits.length === 10) {
    return '+91' + digits
  }
  
  // If it already has + prefix, return as is
  if (phone.startsWith('+')) {
    return phone
  }
  
  // Default: add + prefix
  return '+' + digits
}

/**
 * Validate phone number format
 * Returns true if the number appears to be valid
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')
  
  // Indian mobile numbers: 10 digits, starts with 6-9
  if (digits.length === 10) {
    return /^[6-9]\d{9}$/.test(digits)
  }
  
  // With country code: 12 digits starting with 91
  if (digits.length === 12 && digits.startsWith('91')) {
    return /^91[6-9]\d{9}$/.test(digits)
  }
  
  return false
}
