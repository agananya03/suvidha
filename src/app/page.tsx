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
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);

  const [isDemoLoading, setIsDemoLoading] = useState(false);

  // Local animated counter for hero
  const [stats, setStats] = useState({ citizens: 0, languages: 0, services: 0, aadhaar: 0 });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const timer = setTimeout(() => {
      setStats({ citizens: 900, languages: 22, services: 4, aadhaar: 0 });
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleStartDemo = async () => {
    setIsDemoLoading(true);
    try {
      const { activateDemoMode } = await import('@/lib/demoMode');
      await activateDemoMode();
      router.push('/kiosk/dashboard');
    } catch (err) {
      console.error('Demo mode failed:', err);
      router.push('/kiosk');
    } finally {
      setIsDemoLoading(false);
    }
  };

  // --- MOCK DATA FOR SECTIONS --- //
  const PROBLEMS = [
    { icon: <Clock className="w-8 h-8 text-white" />, text: "Offices open only 10AM-5PM — forcing working citizens to take leave." },
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
    <div className="min-h-screen bg-gradient-to-br from-[#001a4d] via-[#002868] to-[#003a8c] font-sans text-white overflow-x-hidden">

      {/* HERO SECTION - Navy Background */}
      <section className="relative w-full min-h-screen flex flex-col items-center justify-center text-center px-6 py-20 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://transparenttextures.com/patterns/cubes.png')]" />

        {isMounted && (
          <>
            <motion.div style={{ y }} className="absolute -top-40 -right-40 w-96 h-96 bg-orange-500 rounded-full blur-[150px] opacity-20 pointer-events-none" />
            <motion.div style={{ y: y2 }} className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500 rounded-full blur-[120px] opacity-20 pointer-events-none" />
          </>
        )}

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 w-full mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight mb-4">
              One Kiosk. <br />
              <span className="text-white">All Civic Services.</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-200 leading-relaxed max-w-2xl mb-10 mx-auto">
              SUVIDHA 2026 — India&apos;s most accessible government kiosk.
              Electricity, Gas, and Municipal services at a single localized touchpoint.
            </p>
            <p className="text-lg md:text-xl text-gray-400 font-medium max-w-2xl mb-12 border-l-4 border-orange-500 pl-4">
              Serving every citizen regardless of location, ability, or literacy.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16 mx-auto w-full max-w-3xl">
              <Button
                size="lg"
                className="bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 font-semibold px-8 py-4 rounded-xl backdrop-blur-sm transition-all duration-200"
                onClick={() => router.push('/kiosk')}
              >
                <Terminal className="mr-2 w-6 h-6" /> Try the Kiosk Demo
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-2 border-white/30 font-semibold px-8 py-4 rounded-xl backdrop-blur-sm transition-all duration-200"
                onClick={() => router.push('/pre-visit')}
              >
                <Bot className="mr-2 w-6 h-6" /> Pre-Visit Simulator
              </Button>
              {/* Start Demo — skips all setup steps */}
              <div className="flex flex-col w-full sm:w-auto">
                <motion.button
                  onClick={handleStartDemo}
                  disabled={isDemoLoading}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="relative group flex items-center gap-3 px-8 py-4
                             bg-green-500 hover:bg-green-600 disabled:bg-green-400
                             text-white font-bold text-lg rounded-2xl shadow-lg
                             shadow-green-500/30 transition-all duration-200 h-full"
                >
                  {isDemoLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Loading demo...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl">▶</span>
                      <span>Start Demo</span>
                      <span className="text-sm font-normal opacity-80 whitespace-nowrap hidden sm:inline">— skip login</span>
                    </>
                  )}
                </motion.button>
                <p className="text-xs text-gray-400 mt-2 text-center">
                  Pre-loaded with Rahul Sharma&apos;s data · Electricity anomaly · 3 services
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Animated Stats Row */}
        <div className="w-full relative z-10 py-8">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
                <motion.div
                  className="text-4xl font-black text-white"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                >
                  {stats.citizens}M+
                </motion.div>
                <div className="text-sm text-blue-200 mt-1 font-medium">Citizens</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
                <motion.div
                  className="text-4xl font-black text-white"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                >
                  {stats.languages}+
                </motion.div>
                <div className="text-sm text-blue-200 mt-1 font-medium">Languages</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
                <motion.div
                  className="text-4xl font-black text-white"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                >
                  {stats.services} Unified
                </motion.div>
                <div className="text-sm text-blue-200 mt-1 font-medium">Services</div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 text-center">
                <motion.div
                  className="text-4xl font-black text-white"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                >
                  {stats.aadhaar}
                </motion.div>
                <div className="text-sm text-blue-200 mt-1 font-medium">Aadhaar Req.</div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: PROBLEM WE SOLVE */}
      <section className="py-24 relative z-20 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-black text-white leading-tight tracking-tight mb-4">Why India Needs SUVIDHA</h2>
            <div className="w-24 h-1 bg-white mx-auto rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROBLEMS.map((prob, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all text-center flex flex-col items-center"
              >
                <div className="mb-4 bg-white/10 w-fit p-3 rounded-xl mx-auto">{prob.icon}</div>
                <p className="text-white font-medium leading-relaxed">{prob.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl font-black text-[#0A1628] mb-6">Your 7-Step Journey with SUVIDHA</h2>
            <div className="w-24 h-1 bg-[#0A1628] mx-auto rounded-full" />
          </div>

          <div className="flex gap-6 overflow-x-auto pb-8 snap-x snap-mandatory">
            {JOURNEY_STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.1 }}
                className="min-w-[280px] md:min-w-[320px] bg-white rounded-2xl border-2 border-[#BEE3F8] shadow-sm p-6 hover:shadow-md hover:border-[#90CDF4] transition-all duration-200 snap-center relative"
              >
                
                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-[#004085] text-white rounded-full flex items-center justify-center font-black text-xl flex-shrink-0 shadow-md mb-6">
                    {step.num}
                  </div>
                  <h3 className="text-lg font-bold text-[#0A1628] mb-3">{step.title}</h3>
                  <p className="text-[#2C5282] leading-relaxed">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 4: FEATURES GRID */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-black text-[#0A1628] mb-6">Engineered for Scale</h2>
            <div className="w-24 h-1 bg-[#004085] mx-auto rounded-full" />
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {FEATURES.map((feat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 4) * 0.1 }}
                className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(25%-1rem)] bg-white rounded-2xl border-2 border-[#BEE3F8] shadow-sm p-6 hover:shadow-md hover:border-[#90CDF4] transition-all duration-200 text-center flex flex-col items-center"
              >
                <div className="mb-4 text-[#004085]">
                  {feat.icon}
                </div>
                <h4 className="text-xl font-bold text-[#1A365D] mb-2">{feat.title}</h4>
                <p className="text-sm text-[#4A6FA5] leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: ACCESSIBILITY */}
      <section className="bg-[#F0F7FF] py-16 px-6 border-t-2 border-[#BEE3F8]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl font-black text-[#0A1628] mb-6">Accessibility For All</h2>
            <p className="text-lg text-[#1A365D] max-w-2xl mx-auto">Because true public infrastructure leaves no citizen behind.</p>
            <div className="w-24 h-1 bg-[#0A1628] rounded-full mx-auto mt-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Blind */}
            <div className="bg-white rounded-2xl border-2 border-[#BEE3F8] shadow-sm p-6 hover:border-[#90CDF4] flex gap-6 items-start">
              <div className="text-[#004085] p-3 rounded-2xl bg-[#E8F4FD]"><Eye className="w-8 h-8" /></div>
              <div>
                <h3 className="text-xl font-bold text-[#1A365D] mb-2">Blind & Vision Impaired</h3>
                <p className="text-lg text-[#1A365D] leading-relaxed">Full JAWS screen reader support, physical tactile braille overlays mapped to hardware buttons, and direct headphone jack audio guidance.</p>
              </div>
            </div>

            {/* Deaf */}
            <div className="bg-white rounded-2xl border-2 border-[#BEE3F8] shadow-sm p-6 hover:border-[#90CDF4] flex gap-6 items-start">
              <div className="text-[#004085] p-3 rounded-2xl bg-[#E8F4FD]"><Ear className="w-8 h-8" /></div>
              <div>
                <h3 className="text-xl font-bold text-[#1A365D] mb-2">Deaf & Hearing Impaired</h3>
                <p className="text-lg text-[#1A365D] leading-relaxed">Zero audio dependencies. High-contrast visual alerts and integrated Indian Sign Language (ISL) video overlays for complex instructions.</p>
              </div>
            </div>

            {/* Elderly */}
            <div className="bg-white rounded-2xl border-2 border-[#BEE3F8] shadow-sm p-6 hover:border-[#90CDF4] flex gap-6 items-start">
              <div className="text-[#004085] p-3 rounded-2xl bg-[#E8F4FD]"><Volume2 className="w-8 h-8" /></div>
              <div>
                <h3 className="text-xl font-bold text-[#1A365D] mb-2">Elderly Citizens</h3>
                <p className="text-lg text-[#1A365D] leading-relaxed">Simplified &apos;Senior Mode&apos; toggles massive typography, slows down interface timeouts, and triggers simplified voice guidance.</p>
              </div>
            </div>

            {/* Wheelchair */}
            <div className="bg-white rounded-2xl border-2 border-[#BEE3F8] shadow-sm p-6 hover:border-[#90CDF4] flex gap-6 items-start">
              <div className="text-[#004085] p-3 rounded-2xl bg-[#E8F4FD]"><Accessibility className="w-8 h-8" /></div>
              <div>
                <h3 className="text-xl font-bold text-[#1A365D] mb-2">Wheelchair Bound</h3>
                <p className="text-lg text-[#1A365D] leading-relaxed">Kiosk hardware complies with exact ADA height maximums featuring recessed foot-pedal space and angled screens preventing glare.</p>
              </div>
            </div>
          </div>

          {/* Home Visit Card */}
          <div className="bg-[#002868] text-white rounded-3xl shadow-xl p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 w-full border-2 border-[#90CDF4]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#004085] rounded-full blur-3xl opacity-50 transform translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <h3 className="text-2xl md:text-3xl font-black mb-4 flex items-center gap-3">
                <Home className="w-8 h-8 text-orange-500" /> Home Visit Service
              </h3>
              <p className="text-[#BEE3F8] max-w-2xl text-lg mix-blend-screen leading-relaxed">For citizens who absolutely cannot travel to the kiosk, SUVIDHA agents are dispatched directly to their homes with mobile biometric kits.</p>
            </div>
            <Button className="bg-white hover:bg-[#E8F4FD] active:bg-[#BEE3F8] text-[#002868] font-black text-xl px-8 py-6 rounded-2xl shadow-md transition-all h-auto w-full md:w-auto relative z-10 shrink-0 border-0" onClick={() => router.push('/pre-visit')}>
              Simulate Request <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* SECTION 6: TECH STACK */}
      <section className="bg-white py-16 text-center border-t border-[#BEE3F8]">
        <div className="max-w-5xl mx-auto px-6">
          <h5 className="text-[#4A6FA5] font-bold tracking-widest uppercase text-sm mb-8">Powered By</h5>
          <div className="flex flex-wrap justify-center gap-6 md:gap-12">
            {/* Static text-based logos for robust mockup */}
            <div className="text-xl font-bold text-[#1A365D]">Next.js</div>
            <div className="text-xl font-bold text-[#1A365D]">React</div>
            <div className="text-xl font-bold text-[#1A365D]">TailwindCSS</div>
            <div className="text-xl font-bold text-[#1A365D]">Prisma DB</div>
            <div className="text-xl font-bold text-[#1A365D]">Framer Motion</div>
            <div className="text-xl font-bold text-[#1A365D]">PostgreSQL</div>
          </div>
        </div>
      </section>

      {/* SECTION 7: FINAL CTA */}
      <section className="py-24 bg-gradient-to-br from-[#001a4d] via-[#002868] to-[#003a8c] text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-8 leading-tight tracking-tight">Experience the Future of Indian GovTech.</h2>
          <Button
            size="lg"
            className="bg-white hover:bg-[#E8F4FD] active:bg-[#BEE3F8] text-[#004085] font-bold text-xl px-12 py-8 rounded-2xl shadow-xl transition-all border-0 h-auto"
            onClick={() => router.push('/kiosk')}
          >
            Try SUVIDHA 2026 Now
          </Button>
        </div>
      </section>

    </div>
  );
}
