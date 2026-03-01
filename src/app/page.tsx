'use client';

import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Clock, WifiOff, Map, Accessibility, FileWarning,
  AlertTriangle, Banknote, HelpCircle, ArrowRight,
  SearchCheck, Lock, QrCode, Fingerprint,
  Languages, Zap, ShieldCheck, FileText, Bot, HandMetal,
  Volume2, Ear, Eye, Home, Terminal
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const router = useRouter();
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);

  // Local animated counter for hero
  const [stats, setStats] = useState({ citizens: 0, languages: 0, services: 0 });

  useEffect(() => {
    const timer = setTimeout(() => {
      setStats({ citizens: 900, languages: 22, services: 4 });
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // --- MOCK DATA FOR SECTIONS --- //
  const PROBLEMS = [
    { icon: <Clock className="w-8 h-8 text-orange-500" />, text: "Offices open only 10AM-5PM — forcing working citizens to take leave." },
    { icon: <WifiOff className="w-8 h-8 text-orange-500" />, text: "Only 24% of rural households have reliable internet access." },
    { icon: <Map className="w-8 h-8 text-orange-500" />, text: "Citizens visit 3-4 separate offices for electricity, gas, and water." },
    { icon: <Accessibility className="w-8 h-8 text-orange-500" />, text: "Existing kiosks ignore 70M+ differently-abled citizens." },
    { icon: <FileWarning className="w-8 h-8 text-orange-500" />, text: "Repeat visits due to missing documents — no pre-visit system." },
    { icon: <AlertTriangle className="w-8 h-8 text-orange-500" />, text: "Complaints bounce for weeks due to inter-department blame." },
    { icon: <Banknote className="w-8 h-8 text-orange-500" />, text: "53% of citizens report paying bribes — no queue transparency." },
    { icon: <HelpCircle className="w-8 h-8 text-orange-500" />, text: "Citizens arrive unprepared — no document checklist system." }
  ];

  const JOURNEY_STEPS = [
    { num: 1, title: "Check Before You Go", desc: "WhatsApp pre-visit simulator handles document checks instantly." },
    { num: 2, title: "Walk Up & Get Comfortable", desc: "Physical kiosk adapts to wheelchair heights and audio queues." },
    { num: 3, title: "Identify Yourself", desc: "Quick Pay anon routing or Full Access via DigiLocker paths." },
    { num: 4, title: "Load Documents", desc: "Redeem Web Tokens, tap DigiLocker, or use the physical scanner." },
    { num: 5, title: "Discover Services", desc: "One unified address for Electricity, Gas, Municipal, and more." },
    { num: 6, title: "Get Things Done", desc: "Pay securely, track timelines, and file verified complaints." },
    { num: 7, title: "Walk Away Safely", desc: "Hardware-level auto-logout guarantees data sanitization." }
  ];

  const FEATURES = [
    { icon: <Bot className="w-6 h-6" />, title: "AI Complaint DNA", desc: "NLP routing ends inter-department ping-pong." },
    { icon: <SearchCheck className="w-6 h-6" />, title: "Live SLA Tracking", desc: "Real-time queue tracking ensures absolute transparency." },
    { icon: <Zap className="w-6 h-6" />, title: "Anomaly Detection", desc: "Flags massive bill spikes before payments occur." },
    { icon: <QrCode className="w-6 h-6" />, title: "Quick Pay Mode", desc: "Pay instantly via UPI without formal logins." },
    { icon: <Fingerprint className="w-6 h-6" />, title: "Biometric Auto-Logout", desc: "Zero persistent sessions across hardware resets." },
    { icon: <Lock className="w-6 h-6" />, title: "Edge Encryption", desc: "Data is wiped instantly post-transaction completion." },
    { icon: <ShieldCheck className="w-6 h-6" />, title: "Anti-Corruption Panel", desc: "Public ledger exposing true officer workloads." },
    { icon: <Languages className="w-6 h-6" />, title: "22 Native Languages", desc: "Serving 900M non-English speakers seamlessly." },
    { icon: <FileText className="w-6 h-6" />, title: "Multi-modal Documents", desc: "Physical scanners meet DigiLocker and remote Web-Tokens." },
    { icon: <Terminal className="w-6 h-6" />, title: "Legacy Integration", desc: "SOAP to REST proxies hook into existing fragile grids." },
    { icon: <Eye className="w-6 h-6" />, title: "Screen Readers", desc: "Native JAWS and tactile braille physical mappings." },
    { icon: <Volume2 className="w-6 h-6" />, title: "Acoustic Mapping", desc: "Audio feedback loops for vision impaired citizens." },
    { icon: <HandMetal className="w-6 h-6" />, title: "Universal Design", desc: "Ergonomic tilted tracks fitting wheelchair footprints." }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden">

      {/* HERO SECTION - Navy Background */}
      <section className="relative w-full min-h-[90vh] bg-[#0A192F] text-white flex flex-col justify-center overflow-hidden pt-20 pb-16">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://transparenttextures.com/patterns/cubes.png')]" />
        <motion.div style={{ y }} className="absolute -top-40 -right-40 w-96 h-96 bg-orange-500 rounded-full blur-[150px] opacity-20 pointer-events-none" />
        <motion.div style={{ y: useTransform(scrollYProgress, [0, 1], [0, -100]) }} className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500 rounded-full blur-[120px] opacity-20 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 w-full mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight">
              One Kiosk. <br />
              <span className="text-orange-500">All Civic Services.</span>
            </h1>
            <p className="text-xl md:text-3xl text-gray-300 font-light mb-8 max-w-3xl leading-relaxed">
              SUVIDHA 2026 — India&apos;s most accessible government kiosk.
              Electricity, Gas, and Municipal services at a single localized touchpoint.
            </p>
            <p className="text-lg md:text-xl text-gray-400 font-medium max-w-2xl mb-12 border-l-4 border-orange-500 pl-4">
              Serving every citizen regardless of location, ability, or literacy.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-16">
              <Button
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg px-8 py-6 rounded-xl shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-all hover:scale-105"
                onClick={() => router.push('/kiosk')}
              >
                <Terminal className="mr-2 w-6 h-6" /> Try the Kiosk Demo
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-2 border-white/30 text-black hover:text-white hover:bg-white/10 font-bold text-lg px-8 py-6 rounded-xl transition-all"
                onClick={() => router.push('/pre-visit')}
              >
                <Bot className="mr-2 w-6 h-6" /> Pre-Visit Simulator
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Animated Stats Row */}
        <div className="w-full bg-white/5 border-y border-white/10 backdrop-blur-md relative z-10 py-8">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4 divide-y md:divide-y-0 md:divide-x divide-white/20">

              <div className="text-center pt-4 md:pt-0">
                <motion.div
                  className="text-4xl md:text-5xl font-black text-orange-400 mb-2"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                >
                  {stats.citizens}M+
                </motion.div>
                <div className="text-sm text-gray-400 uppercase tracking-widest font-bold">Citizens</div>
              </div>

              <div className="text-center pt-4 md:pt-0">
                <motion.div
                  className="text-4xl md:text-5xl font-black text-blue-400 mb-2"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                >
                  {stats.languages}+
                </motion.div>
                <div className="text-sm text-gray-400 uppercase tracking-widest font-bold">Languages</div>
              </div>

              <div className="text-center pt-4 md:pt-0">
                <motion.div
                  className="text-4xl md:text-5xl font-black text-green-400 mb-2"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                >
                  {stats.services} Unified
                </motion.div>
                <div className="text-sm text-gray-400 uppercase tracking-widest font-bold">Services</div>
              </div>

              <div className="text-center pt-4 md:pt-0">
                <motion.div
                  className="text-4xl md:text-5xl font-black text-purple-400 mb-2"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                >
                  0
                </motion.div>
                <div className="text-sm text-gray-400 uppercase tracking-widest font-bold">Aadhaar Required</div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: PROBLEM WE SOLVE */}
      <section className="py-24 bg-[#050D18] text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-6">Why India Needs SUVIDHA</h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROBLEMS.map((prob, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-orange-500/50 hover:bg-white/10 transition-colors"
              >
                <div className="mb-4 bg-white/10 w-fit p-3 rounded-xl">{prob.icon}</div>
                <p className="text-gray-300 font-medium leading-relaxed">{prob.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS */}
      <section className="py-24 bg-gray-50 border-y border-gray-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-[#0A192F] mb-6">Your 7-Step Journey with SUVIDHA</h2>
            <div className="w-24 h-1 bg-[#0A192F] rounded-full" />
          </div>

          <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory hide-scrollbars">
            {JOURNEY_STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.1 }}
                className="min-w-[280px] md:min-w-[320px] bg-white p-8 rounded-3xl shadow-lg border border-gray-100 snap-center relative"
              >
                <div className="text-7xl font-black text-gray-100 absolute top-4 right-4 pointer-events-none">
                  0{step.num}
                </div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-[#0A192F] text-white rounded-full flex items-center justify-center font-bold text-xl mb-6 shadow-md">
                    {step.num}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: FEATURES GRID */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-[#0A192F] mb-6">Engineered for Scale</h2>
            <div className="w-24 h-1 bg-orange-500 mx-auto rounded-full" />
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 4) * 0.1 }}
                className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(25%-1rem)] bg-gray-50 border border-gray-200 p-6 rounded-2xl hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="mb-4 text-[#0A192F] bg-blue-100 w-fit p-3 rounded-xl">
                  {feat.icon}
                </div>
                <h4 className="font-bold text-lg mb-2 text-gray-900">{feat.title}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: ACCESSIBILITY */}
      <section className="py-24 bg-blue-50 border-t border-blue-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-[#0A192F] mb-6">Accessibility For All</h2>
            <p className="text-xl text-gray-600 max-w-2xl">Because true public infrastructure leaves no citizen behind.</p>
            <div className="w-24 h-1 bg-[#0A192F] rounded-full mt-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Blind */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex gap-6 items-start">
              <div className="bg-blue-100 text-blue-700 p-4 rounded-2xl"><Eye className="w-8 h-8" /></div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Blind & Vision Impaired</h3>
                <p className="text-gray-600">Full JAWS screen reader support, physical tactile braille overlays mapped to hardware buttons, and direct headphone jack audio guidance.</p>
              </div>
            </div>

            {/* Deaf */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex gap-6 items-start">
              <div className="bg-green-100 text-green-700 p-4 rounded-2xl"><Ear className="w-8 h-8" /></div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Deaf & Hearing Impaired</h3>
                <p className="text-gray-600">Zero audio dependencies. High-contrast visual alerts and integrated Indian Sign Language (ISL) video overlays for complex instructions.</p>
              </div>
            </div>

            {/* Elderly */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex gap-6 items-start">
              <div className="bg-orange-100 text-orange-700 p-4 rounded-2xl"><Volume2 className="w-8 h-8" /></div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Elderly Citizens</h3>
                <p className="text-gray-600">Simplified &apos;Senior Mode&apos; toggles massive typography, slows down interface timeouts, and triggers simplified voice guidance.</p>
              </div>
            </div>

            {/* Wheelchair */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex gap-6 items-start">
              <div className="bg-purple-100 text-purple-700 p-4 rounded-2xl"><Accessibility className="w-8 h-8" /></div>
              <div>
                <h3 className="text-2xl font-bold mb-2">Wheelchair Bound</h3>
                <p className="text-gray-600">Kiosk hardware complies with exact ADA height maximums featuring recessed foot-pedal space and angled screens preventing glare.</p>
              </div>
            </div>
          </div>

          {/* Home Visit Card */}
          <div className="bg-[#0A192F] text-white p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
            <div className="relative z-10">
              <h3 className="text-2xl md:text-3xl font-black mb-4 flex items-center gap-3">
                <Home className="w-8 h-8 text-orange-500" /> Home Visit Service
              </h3>
              <p className="text-gray-300 max-w-2xl text-lg">For citizens who absolutely cannot travel to the kiosk, SUVIDHA agents are dispatched directly to their homes with mobile biometric kits.</p>
            </div>
            <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-6 rounded-xl shrink-0 z-10" onClick={() => router.push('/pre-visit')}>
              Simulate Request <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 6: TECH STACK */}
      <section className="py-20 bg-gray-900 border-t-4 border-orange-500 text-center">
        <div className="max-w-5xl mx-auto px-6">
          <h5 className="text-gray-400 font-bold tracking-widest uppercase text-sm mb-8">Powered By</h5>
          <div className="flex flex-wrap justify-center gap-6 md:gap-12 opacity-60">
            {/* Static text-based logos for robust mockup */}
            <div className="text-2xl font-black text-white">Next.js</div>
            <div className="text-2xl font-black text-white">React</div>
            <div className="text-2xl font-black text-white">TailwindCSS</div>
            <div className="text-2xl font-black text-white">Prisma DB</div>
            <div className="text-2xl font-black text-white">Framer Motion</div>
            <div className="text-2xl font-black text-white">PostgreSQL</div>
          </div>
        </div>
      </section>

      {/* SECTION 7: FINAL CTA */}
      <section className="py-32 bg-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <h2 className="text-4xl md:text-6xl font-black text-[#0A192F] mb-8">Experience the Future of Indian GovTech.</h2>
          <Button
            size="lg"
            className="bg-[#0A192F] hover:bg-black text-white font-black text-xl px-12 py-8 rounded-2xl shadow-2xl transition-all hover:scale-105"
            onClick={() => router.push('/kiosk')}
          >
            Try SUVIDHA 2026 Now
          </Button>
        </div>
      </section>

    </div>
  );
}
