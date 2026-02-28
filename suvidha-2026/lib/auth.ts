import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'suvidha-super-secret-key-2026';

export interface TokenPayload {
  userId: string;
  mobile: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

// Optional helper to parse the token from a request
export function getTokenFromRequest(req: NextRequest): string | null {
  const authHeader = req.headers.get('Authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }
  
  const cookieToken = req.cookies.get('token')?.value;
  if (cookieToken) {
    return cookieToken;
  }
  
  return null;
}

export function withAuth(handler: Function) {
  return async (req: NextRequest, ...args: any[]) => {
    try {
      const token = getTokenFromRequest(req);
      
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const decoded = verifyToken(token);
      
      // Inject user info into the request if needed, or just pass it as an argument
      (req as any).user = decoded;

      return handler(req, ...args);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
  };
}
