"use client";

import { motion } from "framer-motion";
import { ArrowRight, Lightbulb, Droplet, Trash2, Flame, ShieldCheck } from "lucide-react";
import { useKioskStore } from "@/store/useKioskStore";

export default function Home() {
  const { login, isAuthenticated } = useKioskStore();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const services = [
    { name: "Electricity", icon: Lightbulb, color: "text-accent", bg: "bg-accent/10" },
    { name: "Piped Gas", icon: Flame, color: "text-primary", bg: "bg-primary/10" },
    { name: "Water Supply", icon: Droplet, color: "text-accent", bg: "bg-accent/10" },
    { name: "Waste Mgmt", icon: Trash2, color: "text-primary", bg: "bg-primary/10" },
  ];

  return (
    <div className="flex-1 flex flex-col justify-center items-center p-6 sm:p-12 pb-24 relative">

      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-accent/5 rounded-full blur-3xl" />

      <motion.div
        className="max-w-4xl w-full flex flex-col items-center text-center z-10"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.div variants={itemVariants} className="mb-6 flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-full font-semibold text-sm">
          <ShieldCheck className="w-4 h-4" />
          <span>India&apos;s Unified Self-Service Kiosk</span>
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-5xl sm:text-7xl font-extrabold tracking-tight text-primary mb-6 drop-shadow-sm">
          SUVIDHA <span className="text-accent">2026</span>
        </motion.h1>

        <motion.p variants={itemVariants} className="text-xl sm:text-2xl text-dark/70 mb-12 max-w-2xl leading-relaxed">
          One Address, All Services. Experience seamless access to electricity, gas, and municipal utilities regardless of your digital literacy.
        </motion.p>

        <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-16 w-full max-w-3xl">
          {services.map((svc) => {
            const Icon = svc.icon;
            return (
              <div key={svc.name} className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className={`p-4 rounded-full ${svc.bg} ${svc.color}`}>
                  <Icon className="w-8 h-8" />
                </div>
                <span className="font-semibold text-dark">{svc.name}</span>
              </div>
            );
          })}
        </motion.div>

        <motion.div variants={itemVariants} className="flex w-full sm:w-auto flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => {
              if (isAuthenticated) {
                alert("You are already locally authenticated Phase 2! Wait 10s for the FaceLock timeout to appear on the top right.");
              } else {
                login("mock-token", {
                  id: "1",
                  mobile: "9999999999",
                  name: "Suvidha Citizen",
                  address: "123 Smart City Blvd",
                  preferredLanguage: "en",
                  accessibilityMode: "standard",
                  createdAt: new Date(),
                  updatedAt: new Date(),
                }, "FULL_ACCESS");
              }
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-primary/30 transform hover:-translate-y-1"
          >
            {isAuthenticated ? "Authenticated! (Wait 10s)" : "Tap to Start (Mock Login)"} <ArrowRight className="w-5 h-5" />
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border-2 border-primary text-primary hover:bg-primary/5 px-8 py-4 rounded-xl font-bold text-lg transition-all">
            Choose Language
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
