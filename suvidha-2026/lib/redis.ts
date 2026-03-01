import { Redis } from '@upstash/redis'

/**
 * Upstash Redis Client
 * 
 * Used for storing OTPs with automatic expiry.
 * Upstash is serverless Redis - perfect for Next.js API routes.
 * 
 * Key patterns:
 * - otp:{mobile} → stores the OTP code
 * - otp_attempts:{mobile} → tracks failed attempts
 * - otp_cooldown:{mobile} → prevents spam (rate limiting)
 */

// Create Redis client using Upstash REST API
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// OTP Configuration
export const OTP_CONFIG = {
  // OTP expires after 5 minutes
  EXPIRY_SECONDS: 5 * 60,
  
  // Max failed verification attempts before OTP is invalidated
  MAX_ATTEMPTS: 3,
  
  // Cooldown before user can request another OTP (30 seconds)
  RESEND_COOLDOWN_SECONDS: 30,
  
  // Max OTPs per phone number per hour (rate limiting)
  MAX_OTP_PER_HOUR: 5,
}

/**
 * Store OTP in Redis with expiry
 * 
 * @param mobile - Phone number (key)
 * @param otp - 6-digit OTP code
 */
export async function storeOTP(mobile: string, otp: string): Promise<void> {
  const key = `otp:${mobile}`
  
  console.log(`[Redis] Storing OTP for ${mobile}: ${otp} with key: ${key}`)
  
  // Store OTP with 5-minute expiry
  // EX = expire time in seconds
  await redis.set(key, otp, { ex: OTP_CONFIG.EXPIRY_SECONDS })
  
  // Verify it was stored
  const stored = await redis.get(key)
  console.log(`[Redis] Verified stored value: ${stored}`)
  
  // Also set a cooldown to prevent immediate resend
  await redis.set(
    `otp_cooldown:${mobile}`, 
    '1', 
    { ex: OTP_CONFIG.RESEND_COOLDOWN_SECONDS }
  )
  
  // Increment hourly rate limit counter
  const rateLimitKey = `otp_rate:${mobile}`
  const current = await redis.incr(rateLimitKey)
  if (current === 1) {
    // First request in this window - set 1 hour expiry
    await redis.expire(rateLimitKey, 3600)
  }
}

/**
 * Verify OTP from Redis
 * 
 * @param mobile - Phone number
 * @param otp - OTP entered by user
 * @returns { success: boolean, error?: string }
 */
export async function verifyOTP(
  mobile: string, 
  otp: string
): Promise<{ success: boolean; error?: string }> {
  const otpKey = `otp:${mobile}`
  const attemptsKey = `otp_attempts:${mobile}`
  
  console.log(`[Redis] Verifying OTP for ${mobile} with key: ${otpKey}, entered OTP: ${otp}`)
  
  // Check if OTP exists
  const storedOTP = await redis.get<string>(otpKey)
  
  console.log(`[Redis] Stored OTP from Redis: ${storedOTP}, type: ${typeof storedOTP}`)
  
  if (!storedOTP) {
    console.log(`[Redis] OTP not found for key: ${otpKey}`)
    return { success: false, error: 'OTP expired or not found' }
  }
  
  // Check attempt count
  const attempts = await redis.get<number>(attemptsKey) || 0
  
  if (attempts >= OTP_CONFIG.MAX_ATTEMPTS) {
    // Delete the OTP - too many failed attempts
    await redis.del(otpKey)
    await redis.del(attemptsKey)
    return { success: false, error: 'Too many failed attempts. Request a new OTP.' }
  }
  
  // Verify OTP - convert both to string for comparison (Redis may return number)
  if (String(storedOTP) === String(otp)) {
    // Success! Clean up Redis keys
    await redis.del(otpKey)
    await redis.del(attemptsKey)
    return { success: true }
  }
  
  // Wrong OTP - increment attempt counter
  await redis.incr(attemptsKey)
  await redis.expire(attemptsKey, OTP_CONFIG.EXPIRY_SECONDS)
  
  const remainingAttempts = OTP_CONFIG.MAX_ATTEMPTS - attempts - 1
  return { 
    success: false, 
    error: `Invalid OTP. ${remainingAttempts} attempt${remainingAttempts !== 1 ? 's' : ''} remaining.` 
  }
}

/**
 * Check if user can request a new OTP (rate limiting)
 */
export async function canRequestOTP(mobile: string): Promise<{ 
  allowed: boolean
  waitSeconds?: number 
  error?: string 
}> {
  // Check cooldown (30 second wait between requests)
  const cooldownKey = `otp_cooldown:${mobile}`
  const cooldown = await redis.get(cooldownKey)
  
  if (cooldown) {
    const ttl = await redis.ttl(cooldownKey)
    return { 
      allowed: false, 
      waitSeconds: ttl,
      error: `Please wait ${ttl} seconds before requesting another OTP`
    }
  }
  
  // Check hourly rate limit
  const rateLimitKey = `otp_rate:${mobile}`
  const count = await redis.get<number>(rateLimitKey) || 0
  
  if (count >= OTP_CONFIG.MAX_OTP_PER_HOUR) {
    return { 
      allowed: false, 
      error: 'Too many OTP requests. Please try again later.' 
    }
  }
  
  return { allowed: true }
}

/**
 * Get remaining time for OTP expiry
 */
export async function getOTPTimeRemaining(mobile: string): Promise<number> {
  const ttl = await redis.ttl(`otp:${mobile}`)
  return ttl > 0 ? ttl : 0
}
