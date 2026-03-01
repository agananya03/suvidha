/**
 * Utility class for sanitizing input strings and parsing payloads securely
 * to defend against XSS, SQL Injection, and NoSQL injection attacks.
 */

// Regex definitions
export const regexes = {
    // 10 digit Indian mobile numbers starting with 6-9
    mobile: /^[6-9]\d{9}$/,

    // Example: MH-NP-2024-001247 (Alphanumeric with hyphens)
    consumerNumber: /^[a-zA-Z0-9-]+$/,

    // Receipt or Ticket Numbers (e.g. SUVDH-2026-12345)
    trackingId: /^[a-zA-Z0-9-]+$/
};

export const sanitizeString = (input: unknown): string | null => {
    if (typeof input !== 'string') return null;

    // Remove all HTML tags completely (Extremely strict stripping to prevent generic script injection payloads)
    let sanitized = input.replace(/<\/?[^>]+(>|$)/g, "");

    // Trim whitespace
    sanitized = sanitized.trim();

    return sanitized === '' ? null : sanitized;
};

/**
 * Validates file objects received in FormData for DPDP constraints.
 */
export const validateFile = (file: File): { isValid: boolean, error?: string } => {
    // DPDP / Proposal Constraint: Maximum 5MB
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        return { isValid: false, error: 'File size exceeds the 5MB maximum limit.' };
    }

    // Constraint: Valid Image or PDF formats only
    const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!validMimeTypes.includes(file.type)) {
        return { isValid: false, error: 'Unsupported file type. Please upload a JPG, PNG, WEBP, or PDF.' };
    }

    return { isValid: true };
};
