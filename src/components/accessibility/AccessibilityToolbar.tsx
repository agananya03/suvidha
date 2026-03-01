'use client';

import { useStore } from '@/lib/store';
import { Eye, Type, Volume2, MonitorPlay, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { webSpeech } from '@/lib/webSpeech';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export function AccessibilityToolbar() {
    const { t } = useTranslation();
    const {
        highContrast, setHighContrast,
        fontSize, setFontSize,
        voiceMode, setVoiceMode,
        isISLActive, setISLActive
    } = useStore();

    const toggleHighContrast = () => setHighContrast(!highContrast);

    const toggleFontSize = () => {
        if (fontSize === 'normal') setFontSize('large');
        else if (fontSize === 'large') setFontSize('xlarge');
        else setFontSize('normal');
    };

    const toggleVoiceMode = () => {
        const newMode = !voiceMode;
        setVoiceMode(newMode);
        if (newMode) {
            setTimeout(() => webSpeech.autoReadHeadings(), 100);
        } else {
            webSpeech.stopSpeaking();
        }
    };

    const toggleISL = () => setISLActive(!isISLActive);

    useEffect(() => {
        const html = document.documentElement;
        if (highContrast) {
            html.classList.add('high-contrast');
        } else {
            html.classList.remove('high-contrast');
        }

        html.classList.remove('text-size-normal', 'text-size-large', 'text-size-xlarge');
        html.classList.add(`text-size-${fontSize}`);
    }, [highContrast, fontSize]);

    return (
        <>
            <div className="fixed top-1/2 left-4 -translate-y-1/2 flex flex-col gap-3 z-[100] p-2 bg-background/80 backdrop-blur-md rounded-2xl shadow-xl border border-border">
                <Button
                    variant={(highContrast ? 'default' : 'outline') as "default" | "outline"}
                    size="icon"
                    onClick={toggleHighContrast}
                    className="rounded-full w-12 h-12 shadow-sm transition-all hover:scale-105 group"
                    title={t('highContrast')}
                >
                    <Eye className="w-6 h-6" />
                    <span className="sr-only">{t('highContrast')}</span>
                </Button>
                <Button
                    variant={(fontSize !== 'normal' ? 'default' : 'outline') as "default" | "outline"}
                    size="icon"
                    onClick={toggleFontSize}
                    className="rounded-full w-12 h-12 shadow-sm transition-all hover:scale-105 group"
                    title={t('fontSize')}
                >
                    <Type className={`w-5 h-5 transition-transform ${fontSize === 'large' ? 'scale-110' : fontSize === 'xlarge' ? 'scale-125' : ''}`} />
                    <span className="sr-only">{t('fontSize')}</span>
                </Button>
                <Button
                    variant={(voiceMode ? 'default' : 'outline') as "default" | "outline"}
                    size="icon"
                    onClick={toggleVoiceMode}
                    className="rounded-full w-12 h-12 shadow-sm transition-all hover:scale-105 group"
                    title={t('voiceMode')}
                >
                    <Volume2 className="w-6 h-6" />
                    <span className="sr-only">{t('voiceMode')}</span>
                </Button>
                <Button
                    variant={(isISLActive ? 'default' : 'outline') as "default" | "outline"}
                    size="icon"
                    onClick={toggleISL}
                    className="rounded-full w-12 h-12 shadow-sm transition-all hover:scale-105 group"
                    title={t('islVideo')}
                >
                    <MonitorPlay className="w-6 h-6" />
                    <span className="sr-only">{t('islVideo')}</span>
                </Button>
            </div>

            {/* ISL Video Panel */}
            {isISLActive && (
                <div className="fixed bottom-6 right-6 w-80 h-48 bg-black rounded-xl shadow-2xl overflow-hidden z-[100] border-4 border-primary">
                    <div className="w-full h-full flex flex-col items-center justify-center text-white/50 bg-neutral-900 absolute inset-0">
                        <MonitorPlay className="w-10 h-10 mb-2 opacity-50" />
                        <p className="text-sm font-medium">{t('islVideo')} Active</p>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); setISLActive(false); }}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/80 rounded-full text-white z-10 transition-colors"
                        aria-label="Close ISL Video"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}
        </>
    );
}
