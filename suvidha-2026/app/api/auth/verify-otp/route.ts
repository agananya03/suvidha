import { NextRequest, NextResponse } from 'next/server'
import { verifyOTP } from '@/lib/redis'
import { isValidPhoneNumber } from '@/lib/twilio'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'suvidha-default-secret'

/**
 * POST /api/auth/verify-otp
 * 
 * Verifies the OTP entered by user and returns a session token.
 * 
 * Request body:
 * { mobile: string, otp: string }
 * 
 * Response:
 * { success: boolean, token?: string, user?: User, error?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { mobile, otp } = body

    // Validate inputs
    if (!mobile || !otp) {
      return NextResponse.json(
        { success: false, error: 'Mobile number and OTP are required' },
        { status: 400 }
      )
    }

    if (!isValidPhoneNumber(mobile)) {
      return NextResponse.json(
        { success: false, error: 'Invalid mobile number format' },
        { status: 400 }
      )
    }

    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { success: false, error: 'OTP must be 6 digits' },
        { status: 400 }
      )
    }

    // Verify OTP from Redis
    const verification = await verifyOTP(mobile, otp)

    if (!verification.success) {
      return NextResponse.json(
        { success: false, error: verification.error },
        { status: 401 }
      )
    }

    // OTP verified! (Redis already deleted it to prevent reuse)

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { mobile },
      include: {
        connections: true,
      },
    })

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          mobile,
        },
        include: {
          connections: true,
        },
      })
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        mobile: user.mobile,
        iat: Math.floor(Date.now() / 1000),
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Return success with token and user data
    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      token,
      user: {
        id: user.id,
        mobile: user.mobile,
        name: user.name,
        address: user.address,
        connections: user.connections,
        isNewUser: !user.name, // New user if no name set
      },
    })

  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json(
      { success: false, error: 'Verification failed. Please try again.' },
      { status: 500 }
    )
  }
}
