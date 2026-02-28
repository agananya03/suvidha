"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Webcam from "react-webcam";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useKioskStore } from "@/store/useKioskStore";
import { Camera, ShieldAlert } from "lucide-react";

const INACTIVITY_THRESHOLD_MS = 10000; // 10 seconds of inactivity triggers the countdown
const COUNTDOWN_SECONDS = 10;

export function FaceLock() {
    const router = useRouter();
    const {
        isAuthenticated,
        logout,
        updateLastActivity
    } = useKioskStore();

    const [isIdle, setIsIdle] = useState(false);
    const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
    const [isLoggedOut, setIsLoggedOut] = useState(false);

    const activityTimerRef = useRef<NodeJS.Timeout | null>(null);
    const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Reset the inactivity timer when the user interacts
    const handleUserActivity = useCallback(() => {
        if (isLoggedOut) return;

        // If we're currently idle, reset the idle state and countdown
        if (isIdle) {
            setIsIdle(false);
            setCountdown(COUNTDOWN_SECONDS);
        }

        updateLastActivity();

        // Clear existing inactivity timer
        if (activityTimerRef.current) clearTimeout(activityTimerRef.current);
        if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);

        // Set a new timer to mark as idle after INACTIVITY_THRESHOLD_MS
        activityTimerRef.current = setTimeout(() => {
            setIsIdle(true);
        }, INACTIVITY_THRESHOLD_MS);

    }, [isIdle, isLoggedOut, updateLastActivity]);

    // Set up event listeners for user activity
    useEffect(() => {
        if (!isAuthenticated || isLoggedOut) return;

        window.addEventListener("mousemove", handleUserActivity);
        window.addEventListener("touchstart", handleUserActivity);
        window.addEventListener("keypress", handleUserActivity);
        window.addEventListener("scroll", handleUserActivity);

        // Initialize the first timer
        handleUserActivity();

        return () => {
            window.removeEventListener("mousemove", handleUserActivity);
            window.removeEventListener("touchstart", handleUserActivity);
            window.removeEventListener("keypress", handleUserActivity);
            window.removeEventListener("scroll", handleUserActivity);
            if (activityTimerRef.current) clearTimeout(activityTimerRef.current);
            if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        };
    }, [isAuthenticated, isLoggedOut, handleUserActivity]);

    // Manage the countdown interval when idle
    useEffect(() => {
        if (isIdle && !isLoggedOut) {
            countdownTimerRef.current = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        // Countdown finished
                        clearInterval(countdownTimerRef.current!);
                        handleLogoutSequence();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
        };
    }, [isIdle, isLoggedOut]);

    const handleLogoutSequence = () => {
        setIsLoggedOut(true);
        logout();
        console.log("Session cleared — no data retained");

        // After 2 seconds, redirect to the kiosk home
        setTimeout(() => {
            router.push("/kiosk");
        }, 2000);
    };

    // Only render anything if the user is authenticated in the kiosk session
    if (!isAuthenticated) return null;

    return (
        <>
            {/* Small Camera Indicator (Top Right) */}
            <div className="fixed top-4 right-4 z-40 flex flex-col items-end gap-2">
                <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-3 py-2 rounded-full border border-zinc-800 text-white shadow-lg">
                    <div className="relative w-10 h-10 overflow-hidden rounded-full border-2 border-emerald-500 bg-zinc-900 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                        <Webcam
                            audio={false}
                            className="absolute w-full h-full object-cover"
                            mirrored={true}
                            videoConstraints={{
                                facingMode: "user"
                            }}
                        />
                        {/* Pulsing overlay effect */}
                        <motion.div
                            className="absolute inset-0 bg-emerald-500/20"
                            animate={{ opacity: [0.1, 0.4, 0.1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </div>
                    <div className="flex flex-col pr-1">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-semibold text-emerald-400">Face Detected</span>
                        </div>
                        <span className="text-[10px] text-zinc-400 leading-tight">Session Active</span>
                    </div>
                </div>

                {/* Privacy Notice */}
                <div className="bg-black/40 backdrop-blur-sm px-2 py-1 rounded text-[9px] text-zinc-400 flex items-center gap-1 border border-zinc-800/50">
                    <Camera size={10} />
                    Camera detects presence only — no face data stored or recognised
                </div>
            </div>

            {/* Full-Screen Logout Countdown Modal & Fade to Black */}
            <AnimatePresence>
                {(isIdle || isLoggedOut) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
                    >
                        {isLoggedOut ? (
                            // Session Ended Final State
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-center"
                            >
                                <ShieldAlert className="w-24 h-24 text-red-500 mx-auto mb-6" />
                                <h2 className="text-4xl font-bold text-white mb-2">Session Ended</h2>
                                <p className="text-xl text-zinc-400">All data cleared</p>
                            </motion.div>
                        ) : (
                            // Countdown State
                            <div className="text-center flex flex-col items-center">
                                <motion.h2
                                    initial={{ y: -20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="text-3xl font-light text-red-400 mb-8"
                                >
                                    Step away detected — session ending in
                                </motion.h2>

                                {/* Dramatic Progress Ring using Framer Motion SVG */}
                                <div className="relative w-64 h-64 mb-10 flex items-center justify-center">
                                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                                        <circle
                                            cx="128"
                                            cy="128"
                                            r="120"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="transparent"
                                            className="text-zinc-800"
                                        />
                                        <motion.circle
                                            cx="128"
                                            cy="128"
                                            r="120"
                                            stroke="currentColor"
                                            strokeWidth="8"
                                            fill="transparent"
                                            className="text-red-500"
                                            strokeDasharray={2 * Math.PI * 120}
                                            initial={{ strokeDashoffset: 0 }}
                                            animate={{
                                                strokeDashoffset: (2 * Math.PI * 120) * (1 - (countdown / COUNTDOWN_SECONDS))
                                            }}
                                            transition={{ duration: 1, ease: "linear" }}
                                        />
                                    </svg>

                                    {/* Big Number */}
                                    <motion.span
                                        key={countdown}
                                        initial={{ scale: 1.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="text-8xl font-black text-white tabular-nums tracking-tighter"
                                    >
                                        {countdown}
                                    </motion.span>
                                </div>

                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleUserActivity}
                                    className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 px-8 py-4 rounded-full text-xl font-medium transition-colors"
                                >
                                    I'm still here
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
