import React from 'react';

interface SkeletonProps {
    className?: string;
    style?: React.CSSProperties;
}

/**
 * Base abstract Skeleton element.
 * Applies standard Tailwind `animate-pulse` loops resolving to a neutral grey block.
 * Pass specific width/height/rounding through `className`.
 */
export function Skeleton({ className = '', style }: SkeletonProps) {
    return (
        <div
            className={`bg-slate-200 animate-pulse rounded-md ${className}`}
            style={style}
            aria-hidden="true"
        />
    );
}

// ----------------------------------------------------
// Specialized Pre-fabricated Skeleton Wrappers below
// ----------------------------------------------------

export function ServiceDiscoveryCardSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-48">
                    <div className="flex justify-between items-start mb-4">
                        <Skeleton className="w-12 h-12 rounded-xl" />
                        <Skeleton className="w-8 h-4" />
                    </div>
                    <Skeleton className="w-3/4 h-6 mb-2" />
                    <Skeleton className="w-1/2 h-4 mb-auto" />
                    <Skeleton className="w-full h-10 rounded-xl mt-4" />
                </div>
            ))}
        </div>
    );
}

export function BillDetailsSkeleton() {
    return (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 max-w-2xl mx-auto w-full">
            <div className="flex items-center gap-4 mb-8 pb-8 border-b border-gray-100">
                <Skeleton className="w-16 h-16 rounded-2xl" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="w-1/3 h-5" />
                    <Skeleton className="w-1/2 h-8" />
                </div>
            </div>

            <div className="space-y-6">
                <div>
                    <Skeleton className="w-1/4 h-4 mb-2" />
                    <Skeleton className="w-1/2 h-12" />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-50">
                    <div className="space-y-2">
                        <Skeleton className="w-1/2 h-4" />
                        <Skeleton className="w-3/4 h-6" />
                    </div>
                    <div className="space-y-2">
                        <Skeleton className="w-1/2 h-4" />
                        <Skeleton className="w-3/4 h-6" />
                    </div>
                </div>

                <Skeleton className="w-full h-14 rounded-2xl mt-8" />
            </div>
        </div>
    );
}

export function QueueCardSkeleton() {
    return (
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center">
            <Skeleton className="w-32 h-8 mb-6" />
            <Skeleton className="w-32 h-32 rounded-full mb-8" />
            <Skeleton className="w-3/4 h-6 mb-2" />
            <Skeleton className="w-1/2 h-4 mb-8" />

            <div className="w-full space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex gap-4 items-center">
                        <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                        <Skeleton className="w-full h-12 rounded-xl" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export function ComplaintListSkeleton() {
    return (
        <div className="space-y-4 w-full">
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 flex flex-col md:flex-row gap-6 items-start md:items-center w-full">
                    <div className="flex-1 space-y-3 w-full">
                        <div className="flex justify-between items-start">
                            <Skeleton className="w-32 h-5" />
                            <Skeleton className="w-24 h-6 rounded-full" />
                        </div>
                        <Skeleton className="w-3/4 h-6" />
                        <div className="flex gap-4">
                            <Skeleton className="w-24 h-4" />
                            <Skeleton className="w-32 h-4" />
                        </div>
                    </div>
                    <Skeleton className="w-full md:w-32 h-10 rounded-xl" />
                </div>
            ))}
        </div>
    );
}

export function DashboardSkeleton() {
    return (
        <div className="w-full space-y-8">
            {/* Header Skeleton */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex items-center gap-6">
                <Skeleton className="w-24 h-24 rounded-full" />
                <div className="space-y-3 flex-1">
                    <Skeleton className="w-48 h-8" />
                    <Skeleton className="w-64 h-4" />
                    <Skeleton className="w-32 h-4" />
                </div>
            </div>

            {/* Tabs Skeleton */}
            <div className="flex gap-2">
                <Skeleton className="w-32 h-12 rounded-xl" />
                <Skeleton className="w-32 h-12 rounded-xl" />
                <Skeleton className="w-32 h-12 rounded-xl" />
            </div>

            {/* Content Area Skeleton */}
            <div className="bg-slate-50 min-h-[400px] rounded-3xl p-8 border border-gray-100">
                <Skeleton className="w-48 h-8 mb-8" />
                <ComplaintListSkeleton />
            </div>
        </div>
    );
}
