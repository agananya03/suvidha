export async function createMockOrder(amount: number) {
    return {
        id: 'order_' + Math.random().toString(36).substring(7),
        amount: amount * 100, // in paise
        currency: 'INR',
        receipt: 'rcpt_' + Math.random().toString(36).substring(7)
    };
}

export async function verifyPayment(signature: string, orderId: string, paymentId: string) {
    // Mock verification
    return true;
}
