export async function withDbRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelayMs: number = 1000
): Promise<T> {
    let lastError: any;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error: any) {
            lastError = error;
            const msg = error.message || String(error);
            console.warn(`[DB Retry] Operation failed (Attempt ${attempt}/${maxRetries}): ${msg}`);
            
            // Check if it's a connection/initialization error
            const isConnectionError = 
                error.name === 'PrismaClientInitializationError' ||
                msg.includes('cannot reach database') ||
                msg.includes('Can\'t reach database server') ||
                msg.includes('timeout') ||
                msg.includes('connection');

            if (attempt < maxRetries && isConnectionError) {
                // Exponential backoff
                const delay = baseDelayMs * attempt;
                console.log(`[DB Retry] Waiting ${delay}ms before retrying...`);
                await new Promise(res => setTimeout(res, delay));
            } else {
                break;
            }
        }
    }
    
    throw lastError;
}
