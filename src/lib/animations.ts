import { Variants } from "framer-motion";

/**
 * Global animation variants for Framer Motion.
 * IMPORTANT: When using these variants, you should conditionally check `useReducedMotion()`
 * from `framer-motion` to disable animations for users with accessibility preferences.
 * 
 * Example usage:
 * const shouldReduceMotion = useReducedMotion();
 * <motion.div variants={shouldReduceMotion ? {} : fadeInUp} initial="hidden" animate="visible">
 */

export const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
};

export const staggerChildren: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

export const slideInRight: Variants = {
    hidden: { x: 100, opacity: 0 },
    visible: {
        x: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 300, damping: 30 }
    },
    exit: { x: -100, opacity: 0, transition: { duration: 0.2 } }
};

export const scaleIn: Variants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: { type: "spring", stiffness: 400, damping: 25 },
    },
};

export const pulseGlow: Variants = {
    initial: { boxShadow: "0px 0px 0px rgba(249, 115, 22, 0)" },
    animate: {
        boxShadow: [
            "0px 0px 0px rgba(249, 115, 22, 0)",
            "0px 0px 20px rgba(249, 115, 22, 0.6)",
            "0px 0px 0px rgba(249, 115, 22, 0)",
        ],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
        },
    },
};

export const countdownRing: Variants = {
    hidden: { strokeDashoffset: 100 }, // Assuming pathLength is normalized to 100
    visible: (custom: number = 100) => ({
        strokeDashoffset: custom,
        transition: { duration: 0.5, ease: "easeInOut" },
    }),
};

export const shimmer: Variants = {
    animate: {
        backgroundPosition: ["200% 0", "-200% 0"],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: "linear",
        },
    },
};

// Department badge slides in from right with bounce
export const complaintDNAReveal: Variants = {
    hidden: { x: 50, opacity: 0, scale: 0.9 },
    visible: {
        x: 0,
        opacity: 1,
        scale: 1,
        transition: {
            type: "spring",
            stiffness: 400,
            damping: 15, // Low damping for extra bounce
        },
    },
};

// SVG checkmark draws itself
export const paymentSuccessPath: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
        pathLength: 1,
        opacity: 1,
        transition: { duration: 0.6, ease: "easeInOut" },
    },
};

// Followed by scale-up
export const paymentSuccessContainer: Variants = {
    hidden: { scale: 0.5, opacity: 0 },
    visible: {
        scale: 1,
        opacity: 1,
        transition: {
            delayChildren: 0.4,
            staggerChildren: 0.2,
            type: "spring",
            stiffness: 300,
            damping: 20
        },
    },
};
