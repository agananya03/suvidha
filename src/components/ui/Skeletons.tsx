import { Skeleton } from "@/components/ui/Skeleton";

export function ServiceDiscoveryCardSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full opacity-70">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center space-x-4">
                    <Skeleton className="h-16 w-16 rounded-2xl" />
                    <div className="space-y-3 flex-1">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function BillDetailsSkeleton() {
    return (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-lg w-full max-w-2xl mx-auto space-y-8 mt-8 opacity-70">
            <div className="flex justify-between items-start">
                <div className="space-y-3">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-5 w-32" />
                </div>
                <Skeleton className="h-12 w-12 rounded-full" />
            </div>

            <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
                <div className="flex justify-between">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-32" />
                </div>
                <div className="w-full h-px bg-gray-200" />
                <div className="flex justify-between items-end">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-10 w-40" />
                </div>
            </div>

            <Skeleton className="h-14 w-full rounded-xl" />
        </div>
    );
}

export function QueueCardSkeleton() {
    return (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-lg text-center space-y-6 opacity-70">
            <Skeleton className="h-6 w-48 mx-auto" />
            <div className="flex justify-center py-6">
                <Skeleton className="h-32 w-32 rounded-full" />
            </div>
            <Skeleton className="h-5 w-64 mx-auto" />

            <div className="mt-8 space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4">
                        <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                        <div className="space-y-2 flex-1 text-left">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export function DashboardTabsSkeleton() {
    return (
        <div className="flex space-x-4 mb-8 overflow-x-auto pb-4 opacity-70">
            {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-32 rounded-full shrink-0" />
            ))}
        </div>
    );
}

export function ComplaintListSkeleton() {
    return (
        <div className="space-y-4 w-full opacity-70">
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                    <div className="space-y-3 flex-1 w-full">
                        <div className="flex space-x-3 items-center">
                            <Skeleton className="h-6 w-24 rounded-full" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                    </div>
                    <Skeleton className="h-10 w-32 rounded-xl mt-4 md:mt-0" />
                </div>
            ))}
        </div>
    );
}
