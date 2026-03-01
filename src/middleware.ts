import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protect /dashboard and /admin routes
const protectedRoutes = ['/dashboard', '/admin'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if the route is protected
    const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

    if (isProtected) {
        // Extract token from Authorization header or cookies
        const authHeader = request.headers.get('Authorization');
        const token =
            (authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null) ||
            request.cookies.get('token')?.value;

        if (!token) {
            // Redirect to /kiosk/auth if no valid JWT
            const loginUrl = new URL('/kiosk/auth', request.url);
            return NextResponse.redirect(loginUrl);
        }

        // Since we are in the Edge Runtime here, we can't easily use jsonwebtoken directly
        // to verify the token because it relies on Node.js core modules (crypto, buffer).
        // The actual token verification should happen in the API routes using `withAuth` 
        // from our lib/auth.ts, or using a library like `jose`. 
        // Here we are simply checking for the token's presence to protect the layout.
    }

    // Default response allows the request to proceed
    const response = NextResponse.next();

    // --- SECURITY HEADERS (DPDP Act 2023 & General Best Practices) ---
    // Prevent Clickjacking
    response.headers.set('X-Frame-Options', 'DENY');

    // Prevent MIME-type sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // Control referer info
    response.headers.set('Referrer-Policy', 'no-referrer');

    // Face-Lock camera permission strictly for self origin
    response.headers.set('Permissions-Policy', 'camera=self');

    // Basic CSP restricting external execution except where needed
    // (In production, this might need hashes for Next.js inline scripts)
    const csp = `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval';
        style-src 'self' 'unsafe-inline';
        img-src 'self' data: blob: https:;
        font-src 'self';
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
        upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim();

    response.headers.set('Content-Security-Policy', csp);

    return response;
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
