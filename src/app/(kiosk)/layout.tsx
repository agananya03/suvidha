import React from 'react';
import { KioskHeader } from '@/components/kiosk/KioskHeader';
import { KioskFooter } from '@/components/kiosk/KioskFooter';
import { FaceLock } from '@/components/kiosk/FaceLock';

export default function KioskLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen h-screen w-full flex flex-col bg-gradient-to-b from-[#003087] to-[#001a4d] overflow-hidden text-white font-sans selection:bg-orange-500/30">
            <KioskHeader />
            <main className="flex-1 relative overflow-hidden w-full h-full">
                {/* Rendered content should be scrollable internally if needed, but the main layout body isn't */}
                {children}
                <FaceLock />
            </main>
            <KioskFooter />
        </div>
    );
}
