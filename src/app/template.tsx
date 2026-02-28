"use client";

import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { slideInRight } from "@/lib/animations";
import { usePathname } from "next/navigation";

export default function Template({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const shouldReduceMotion = useReducedMotion();

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                variants={shouldReduceMotion ? {} : slideInRight}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="flex flex-col flex-grow min-h-0 w-full relative"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    );
}
