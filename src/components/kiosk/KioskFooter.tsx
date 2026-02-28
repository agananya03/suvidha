import React from 'react';

export function KioskFooter() {
    return (
        <footer className="w-full bg-[#001533] text-zinc-300 py-4 px-6 fixed bottom-0 left-0 right-0 z-40 border-t border-zinc-700/50 flex flex-col md:flex-row items-center justify-between text-[16px]">
            <div className="flex items-center gap-4">
                <span className="font-bold text-white">Powered by C-DAC</span>
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
                <span>Government of India Initiative</span>
            </div>
            <div className="flex items-center gap-4 mt-2 md:mt-0">
                <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Available 24/7
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-500"></span>
                <span className="font-bold text-white">Toll Free: 1800-XXX-XXXX</span>
            </div>
        </footer>
    );
}
