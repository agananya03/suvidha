import { NextRequest, NextResponse } from 'next/server'
import { storeOTP, canRequestOTP } from '@/lib/redis'
import { generateOTP, sendOTPviaSMS, isValidPhoneNumber } from '@/lib/twilio'

/**
 * POST /api/auth/send-otp
 * 
 * Sends an OTP to the provided mobile number.
 * 
 * Request body:
 * { mobile: string }
 * 
 * Response:
 * { success: boolean, message?: string, error?: string, otp?: string (demo only) }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mobile } = body

    // Validate mobile number
    if (!mobile) {
      return NextResponse.json(
        { success: false, error: 'Mobile number is required' },
        { status: 400 }
      )
    }

    if (!isValidPhoneNumber(mobile)) {
      return NextResponse.json(
        { success: false, error: 'Invalid mobile number format. Please enter a 10-digit Indian mobile number.' },
        { status: 400 }
      )
    }

    // Check rate limiting (can user request OTP?)
    const rateCheck = await canRequestOTP(mobile)
    
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: rateCheck.error,
          waitSeconds: rateCheck.waitSeconds 
        },
        { status: 429 } // Too Many Requests
      )
    }

    // Generate 6-digit OTP
    const otp = generateOTP()

    // Store OTP in Redis with expiry (auto-deletes after 5 min)
    await storeOTP(mobile, otp)

    // Send OTP via SMS
    const smsResult = await sendOTPviaSMS(mobile, otp)

    if (!smsResult.success) {
      return NextResponse.json(
        { success: false, error: smsResult.error },
        { status: 500 }
      )
    }

    // Prepare response
    const response: {
      success: boolean
      message: string
      expiresIn: number
      otp?: string
    } = {
      success: true,
      message: 'OTP sent successfully',
      expiresIn: 300, // 5 minutes in seconds
    }

    // In demo mode, include OTP in response so it can be shown on screen
    if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
      response.otp = otp
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to send OTP. Please try again.' },
      { status: 500 }
    )
  }
}
