'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, FileText } from 'lucide-react';
import DocumentHandler from '@/components/kiosk/DocumentHandler';
import { useDynamicTranslation } from '@/hooks/useDynamicTranslation';

export default function DocumentsPage() {
    const router = useRouter();
    const { t } = useDynamicTranslation();

    return (
        <div className="h-full flex flex-col overflow-hidden bg-[#F0F7FF]">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#002868] to-[#004085] text-white px-6 py-6 flex items-center gap-4 shrink-0 shadow-md">
                <button
                    onClick={() => router.push('/kiosk/dashboard')}
                    className="bg-white/20 hover:bg-white/30 p-2 rounded-xl transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-xl">
                        <FileText className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black">{t('Document Upload & Retrieval')}</h1>
                        <p className="text-blue-200 text-sm">DigiLocker · Physical Scanner · Web Token</p>
                    </div>
                </div>
            </div>

            {/* Tab nav hint */}
            <div className="bg-[#E8F4FD] border-b-2 border-[#BEE3F8] px-6 py-3 text-sm text-[#004085] font-medium flex items-center gap-2 shrink-0">
                <span className="w-2 h-2 rounded-full bg-[#004085] inline-block" />
                {t('Securely attach documents for your service requests — encrypted and auto-deleted in 48 hours.')}
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6 pl-24 md:p-8 md:pl-28">
                <div className="max-w-4xl mx-auto">
                    <DocumentHandler />
                </div>
            </div>
        </div>
    );
}
