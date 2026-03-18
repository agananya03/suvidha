"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useKioskStore } from "@/store/useKioskStore";
import { Camera, ShieldAlert } from "lucide-react";

// ─── Tuning ──────────────────────────────────────────────────────────────────
const POLL_MS = 600;               // how often we sample the webcam
const VARIANCE_THRESHOLD = 300;    // min pixel variance to count as "person present"
                                   // lower = more sensitive, higher = less sensitive
const NO_FACE_GRACE_MS = 3000;     // blank frames required before alarm fires (ms)
const COUNTDOWN_SECONDS = 10;
const CANVAS_W = 120;              // low-res sample canvas (speed)
const CANVAS_H = 90;
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Measure pixel variance across the canvas frame.
 * High variance → a person is in front (skin, hair, clothes create variation)
 * Near-zero variance → empty background (uniform colour)
 */
function getFrameVariance(ctx: CanvasRenderingContext2D, w: number, h: number): number {
    const { data } = ctx.getImageData(0, 0, w, h);
    const n = data.length / 4;
    let sumR = 0, sumG = 0, sumB = 0;

    for (let i = 0; i < data.length; i += 4) {
        sumR += data[i];
        sumG += data[i + 1];
        sumB += data[i + 2];
    }
    const mR = sumR / n, mG = sumG / n, mB = sumB / n;

    let variance = 0;
    for (let i = 0; i < data.length; i += 4) {
        variance += (data[i] - mR) ** 2 + (data[i + 1] - mG) ** 2 + (data[i + 2] - mB) ** 2;
    }
    return variance / n;
}

