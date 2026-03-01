import { DashboardTabsSkeleton, ServiceDiscoveryCardSkeleton, ComplaintListSkeleton } from "@/components/ui/Skeletons";

export default function Loading() {
    return (
        <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Loading Dashboard...</h1>
                    <p className="text-gray-500 mt-2">Fetching your active services and civic history</p>
                </div>

                <DashboardTabsSkeleton />

                <div className="mt-8">
                    <ServiceDiscoveryCardSkeleton />
                </div>

                <div className="mt-8">
                    <ComplaintListSkeleton />
                </div>
            </div>
        </div>
    );
}
