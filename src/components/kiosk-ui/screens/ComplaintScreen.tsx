"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useKioskStore } from '@/store/useKioskStore';
import { ArrowLeft, Camera, Send, FileWarning } from 'lucide-react';

export function ComplaintScreen() {
    const { setScreen } = useKioskStore();
    const [selectedType, setSelectedType] = useState('electricity');
    const [urgency, setUrgency] = useState('normal');
    const [submitted, setSubmitted] = useState(false);

    const tabs = [
        { id: 'electricity', label: 'Electricity' },
        { id: 'municipal', label: 'Municipal' },
        { id: 'water', label: 'Water' },
    ];

    if (submitted) {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-full flex flex-col items-center justify-center p-12 text-center">
                <div className="bg-accent/20 p-10 rounded-full mb-12"><FileWarning size={120} className="text-accent" /></div>
                <h2 className="text-7xl font-display font-bold text-white mb-8">Complaint Registered</h2>
                <div className="bg-white/10 p-12 rounded-[40px] border border-white/20 w-full max-w-3xl text-left mb-16 shadow-2xl backdrop-blur-xl">
                    <p className="text-white/70 text-2xl font-medium mb-3">Tracking Number</p>
                    <p className="text-5xl text-white font-mono font-bold tracking-widest mb-10 bg-black/20 p-6 rounded-2xl w-fit">PUN-COMP-8822</p>
                    <div className="h-px bg-white/10 w-full mb-10" />
                    <p className="text-white/70 text-2xl font-medium mb-3">Expected Resolution</p>
                    <p className="text-4xl text-secondary font-bold">3 Working Days</p>
                </div>
                <button onClick={() => setScreen('HOME')} className="px-16 py-8 bg-white/10 border border-white/20 rounded-full text-white text-4xl font-bold hover:bg-white/20 transition-colors shadow-lg">
                    Done
                </button>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full h-full flex flex-col p-12"
        >
            <div className="flex justify-between items-center mb-12">
                <button onClick={() => setScreen('SERVICE')} className="flex items-center gap-3 text-white/70 hover:text-white px-8 py-4 bg-white/5 rounded-full border border-white/10 text-2xl font-bold transition-all">
                    <ArrowLeft size={32} /> Back
                </button>
            </div>

            <h1 className="text-7xl font-display font-bold text-white mb-12">File a Complaint</h1>

            <div className="flex gap-6 mb-12 overflow-x-auto pb-4">
                {tabs.map(tab => (
                    <button 
                        key={tab.id} 
                        onClick={() => setSelectedType(tab.id)}
                        className={`px-12 py-6 rounded-full text-3xl font-bold transition-all border-2 ${selectedType === tab.id ? 'bg-secondary border-secondary text-white' : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'}`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 bg-white/5 border border-white/10 rounded-[40px] p-12 flex flex-col backdrop-blur-xl shadow-2xl">
                <div className="mb-10">
                    <label className="text-white/70 text-3xl font-medium mb-6 block">Select Issue Category</label>
                    <select className="w-full bg-[#001f5c]/90 text-white text-3xl p-8 rounded-[24px] border border-white/20 appearance-none outline-none focus:border-secondary transition-colors cursor-pointer shadow-inner">
                        <option>Streetlight not working</option>
                        <option>Power Outage</option>
                        <option>Voltage Fluctuation</option>
                        <option>Other</option>
                    </select>
                </div>

                <div className="mb-10 flex-1 flex flex-col relative">
                    <label className="text-white/70 text-3xl font-medium mb-6 block">Description</label>
                    <textarea 
                        className="w-full h-full min-h-[220px] bg-[#001f5c]/90 text-white text-3xl p-8 rounded-[24px] border border-white/20 outline-none focus:border-secondary resize-none transition-colors shadow-inner"
                        placeholder="Describe the issue in detail..."
                    ></textarea>
                </div>

                <div className="flex gap-10 mb-12">
                    <div className="flex-1">
                        <label className="text-white/70 text-2xl font-medium mb-6 block">Urgency Level</label>
                        <div className="flex bg-[#001f5c]/90 rounded-[24px] border border-white/20 overflow-hidden shadow-inner h-[100px]">
                            {[
                                { id: 'normal', label: 'Normal', color: 'bg-blue-500' },
                                { id: 'urgent', label: 'Urgent', color: 'bg-orange-500' },
                                { id: 'emergency', label: 'Emergency', color: 'bg-danger' }
                            ].map(level => (
                                <button 
                                    key={level.id}
                                    onClick={() => setUrgency(level.id)}
                                    className={`flex-1 text-3xl font-bold transition-all ${urgency === level.id ? `${level.color} text-white` : 'text-white/50 hover:bg-white/10'}`}
                                >
                                    {level.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex-1 flex flex-col">
                        <label className="text-white/70 text-2xl font-medium mb-6 block">Attachments</label>
                        <button className="flex-1 bg-white/10 hover:bg-white/20 border border-white/30 rounded-[24px] flex items-center justify-center gap-4 text-white text-2xl font-bold transition-colors">
                            <Camera size={40} /> Add Photo from Camera
                        </button>
                    </div>
                </div>

                <button 
                    onClick={() => setSubmitted(true)}
                    className="w-full py-10 bg-secondary hover:bg-[#e69819] text-white text-4xl font-bold rounded-[32px] flex justify-center items-center gap-5 transition-transform active:scale-95 shadow-[0_10px_40px_rgba(245,166,35,0.4)]"
                >
                    Submit Complaint <Send size={44} />
                </button>
            </div>
        </motion.div>
    );
}
