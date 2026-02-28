'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
    Send, Paperclip, MoreVertical,
    CheckCheck, Clock, MapPin,
    Info, ShieldCheck, Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// --- TYPES & DATA --- //
type Message = {
    id: string;
    text: React.ReactNode;
    sender: 'user' | 'bot';
    timestamp: Date;
    status?: 'sent' | 'delivered' | 'read';
    isAttachment?: boolean;
    isTyping?: boolean;
};

const INITIAL_BOT_MSG: React.ReactNode = (
    <div className="space-y-2">
        <p>Namaste! 🙏 I am the SUVIDHA assistance bot.</p>
        <p>How can I help you today?</p>
        <p className="font-medium text-sm text-gray-700">Type your service need or choose:</p>
        <div className="flex flex-col gap-1 text-sm bg-gray-50 p-2 rounded-lg border">
            <span>1️⃣ Pay electricity bill</span>
            <span>2️⃣ Pay gas bill</span>
            <span>3️⃣ New connection</span>
            <span>4️⃣ File a complaint</span>
            <span>5️⃣ Check queue status</span>
        </div>
    </div>
);

const REQ_CHECK_MSG: React.ReactNode = (
    <div className="space-y-3">
        <p>For electricity bill payment you need:</p>
        <ul className="text-sm space-y-1 bg-green-50/50 p-2 rounded-lg border border-green-100">
            <li className="flex gap-2"><span className="text-green-600">✅</span> <b>Consumer Number</b> (mandatory)</li>
            <li className="flex gap-2"><span className="text-gray-400">📄</span> Latest bill copy (optional — for dispute)</li>
            <li className="flex gap-2"><span className="text-gray-400">🆔</span> Identity proof (optional — for new connection)</li>
        </ul>

        <div className="bg-blue-50/50 p-3 rounded-xl border border-blue-100 text-sm space-y-2">
            <h4 className="font-bold text-blue-900 border-b border-blue-200 pb-1 flex items-center gap-1">
                <Clock className="w-4 h-4" /> Current Queue Status
            </h4>
            <div className="flex justify-between items-center">
                <span>Load:</span>
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">LOW (8-12m wait)</span>
            </div>
            <div className="flex justify-between items-center text-xs">
                <span>Best time to visit:</span>
                <span className="font-bold">10 AM - 12 PM or 3 PM - 5 PM</span>
            </div>
            <div className="flex items-start gap-1 text-xs text-blue-700 mt-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span><b>Nearest kiosk:</b> Civil Lines Office, 0.8 km away</span>
            </div>
        </div>

        <p className="font-bold text-green-800">Would you like to pre-upload your documents to save time?</p>
    </div>
);

const ATTACHMENT_PROMPT_MSG: React.ReactNode = (
    <div className="space-y-2">
        <p>Great! Please use the <Paperclip className="inline w-4 h-4 text-gray-400" /> attachment icon below to share your document here.</p>
    </div>
);

const SUCCESS_TOKEN_MSG: React.ReactNode = (
    <div className="space-y-3">
        <div className="bg-green-100 text-green-800 p-2 rounded-lg text-sm font-bold flex items-center gap-2 border border-green-200">
            <ShieldCheck className="w-5 h-5 text-green-600" /> Document received & encrypted
        </div>

        <div className="bg-purple-50 p-4 rounded-xl border border-purple-200 text-center space-y-2 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-purple-500" />
            <p className="text-xs font-bold text-purple-600 uppercase tracking-widest">Your Secure Token</p>
            <div className="text-4xl font-black font-mono tracking-widest text-purple-900">A7X3K9</div>
            <p className="text-xs text-purple-500">Valid for exactly 48 hours.</p>
        </div>

        <div className="bg-gray-50 p-3 rounded-lg border text-sm space-y-2">
            <h4 className="font-bold text-gray-900 flex items-center gap-2 border-b pb-1">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> ONE-VISIT COMPLETION
            </h4>
            <ul className="text-xs text-gray-600 space-y-1">
                <li>• You have everything needed.</li>
                <li>• Just enter token <b>A7X3K9</b> at the kiosk scanner step.</li>
            </ul>
        </div>
    </div>
);

