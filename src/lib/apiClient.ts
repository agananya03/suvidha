import { suvidhaToast } from './toast';

interface FetchOptions extends RequestInit {
    // Additional optional config can be defined here if necessary
    skipAuth?: boolean;
}

/**
 * Universal API Client for SUVIDHA 2026.
 * Standardizes fetch requests, injects dynamic Authorization headers,
 * handles 401 Session interceptions and 429 Rate limiting visually.
 */
export async function apiClient<T>(
    url: string,
    options: FetchOptions = {}
): Promise<T> {
    const { skipAuth, ...fetchOptions } = options;

    let headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(fetchOptions.headers || {}),
    };

    // 1. Inject Authentication globally unless bypassed
    if (!skipAuth && typeof window !== 'undefined') {
        const token = localStorage.getItem('suvidha_session_token');
        if (token) {
            headers = { ...headers, Authorization: `Bearer ${token}` };
        }
    }

    const enhancedOptions: RequestInit = {
        ...fetchOptions,
        headers,
    };

    try {
        const response = await fetch(url, enhancedOptions);

        // 2. Global Error Trapping & Visual Interception

        if (response.status === 401) {
            // Unauthorized - Purge local session and redirect
            if (typeof window !== 'undefined') {
                localStorage.removeItem('suvidha_session_token');
                localStorage.removeItem('suvidha_user_meta');
                window.location.href = '/kiosk?session_expired=true';
            }
            throw new Error('Authentication expired. Redirecting...');
        }

        if (response.status === 429) {
            // Too Many Requests
            suvidhaToast.rateLimit();
            throw new Error('Rate limit exceeded');
        }

        if (!response.ok) {
            // Attempt to parse standard error structures returned by our API
            let errorMsg = 'An unexpected server error occurred.';
            try {
                const errorData = await response.json();
                errorMsg = errorData.error || errorData.message || errorMsg;
            } catch {
                // Fallback to strict status parsing if no json payload was mounted
                errorMsg = `Server responded with ${response.status} ${response.statusText}`;
            }

            console.warn(`[apiClient] Failed Request to ${url}:`, errorMsg);
            throw new Error(errorMsg);
        }

        // 3. Successful resolution parsing
        const data = await response.json();
        return data as T;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error(`[apiClient] Exception bridging ${url}:`, error);

        // --- DEMO FALLBACK LAYER ---
        const isBrowser = typeof window !== 'undefined';
        const isMockBypassEnabled = isBrowser && localStorage.getItem('suvidha_demo_bypass') !== 'false';

        if (isMockBypassEnabled && fetchOptions.method === 'GET') {
            console.warn(`[DEMO FALLBACK] Triggering synthetic payload for failed ${url}`);
            suvidhaToast.success(`DEMO MODE: Simulated response constructed for ${url}`);

            return {
                _demoFallbackEnacted: true,
                data: []
            } as unknown as T;
        }

        throw error;
    }
}

// Convenience Methods Exported referencing the main client
export const api = {
    get: <T>(url: string, options?: FetchOptions) =>
        apiClient<T>(url, { ...options, method: 'GET' }),

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    post: <T>(url: string, body: any, options?: FetchOptions) =>
        apiClient<T>(url, { ...options, method: 'POST', body: JSON.stringify(body) }),

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    put: <T>(url: string, body: any, options?: FetchOptions) =>
        apiClient<T>(url, { ...options, method: 'PUT', body: JSON.stringify(body) }),

    delete: <T>(url: string, options?: FetchOptions) =>
        apiClient<T>(url, { ...options, method: 'DELETE' }),
};