export function FaceLock() {
    const router = useRouter();
    const { isAuthenticated, logout } = useKioskStore();

    const webcamRef = useRef<Webcam>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Use refs for all timer/state accessed inside the detection loop
    // to avoid stale-closure bugs completely.
    const pollTimerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
    const noFaceTimerRef  = useRef<ReturnType<typeof setTimeout> | null>(null);
    const countdownRef    = useRef<ReturnType<typeof setInterval> | null>(null);
    const isIdleRef       = useRef(false);
    const isLoggedOutRef  = useRef(false);

    // React state only for UI rendering
    const [facePresent, setFacePresent]   = useState(true);
    const [isIdle,      setIsIdle]        = useState(false);
    const [countdown,   setCountdown]     = useState(COUNTDOWN_SECONDS);
    const [isLoggedOut, setIsLoggedOut]   = useState(false);
    const [camReady,    setCamReady]      = useState(false);

    // ── Logout ────────────────────────────────────────────────────────────────
    const handleLogout = useCallback(() => {
        if (isLoggedOutRef.current) return;
        isLoggedOutRef.current = true;

        if (pollTimerRef.current)   clearTimeout(pollTimerRef.current);
        if (noFaceTimerRef.current) clearTimeout(noFaceTimerRef.current);
        if (countdownRef.current)   clearInterval(countdownRef.current);

        setIsLoggedOut(true);
        logout();

        setTimeout(() => router.push("/kiosk"), 2000);
    }, [logout, router]);

    // ── Start countdown ───────────────────────────────────────────────────────
    const startCountdown = useCallback(() => {
        if (isIdleRef.current || isLoggedOutRef.current) return;
        isIdleRef.current = true;
        setIsIdle(true);
        setCountdown(COUNTDOWN_SECONDS);

        let remaining = COUNTDOWN_SECONDS;
        countdownRef.current = setInterval(() => {
            remaining -= 1;
            setCountdown(remaining);
            if (remaining <= 0) {
                clearInterval(countdownRef.current!);
                handleLogout();
            }
        }, 1000);
    }, [handleLogout]);

    // ── Cancel countdown (person returned) ───────────────────────────────────
    const cancelCountdown = useCallback(() => {
        if (!isIdleRef.current) return;
        isIdleRef.current = false;
        setIsIdle(false);
        setCountdown(COUNTDOWN_SECONDS);
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
        }
    }, []);

    // ── Core detection loop (no model, pure canvas math) ─────────────────────
    const scheduleNextPoll = useCallback(() => {
        if (isLoggedOutRef.current) return;
        pollTimerRef.current = setTimeout(detect, POLL_MS);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Defined after scheduleNextPoll to allow mutual reference via closure
    // We use a ref so detect() is always the latest version without re-creating
    const detectRef = useRef<() => void>(() => {});

    detectRef.current = () => {
        if (isLoggedOutRef.current) return;

        const video = webcamRef.current?.video;
        const canvas = canvasRef.current;

        if (!video || video.readyState < 2 || !canvas) {
            scheduleNextPoll();
            return;
        }

        const ctx = canvas.getContext("2d");
        if (!ctx) { scheduleNextPoll(); return; }

        ctx.drawImage(video, 0, 0, CANVAS_W, CANVAS_H);
        const variance = getFrameVariance(ctx, CANVAS_W, CANVAS_H);
        const detected = variance > VARIANCE_THRESHOLD;

        setFacePresent(detected);

        if (detected) {
            // Face/person present → clear any pending "no-face" timer
            if (noFaceTimerRef.current) {
                clearTimeout(noFaceTimerRef.current);
                noFaceTimerRef.current = null;
            }
            cancelCountdown();
        } else {
            // No person detected → start grace timer if not already running
            if (!noFaceTimerRef.current && !isIdleRef.current) {
                noFaceTimerRef.current = setTimeout(() => {
                    noFaceTimerRef.current = null;
                    startCountdown();
                }, NO_FACE_GRACE_MS);
            }
        }

        scheduleNextPoll();
    };

    function detect() { detectRef.current(); }

    // ── Start/stop the loop ───────────────────────────────────────────────────
    useEffect(() => {
        if (!isAuthenticated || !camReady) return;

        // Create the offscreen canvas once
        if (!canvasRef.current) {
            const c = document.createElement("canvas");
            c.width = CANVAS_W;
            c.height = CANVAS_H;
            canvasRef.current = c;
        }

        // Small warmup delay so webcam has time to open
        const warmup = setTimeout(() => {
            detect();
        }, 1500);

        return () => {
            clearTimeout(warmup);
            if (pollTimerRef.current)   clearTimeout(pollTimerRef.current);
            if (noFaceTimerRef.current) clearTimeout(noFaceTimerRef.current);
            if (countdownRef.current)   clearInterval(countdownRef.current);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated, camReady]);

    const handleStillHere = () => {
        cancelCountdown();
    };

    if (!isAuthenticated) return null;

    return (
        <>
            {/* ── Camera pill (top-right) ── */}
            <div className="fixed top-4 right-4 z-40 flex flex-col items-end gap-2">
                <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-3 py-2 rounded-full border border-zinc-800 text-white shadow-lg">
                    <div className="relative w-10 h-10 overflow-hidden rounded-full border-2 border-emerald-500 bg-zinc-900 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                        <Webcam
                            ref={webcamRef}
                            audio={false}
                            className="absolute w-full h-full object-cover"
                            mirrored={true}
                            videoConstraints={{ facingMode: "user" }}
                            onUserMedia={() => setCamReady(true)}
                            onUserMediaError={() => setCamReady(false)}
                        />
                        <motion.div
                            className="absolute inset-0 bg-emerald-500/20"
                            animate={{ opacity: [0.1, 0.4, 0.1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </div>
                    <div className="flex flex-col pr-1">
                        <div className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full animate-pulse ${facePresent ? "bg-emerald-500" : "bg-red-500"}`} />
                            <span className={`text-xs font-semibold ${facePresent ? "text-emerald-400" : "text-red-400"}`}>
                                {!camReady ? "Starting camera…" : facePresent ? "Presence Detected" : "No one — logging out…"}
                            </span>
                        </div>
                        <span className="text-[10px] text-zinc-400 leading-tight">Session Active</span>
                    </div>
                </div>

                <div className="bg-black/40 backdrop-blur-sm px-2 py-1 rounded text-[9px] text-zinc-400 flex items-center gap-1 border border-zinc-800/50">
                    <Camera size={10} />
                    Camera detects presence only — no data stored
                </div>
            </div>

            {/* ── Countdown / Session-ended overlay ── */}
            <AnimatePresence>
                {(isIdle || isLoggedOut) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
                    >
                        {isLoggedOut ? (
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
                            <div className="text-center flex flex-col items-center">
                                <motion.h2
                                    initial={{ y: -20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className="text-3xl font-light text-red-400 mb-8"
                                >
                                    No one detected — session ending in
                                </motion.h2>

                                <div className="relative w-64 h-64 mb-10 flex items-center justify-center">
                                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                                        <circle cx="128" cy="128" r="120" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-800" />
                                        <motion.circle
                                            cx="128" cy="128" r="120"
                                            stroke="currentColor" strokeWidth="8"
                                            fill="transparent"
                                            className="text-red-500"
                                            strokeDasharray={2 * Math.PI * 120}
                                            animate={{ strokeDashoffset: (2 * Math.PI * 120) * (1 - countdown / COUNTDOWN_SECONDS) }}
                                            transition={{ duration: 1, ease: "linear" }}
                                        />
                                    </svg>
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
                                    onClick={handleStillHere}
                                    className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 px-8 py-4 rounded-full text-xl font-medium transition-colors"
                                >
                                    I&apos;m still here
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
