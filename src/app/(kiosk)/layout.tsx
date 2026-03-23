import React from 'react';
import { KioskHeader } from '@/components/kiosk/KioskHeader';
import { KioskFooter } from '@/components/kiosk/KioskFooter';
import dynamic from 'next/dynamic';
const FaceLock = dynamic(() => import('@/components/kiosk/FaceLock').then((mod) => mod.FaceLock), { ssr: false });
import { ConsentModal } from '@/components/kiosk/ConsentModal';

import { ConnectivityBanner } from '@/components/kiosk/ConnectivityBanner';
import { VoiceNavigator } from '@/components/kiosk/VoiceNavigator';


export default function KioskLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen h-screen w-full flex flex-col bg-gradient-to-b from-[#003087] to-[#001a4d] overflow-hidden text-white font-sans selection:bg-orange-500/30">
            <KioskHeader />
            <ConnectivityBanner />
            <main className="flex-1 relative overflow-hidden w-full h-full">
                {/* Rendered content should be scrollable internally if needed, but the main layout body isn't */}
                {children}
                <FaceLock />
                <ConsentModal />
                <VoiceNavigator />
            </main>
            <KioskFooter />
        </div>
    );
}
