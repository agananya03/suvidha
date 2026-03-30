import React from 'react';
import { KioskHeader } from '@/components/kiosk/KioskHeader';
import { KioskFooter } from '@/components/kiosk/KioskFooter';
import dynamic from 'next/dynamic';
const FaceLock = dynamic(() => import('@/components/kiosk/FaceLock').then((mod) => mod.FaceLock), { ssr: false });
const AttractLoop = dynamic(() => import('@/components/kiosk/AttractLoop').then((mod) => mod.AttractLoop), { ssr: false });
const FloatingSpeakerButton = dynamic(() => import('@/components/ui/FloatingSpeakerButton').then((mod) => mod.FloatingSpeakerButton), { ssr: false });
import { ConsentModal } from '@/components/kiosk/ConsentModal';

import { ConnectivityBanner } from '@/components/kiosk/ConnectivityBanner';
import { VoiceNavigator } from '@/components/kiosk/VoiceNavigator';
import { JourneyBar } from '@/components/kiosk/JourneyBar';
import { ClickSpeechGuide } from '@/components/kiosk/ClickSpeechGuide';


export default function KioskLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen w-full flex flex-col bg-[var(--irs-gray-100)] text-[var(--irs-gray-900)] selection:bg-[#d9e8f6]">
            <KioskHeader />
            <ConnectivityBanner />
            <JourneyBar />
            <main className="flex-1 relative w-full h-full flex flex-col">
                {children}
                <FaceLock />
                <ConsentModal />
                <VoiceNavigator />
                <ClickSpeechGuide />
                <AttractLoop />
                <FloatingSpeakerButton />
            </main>
            <KioskFooter />
        </div>
    );
}
