"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import Link from 'next/link';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Universal Error Boundary trapping runtime React crashes.
 * Prevents the application from white-screening.
 */
export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log explicit stack traces directly to console for hackathon debugging
        console.error("SUVIDHA ErrorBoundary caught an error:", error, errorInfo);
    }

    // Helper handling the forced refresh/redirect
    private handleRestart = () => {
        this.setState({ hasError: false, error: null });
        // Attempting a soft navigation, but falling back to hard refresh to guarantee clean state
        window.location.href = '/kiosk';
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center bg-red-50/30 rounded-2xl m-8 border border-red-100 shadow-lg">

                    <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
                        <AlertTriangle size={40} className="animate-pulse" />
                    </div>

                    <h2 className="text-3xl font-black text-slate-900 mb-2">
                        System Error / सिस्टम त्रुटि
                    </h2>

                    <p className="text-lg text-slate-600 max-w-lg mx-auto mb-8 font-medium">
                        Something went wrong. Please try again or call our toll-free helpline.
                        <br />
                        <span className="text-sm mt-2 block text-slate-500">
                            कुछ गलत हो गया। कृपया पुनः प्रयास करें या हमारे टोल-फ्री हेल्पलाइन पर कॉल करें।
                        </span>
                    </p>

                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-8 inline-block select-all">
                        <p className="font-mono text-sm text-red-600 font-bold">Helpline: 1800-111-2026</p>
                    </div>

                    <button
                        onClick={this.handleRestart}
                        className="flex items-center justify-center gap-3 bg-blue-700 hover:bg-blue-800 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-md transition-all active:scale-95"
                    >
                        <RefreshCw size={24} />
                        Restart Session / पुनः आरंभ करें
                    </button>

                    {/* Debug trace only visible to devs during presentation if needed */}
                    {process.env.NODE_ENV !== 'production' && this.state.error && (
                        <div className="mt-12 text-left bg-gray-900 text-gray-300 p-4 rounded-lg text-xs font-mono max-w-3xl w-full overflow-auto max-h-48 border border-gray-700 shadow-inner">
                            <p className="font-bold text-red-400 mb-2">{this.state.error.toString()}</p>
                            <pre>{this.state.error.stack}</pre>
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
