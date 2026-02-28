import toast from 'react-hot-toast';

/**
 * Pre-configured Toast Templates matching SUVIDHA styling and citizen workflows.
 */

export const suvidhaToast = {
    // 1. Success States
    success: (message: string) =>
        toast.success(message, {
            icon: '✅',
            style: {
                background: '#047857', // emerald-700
                color: '#ffffff',
                fontWeight: 'bold',
            },
        }),

    // 2. Error States
    error: (message: string) =>
        toast.error(message, {
            icon: '❌',
            style: {
                background: '#dc2626', // red-600
                color: '#ffffff',
                fontWeight: 'bold',
            },
        }),

    // 3. Informational/Loading States
    loading: (message: string) =>
        toast.loading(message, {
            style: {
                background: '#1e3a8a', // blue-900 (navy)
                color: '#ffffff',
                fontWeight: 'bold',
            },
        }),

    // Clean up loading toasts easily
    dismiss: (id: string) => toast.dismiss(id),

    // --- Specific Pre-Fab Workflows Requested ---

    otpSent: (mobile: string) =>
        suvidhaToast.success(`OTP sent to +91 ${mobile.replace(/.(?=.{4})/g, 'x')}. Valid for 5 minutes.`),

    authSuccess: () =>
        suvidhaToast.success('Welcome! Session started.'),

    paymentSuccess: (amount: number) =>
        suvidhaToast.success(`Payment of ₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} successful! Receipt generated.`),

    complaintFiled: (ticketId: string) =>
        suvidhaToast.success(`Complaint ${ticketId} filed successfully.`),

    sessionWarning: () =>
        toast('Session expires in 2 minutes. Tap to extend.', {
            icon: '⚠️',
            style: {
                background: '#f59e0b', // amber-500
                color: '#ffffff',
                fontWeight: 'bold',
            },
            duration: 8000
        }),

    rateLimit: () =>
        suvidhaToast.error('Too many attempts. Please wait 10 minutes.'),

    tokenGenerated: (token: string) =>
        suvidhaToast.success(`Token ${token} created. Valid 48 hours.`)
};
