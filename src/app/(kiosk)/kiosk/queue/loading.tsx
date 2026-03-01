import { QueueCardSkeleton } from "@/components/ui/Skeletons";

export default function Loading() {
    return (
        <div className="flex-grow p-8 max-w-4xl mx-auto w-full">
            <h1 className="text-3xl font-bold mb-8">Fetching Live Queue...</h1>
            <QueueCardSkeleton />
        </div>
    );
}
