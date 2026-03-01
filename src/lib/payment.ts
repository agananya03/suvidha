export async function createMockOrder(amount: number) {
    return {
        id: 'order_' + Math.random().toString(36).substring(7),
        amount: amount * 100, // in paise
        currency: 'INR',
        receipt: 'rcpt_' + Math.random().toString(36).substring(7)
    };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function verifyPayment(_signature: string, _orderId: string, _paymentId: string) {
    // Mock verification
    return true;
}