// We need a tiny check circle override locally to prevent lucide-react duplication errors
const CheckCircle2 = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
);


export default function PreVisitChatPage() {
    const router = useRouter();
    const bottomRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        { id: '1', text: INITIAL_BOT_MSG, sender: 'bot', timestamp: new Date() }
    ]);
    const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
    // 0: Initial
    // 1: Requirements Sent
    // 2: Waiting for Upload
    // 3: Finished

    // Scroll to bottom on new message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const addBotMessageWithDelay = (text: React.ReactNode, delayMs = 1000) => {
        const id = Date.now().toString();
        // Add typing indicator
        setMessages(prev => [...prev, { id, text: '...', sender: 'bot', timestamp: new Date(), isTyping: true }]);

        setTimeout(() => {
            setMessages(prev => prev.map(m => m.id === id ? { ...m, text, isTyping: false } : m));
        }, delayMs);
    };

    const handleSend = () => {
        if (!input.trim() && step !== 2) return; // Attachment handles step 2 empty texts
        if (input.trim()) {
            const userMsg: Message = { id: Date.now().toString(), text: input.trim(), sender: 'user', timestamp: new Date(), status: 'read' };
            setMessages(prev => [...prev, userMsg]);
            setInput('');
        }

        const lower = input.toLowerCase();

        // --- STATE MACHINE --- //
        if (step === 0 && (lower === '1' || lower.includes('electricity') || lower.includes('pay'))) {
            setStep(1);
            addBotMessageWithDelay(REQ_CHECK_MSG, 1200);
        }
        else if (step === 1 && (lower.includes('yes') || lower.includes('upload') || lower.includes('sure') || lower === 'y')) {
            setStep(2);
            addBotMessageWithDelay(ATTACHMENT_PROMPT_MSG, 800);
        }
        else if (step === 2) {
            // They typed something instead of attaching, politely remind them
            addBotMessageWithDelay("Please use the paperclip icon to select your document file.", 1000);
        }
    };

    const handleAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // User sent attachment
        const userMsg: Message = {
            id: Date.now().toString(),
            text: <div className="flex items-center gap-2"><span className="p-2 bg-green-200 rounded text-xs font-bold text-green-800">📄</span> {file.name}</div>,
            sender: 'user',
            timestamp: new Date(),
            status: 'read',
            isAttachment: true
        };
        setMessages(prev => [...prev, userMsg]);

        if (step === 2) {
            setStep(3);
            // Simulate processing
            const id1 = Date.now().toString();
            setMessages(prev => [...prev, { id: id1, text: '...', sender: 'bot', timestamp: new Date(), isTyping: true }]);

            setTimeout(() => {
                setMessages(prev => prev.map(m => m.id === id1 ? {
                    ...m,
                    text: <span className="text-gray-500">🔒 Processing secure encrypted token...</span>,
                    isTyping: false
                } : m));

                // 2 seconds later show the actual token card
                addBotMessageWithDelay(SUCCESS_TOKEN_MSG, 2000);
            }, 1000);
        }
    };

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="min-h-screen bg-[#E5DDD5] flex flex-col md:p-8">
            <div className="w-full max-w-2xl mx-auto md:h-[90vh] flex flex-col bg-[#EFEAE2] md:rounded-3xl shadow-xl overflow-hidden border">

                {/* HEADER */}
                <header className="bg-[#00A884] text-white p-4 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold text-xl border-2 border-white/50 relative">
                            🤖
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-[#00A884] rounded-full" />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg leading-tight">SUVIDHA Bot</h2>
                            <p className="text-xs text-white/80">Active now</p>
                        </div>
                    </div>
                    <div className="flex gap-4 opacity-80">
                        <Info className="w-5 h-5 cursor-pointer" />
                        <MoreVertical className="w-5 h-5 cursor-pointer" />
                    </div>
                </header>

                {/* CHAT HISTORY */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[url('https://transparenttextures.com/patterns/cubes.png')] bg-opacity-5 relative">
                    {/* Timestamp Pill */}
                    <div className="flex justify-center mb-6">
                        <span className="bg-[#E1F3FB] text-gray-600 text-xs px-3 py-1 rounded-full shadow-sm">
                            TODAY
                        </span>
                    </div>

                    <div className="flex justify-center mb-6 max-w-sm mx-auto">
                        <span className="bg-[#FFEECD] text-yellow-800 text-xs p-3 rounded-lg shadow-sm text-center border border-yellow-200">
                            <ShieldCheck className="w-4 h-4 mx-auto mb-1 text-yellow-600" />
                            Messages are end-to-end encrypted. No one outside of this chat, not even SUVIDHA algorithms, can read or listen to them until you present your physical token.
                        </span>
                    </div>

                    <AnimatePresence initial={false}>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`relative max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-2 shadow-sm ${msg.sender === 'user'
                                    ? 'bg-[#D9FDD3] rounded-tr-sm text-gray-800' // WhatsApp Light Green 
                                    : 'bg-white rounded-tl-sm text-gray-800'
                                    }`}>

                                    {/* Typing indicator */}
                                    {msg.isTyping ? (
                                        <div className="flex gap-1 py-2 px-1">
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                        </div>
                                    ) : (
                                        <div className="text-[15px] leading-relaxed break-words whitespace-pre-wrap">
                                            {msg.text}
                                        </div>
                                    )}

                                    {/* Timestamp & Ticks */}
                                    {!msg.isTyping && (
                                        <div className="flex items-center justify-end gap-1 mt-1 -mr-1">
                                            <span className="text-[10px] text-gray-500 whitespace-nowrap">
                                                {formatTime(msg.timestamp)}
                                            </span>
                                            {msg.sender === 'user' && (
                                                <CheckCheck className={`w-4 h-4 ${msg.status === 'read' ? 'text-blue-500' : 'text-gray-400'}`} />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                    <div ref={bottomRef} />
                </div>

                {/* BOOK HOME VISIT CARD (Shown only at end) */}
                <AnimatePresence>
                    {step === 3 && (
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="bg-white p-4 border-t shadow-[0_-10px_20px_rgba(0,0,0,0.05)]"
                        >
                            <div className="flex items-center gap-4 bg-orange-50 border border-orange-200 p-4 rounded-xl">
                                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Home className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-orange-900">Cannot travel today?</h4>
                                    <p className="text-xs text-orange-700">Book our mobile SUVIDHA agent to visit your home for a ₹50 service fee.</p>
                                </div>
                                <Button size="sm" className="bg-orange-600 hover:bg-orange-700 flex-shrink-0" onClick={() => router.push('/dashboard')}>
                                    Book Now
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* BOTTOM INPUT BAR */}
                <div className="bg-[#F0F2F5] p-3 flex items-end gap-2 shrink-0">
                    <div className="flex-1 bg-white rounded-2xl flex items-center px-2 shadow-sm border overflow-hidden">
                        {/* Hidden file input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleAttach}
                        />
                        <button
                            className="p-3 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <Paperclip className="w-5 h-5 transform -rotate-45" />
                        </button>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSend();
                                }
                            }}
                            placeholder="Type a message"
                            className="flex-1 max-h-32 bg-transparent border-none outline-none py-3 px-2 resize-none text-[15px]"
                            rows={1}
                            style={{ minHeight: '44px' }}
                        />
                    </div>
                    {input.trim() ? (
                        <button
                            onClick={handleSend}
                            className="w-[48px] h-[48px] rounded-full bg-[#00A884] text-white flex items-center justify-center shadow-sm flex-shrink-0 hover:bg-[#008f6f] transition-colors"
                        >
                            <Send className="w-5 h-5 ml-1" />
                        </button>
                    ) : (
                        <button className="w-[48px] h-[48px] rounded-full bg-[#00A884] text-white flex items-center justify-center shadow-sm flex-shrink-0 opacity-50 cursor-not-allowed">
                            <Send className="w-5 h-5 ml-1" />
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
}
