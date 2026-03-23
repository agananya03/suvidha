/**
 * In-Memory Rate Limiter for Next.js Edge / API Routes
 * Note: In a production environment with multiple server instances, 
 * this should be replaced with Redis or a dedicated rate-limiting proxy.
 */

interface RateLimitTracker {
    count: number;
    resetTime: number;
}

// Memory stores for each specific endpoint type
const otpRequests = new Map<string, RateLimitTracker>();
const loginAttempts = new Map<string, RateLimitTracker>();
const billFetches = new Map<string, RateLimitTracker>();
const complaintSubmits = new Map<string, RateLimitTracker>();

const CLEANUP_INTERVAL_MS = 1000 * 60 * 15; // 15 mins

// Utility to clean stale entries
function pruneStale(map: Map<string, RateLimitTracker>, now: number) {
    for (const [key, track] of Array.from(map.entries())) {
        if (track.resetTime < now) {
            map.delete(key);
        }
    }
}

// Global prune cycle to prevent memory leaks over time
setInterval(() => {
    const now = Date.now();
    pruneStale(otpRequests, now);
    pruneStale(loginAttempts, now);
    pruneStale(billFetches, now);
    pruneStale(complaintSubmits, now);
}, CLEANUP_INTERVAL_MS);


/**
 * Generic rate limter checkout logic
 * @returns { success: boolean, retryAfter?: number }
 */
function checkLimit(
    map: Map<string, RateLimitTracker>,
    key: string,
    limit: number,
    windowMs: number
): { success: boolean; retryAfter?: number } {
    const now = Date.now();
    let record = map.get(key);

    if (!record || record.resetTime < now) {
        // First entry or window expired
        record = { count: 1, resetTime: now + windowMs };
        map.set(key, record);
        return { success: true };
    }

    // Inside window, increment count
    record.count++;
    map.set(key, record);

    if (record.count > limit) {
        // Exceeded limit within the time frame
        const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
        return { success: false, retryAfter: retryAfterSec };
    }

    return { success: true };
}

export const rateLimiter = {
    // max 5 per mobile per hour
    checkOtpRequest: (mobile: string) =>
        checkLimit(otpRequests, mobile, 5, 1000 * 60 * 60),

    // max 10 per IP per hour
    checkLoginAttempt: (ip: string) =>
        checkLimit(loginAttempts, ip, 10, 1000 * 60 * 60),

    // max 20 per session (assuming 15 min typical session threshold bounds)
    checkBillFetch: (sessionOrIp: string) =>
        checkLimit(billFetches, sessionOrIp, 20, 1000 * 60 * 15),

    // max 5 per day per user
    checkComplaintSubmit: (userId: string) =>
        checkLimit(complaintSubmits, userId, 5, 1000 * 60 * 60 * 24),
};
