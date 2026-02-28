import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'suvidha-super-secret-key-2026';

export function signToken(payload: object) {
    // 24hr expiry as requested
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

// Mock OTP functionality (5 min expiry)
export function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export function isValidOTP(_otp: string): boolean {
    // Mock validation logic
    return true;
}
