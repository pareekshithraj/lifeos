
import React, { useState, useEffect } from 'react';
import {
  Command, Shield, Zap, Sparkles, Crown, ArrowRight,
  UserPlus, LogIn, ChevronRight, Check, Scale,
  Target, Eye, Lock, Globe, Feather, History,
  MoveDown, Star, Brain, Sun, Moon, Layers, ShieldCheck,
  Smartphone, Monitor, Cpu, Mail, Laptop, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import Dashboard from './Dashboard';
import SovereignAvatar from './SovereignAvatar';
import LifeClock from './LifeClock';
import Discipline from './Discipline';
import CalendarView from './CalendarView';
import LoginView from './LoginView';

// Utility for class merging
function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface LandingProps {
  onInitiate: (name: string, plan: string) => void;
}

const XIcon = ({ size, className }: { size: number, className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

// --- Components ---

const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
    className={cn(
      "inline-flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md transition-all shadow-sm",
      "bg-white/80 border-slate-200/60 text-slate-600 hover:bg-white hover:border-indigo-200 hover:shadow-indigo-100/50 hover:shadow-md",
      className
    )}
  >
    {children}
  </motion.div>
);

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  desc: string;
  delay: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, desc, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px", amount: 0.1 }} // Reduced amount for smoother triggers
    transition={{ duration: 0.5, delay, ease: "easeOut" }} // Slightly faster duration
    className="group p-8 md:p-10 bg-white/5 border border-white/10 rounded-[3rem] hover:bg-white/10 transition-all duration-300 flex gap-6 items-start hover:border-white/20 hover:shadow-2xl hover:shadow-indigo-500/10 will-change-transform" // Added will-change-transform
  >
    <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center text-indigo-400 border border-white/10 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shrink-0">
      {icon}
    </div>
    <div className="space-y-3">
      <h3 className="text-xl md:text-2xl font-black text-white">{title}</h3>
      <p className="text-slate-400 font-light italic leading-relaxed text-sm md:text-base">"{desc}"</p>
    </div>
  </motion.div>
);

const Landing: React.FC<LandingProps> = ({ onInitiate }) => {
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [selectedPlan, setSelectedPlan] = useState('Disciple');
  const [scrolled, setScrolled] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { scrollY } = useScroll();
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const heroY = useTransform(scrollY, [0, 500], [0, 150]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50 && !scrolled) setScrolled(true);
      if (window.scrollY <= 50 && scrolled) setScrolled(false);
    }
    window.addEventListener('scroll', handleScroll, { passive: true }); // Passive listener for performance
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  const features = [
    {
      icon: <Target size={24} />,
      title: "Temporal Architecture",
      desc: "Measure your life in weeks, not years. Every moment is a non-renewable asset of your estate."
    },
    {
      icon: <Brain size={24} />,
      title: "AI Wisdom Audits",
      desc: "Gemini-powered reflections that critique your virtues and focus with clinical, imperial precision."
    },
    {
      icon: <Globe size={24} />,
      title: "Stoic Guidance",
      desc: "Vocalized mentorship from the sages of antiquity, reconstructed via native audio for modern focus."
    }
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-slate-900 selection:bg-slate-900 selection:text-white font-inter">
      {/* Background Ambience */}
      <div className="fixed inset-0 -z-10 bg-[#f8fafc]">
        <div className="absolute top-0 left-0 w-full h-[120vh] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/40 via-[#f8fafc] to-[#f8fafc]"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-indigo-50/50 rounded-full blur-[120px] mix-blend-multiply"></div>
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className={cn(
          "fixed top-0 left-0 right-0 z-[100] transition-all duration-500",
          scrolled ? 'py-4 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm' : 'py-6 md:py-8'
        )}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 bg-slate-900 rounded-[1.2rem] flex items-center justify-center text-white shadow-xl shadow-slate-200 group-hover:scale-110 transition-transform duration-500 ring-2 ring-slate-900/5">
              <Command size={22} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-black tracking-tighter text-slate-900 leading-none">Life OS</h1>
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-600 mt-1">eliment.in product</span>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden lg:flex items-center gap-8">
              {['Foundations', 'The Council', 'Pricing'].map((link) => (
                <button key={link} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors relative group">
                  {link}
                  <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-indigo-600 transition-all duration-300 group-hover:w-full"></span>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => { setAuthMode('login'); setShowAuth(true); }}
                className="hidden sm:block text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors"
              >
                Log In
              </button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setAuthMode('register'); setShowAuth(true); }}
                className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-200/50 hover:shadow-slate-900/20 hover:bg-slate-800 transition-all"
              >
                Initiate Free
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-32 md:pt-48 pb-20 md:pb-32 px-6 overflow-hidden">
        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10"
        >
          {/* Eliment.in Badge - Prominent */}
          <Badge className="mb-10 hover:scale-105 cursor-default">
            <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              A Product of <span className="text-indigo-600">Eliment.in</span>
            </span>
          </Badge>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 bg-indigo-50/50 border border-indigo-100 px-5 py-2 rounded-full text-indigo-600 mb-6">
              <Sparkles size={14} className="text-indigo-600" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em]">Built for the Intentional Soul</span>
            </div>

            <h2 className="text-6xl md:text-[8rem] lg:text-[10rem] font-black tracking-tighter text-slate-900 leading-[0.85] md:leading-[0.8] mb-8">
              SOVEREIGN <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-600 to-slate-900 animate-gradient-x">YOUR TIME.</span>
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-xl md:text-3xl text-slate-500 font-light italic max-w-3xl mx-auto leading-relaxed mb-16"
          >
            "We are not given a short life, but we make it so." <br />
            <span className="text-xs font-black uppercase tracking-[0.3em] text-slate-300 not-italic block mt-6">— SENECA</span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center gap-6"
          >
            <button
              onClick={() => { setAuthMode('register'); setShowAuth(true); }}
              className="group px-14 py-6 bg-slate-900 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-widest shadow-2xl shadow-indigo-900/20 hover:bg-slate-800 hover:shadow-indigo-900/40 transition-all flex items-center gap-4 relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-4">
                Begin Free Initiation <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
            </button>
            <button className="px-14 py-6 bg-white border-2 border-slate-100 text-slate-400 rounded-[2.5rem] font-black text-sm uppercase tracking-widest hover:border-slate-300 hover:text-slate-900 transition-all">
              Explore Ethos
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="mt-6 flex items-center gap-3 opacity-60"
          >
            <CheckCircle size={12} className="text-emerald-500" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Free Forever</span>
            <span className="text-slate-300">•</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">No Credit Card</span>
            <span className="text-slate-300">•</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Open Source</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            className="mt-24 animate-bounce text-slate-300"
          >
            <MoveDown size={32} strokeWidth={1} />
          </motion.div>
        </motion.div>
      </section>

      {/* Download / Native Dominion Section */}
      <section className="py-20 px-6 border-y border-slate-100 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500 mb-4 block">Native Dominion</span>
            <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-6">
              Total Control. <span className="text-slate-400 font-light">Anywhere.</span>
            </h3>
            <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Experience Life OS natively on your machine. Deeper focus, system-wide shortcuts, and zero distractions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Windows */}
            <motion.div
              whileHover={{ y: -5 }}
              className="group p-8 rounded-[2rem] bg-slate-50 border border-slate-200 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-50">
                <Laptop size={64} className="text-slate-200 -rotate-12 group-hover:rotate-0 transition-transform duration-500" />
              </div>
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200/50 mb-6 text-slate-900 z-10">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                  <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4h-13.05M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Windows</h4>
              <p className="text-xs text-slate-400 font-medium mb-6 uppercase tracking-wider">x64 Edition</p>
              <a
                href="/Life.OS.Setup.exe"
                download="Life.OS.Setup.exe"
                className="mt-auto px-6 py-3 w-full bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-600 transition-colors flex items-center justify-center"
              >
                Download Installer
              </a>
            </motion.div>

            {/* Mac */}
            <motion.div
              className="p-8 rounded-[2rem] bg-white border border-slate-100 opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 group flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 text-slate-900">
                <Command size={32} />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">macOS</h4>
              <p className="text-xs text-slate-400 font-medium mb-6 uppercase tracking-wider">Apple Silicon & Intel</p>
              <button disabled className="mt-auto px-6 py-3 w-full bg-slate-100 text-slate-400 rounded-xl font-bold text-xs uppercase tracking-widest cursor-not-allowed border border-slate-200">
                Coming Soon
              </button>
            </motion.div>

            {/* Linux */}
            <motion.div
              className="p-8 rounded-[2rem] bg-white border border-slate-100 opacity-60 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 group flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-6 text-slate-900">
                <Monitor size={32} />
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">Linux</h4>
              <p className="text-xs text-slate-400 font-medium mb-6 uppercase tracking-wider">Debian & Arch</p>
              <button disabled className="mt-auto px-6 py-3 w-full bg-slate-100 text-slate-400 rounded-xl font-bold text-xs uppercase tracking-widest cursor-not-allowed border border-slate-200">
                Coming Soon
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Dashboard Hologram Section */}
      <section className="px-4 md:px-20 pb-40">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="max-w-7xl mx-auto relative group"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-indigo-500/10 rounded-[5rem] blur-[120px] opacity-50 group-hover:opacity-100 transition-opacity duration-1000"></div>

          <div className="relative glass-panel rounded-[3rem] md:rounded-[5rem] p-3 md:p-8 border border-white/50 shadow-2xl overflow-hidden bg-white/40 backdrop-blur-sm">
            <div className="bg-slate-50/80 rounded-[2.5rem] md:rounded-[4.5rem] overflow-hidden pointer-events-none border border-slate-200/50 flex items-center justify-center relative shadow-inner">
              <div className="w-full h-full scale-[0.4] md:scale-[0.7] lg:scale-[0.9] origin-center py-20 opacity-90 grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000">
                <Dashboard currentPlan="Architect" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-white/10 opacity-50 pointer-events-none"></div>
            </div>

            <motion.div
              whileHover={{ y: -5 }}
              className="absolute top-12 left-12 bg-white/95 backdrop-blur-xl shadow-2xl px-6 py-4 rounded-3xl border border-slate-100 hidden lg:flex items-center gap-4 z-20"
            >
              <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30"><Sparkles size={20} /></div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Stoic Insight</p>
                <p className="text-xs font-bold text-slate-900">Focus on the controllable.</p>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* The Ritual Pillars */}
      <section className="py-40 bg-white relative">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="absolute -top-10 -left-10 w-60 h-60 bg-indigo-100 rounded-full blur-3xl opacity-60 mix-blend-multiply"></div>
              <div className="relative space-y-6">
                {[
                  { time: "Dawn", icon: <Sun size={20} className="text-amber-500" />, label: "Morning Mandate", desc: "Receive an AI-generated imperial directive to frame your perspective before the chaos begins." },
                  { time: "Day", icon: <Scale size={20} className="text-indigo-500" />, label: "Dichotomy Check", desc: "Real-time auditing of your intentions. Separate external noise from internal excellence." },
                  { time: "Dusk", icon: <Moon size={20} className="text-slate-400" />, label: "Evening Audit", desc: "A clinical reflection on your virtues. Gemini critiques your adherence to the Sovereign Path." }
                ].map((ritual, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.2 }}
                    className="flex gap-6 p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-slate-100 hover:border-indigo-100/50 transition-all duration-500 group"
                  >
                    <div className="w-16 h-16 bg-white rounded-[1.2rem] flex items-center justify-center shadow-sm border border-slate-50 group-hover:scale-110 group-hover:shadow-md transition-all duration-500">
                      {ritual.icon}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 bg-white px-2 py-1 rounded-lg border border-slate-100">{ritual.time}</span>
                        <h4 className="text-xl font-black text-slate-900">{ritual.label}</h4>
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed font-light italic">{ritual.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-1 lg:order-2 space-y-10 text-center lg:text-left pl-0 lg:pl-10"
            >
              <div className="inline-block">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500 bg-indigo-50 px-4 py-2 rounded-full mb-6">The Diurnal Loop</h3>
              </div>
              <h2 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] text-slate-900">
                Master the <br />
                <span className="text-slate-200">24-Hour</span> <br />
                Cycle.
              </h2>
              <p className="text-xl text-slate-500 font-light leading-relaxed max-w-lg">Life OS isn't a task manager; it's a structural framework for your consciousness. We guide you through the three critical points of a stoic day.</p>
              <div className="pt-4">
                <button className="px-10 py-5 border-2 border-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all shadow-lg hover:shadow-xl">Download Manifesto</button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interface Previews (Sneak Peaks) */}
      <section className="py-24 md:py-40 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center space-y-6 mb-20"
          >
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">System Architecture</h3>
            <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter">The Architect's View</h2>
            <p className="text-xl text-slate-500 font-light max-w-2xl mx-auto">
              A comprehensive operating system for your life. From mortality visualization to habit engineering.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Life Clock Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-2xl shadow-slate-200 overflow-hidden relative group hover:shadow-indigo-500/10 transition-all"
            >
              <div className="absolute top-8 left-8 z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-white"><History size={16} /></div>
                  <h4 className="font-black text-lg text-slate-900">Life Clock</h4>
                </div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-widest pl-11">Memento Mori Visualized</p>
              </div>
              <div className="mt-16 h-[400px] md:h-[500px] overflow-hidden rounded-[2rem] border border-slate-100 bg-slate-50 relative pointer-events-none select-none">
                <div className="absolute inset-0 scale-[0.6] md:scale-[0.8] origin-top-left w-[166%] md:w-[125%] h-[166%] md:h-[125%] p-4">
                  <LifeClock birthDate="1995-04-26" />
                </div>
                {/* Overlay to prevent interaction and add fade */}
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-50"></div>
              </div>
            </motion.div>

            {/* Discipline Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-2xl shadow-slate-200 overflow-hidden relative group hover:shadow-indigo-500/10 transition-all"
            >
              <div className="absolute top-8 left-8 z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center text-white"><Target size={16} /></div>
                  <h4 className="font-black text-lg text-slate-900">Protocol</h4>
                </div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-widest pl-11">Habit Engineering</p>
              </div>
              <div className="mt-16 h-[400px] md:h-[500px] overflow-hidden rounded-[2rem] border border-slate-100 bg-slate-50 relative pointer-events-none select-none">
                <div className="absolute inset-0 scale-[0.55] origin-top-left w-[180%] h-[180%] p-4">
                  <Discipline />
                </div>
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/80"></div>
              </div>
            </motion.div>

            {/* Calendar Preview */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-3 bg-white rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-2xl shadow-slate-200 overflow-hidden relative group hover:shadow-indigo-500/10 transition-all"
            >
              <div className="absolute top-8 left-8 z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white"><History size={16} /></div>
                  <h4 className="font-black text-lg text-slate-900">Temporal View</h4>
                </div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-widest pl-11">Strategic Planning</p>
              </div>

              <div className="mt-16 h-[500px] overflow-hidden rounded-[2rem] border border-slate-100 bg-slate-50 relative pointer-events-none select-none">
                <div className="absolute inset-0 scale-[0.8] origin-top w-[125%] h-[125%] p-4">
                  <CalendarView />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-40"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Philosophy / Features Grid */}
      <section className="py-40 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,#1e1b4b_0%,#020617_70%)]"></div>
        <div className="absolute top-0 left-0 text-[15vw] font-black text-white/5 whitespace-nowrap leading-none select-none pointer-events-none -translate-x-20 -translate-y-20">
          PHILOSOPHY
        </div>

        <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center mb-40">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-10"
            >
              <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-indigo-400">The Dichotomy of Control</h3>
              <h2 className="text-5xl md:text-7xl font-black tracking-tight leading-[0.9]">
                Distinguish <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600">Your Reality.</span>
              </h2>
              <p className="text-xl text-slate-400 font-light leading-relaxed max-w-lg">
                Most productivity tools manage your tasks. We manage your mind. Life OS separates the external noise from your internal focus, giving you a sanctuary of clarity.
              </p>
              <div className="flex items-center gap-12 pt-10 border-t border-white/10">
                <div className="flex flex-col gap-2">
                  <span className="text-4xl font-black text-indigo-400">92%</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Integrity Gain</span>
                </div>
                <div className="w-px h-16 bg-white/10"></div>
                <div className="flex flex-col gap-2">
                  <span className="text-4xl font-black text-white">4k+</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Weeks Tracked</span>
                </div>
              </div>
            </motion.div>

            <div className="grid grid-cols-1 gap-8">
              {features.map((f, i) => (
                <FeatureCard
                  key={i}
                  icon={f.icon}
                  title={f.title}
                  desc={f.desc}
                  delay={i * 0.2}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* The Architect's Toolkit (Animated) */}
      <section className="py-40 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 md:px-12 text-center space-y-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400">Integrated Systems</h3>
            <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter">Everything For Your Estate.</h2>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { icon: <Target className="text-rose-500" />, label: "Disciplines", sub: "Habit Architecture" },
              { icon: <History className="text-indigo-500" />, label: "Memento Mori", sub: "Life Clock" },
              { icon: <Layers className="text-emerald-500" />, label: "Agora", sub: "Collective Focus" },
              { icon: <Lock className="text-amber-500" />, label: "Sovereignty", sub: "Local-First Privacy" }
            ].map((tool, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5, type: "spring" }}
                className="bg-[#f8fafc] p-10 rounded-[2.5rem] border border-slate-100 flex flex-col items-center gap-6 hover:shadow-2xl hover:shadow-slate-200 hover:-translate-y-2 hover:bg-white transition-all group cursor-default"
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">{tool.icon}</div>
                <div>
                  <h4 className="font-black text-lg text-slate-900">{tool.label}</h4>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-2">{tool.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="pt-20"
          >
            <div className="inline-flex flex-wrap justify-center items-center gap-6 md:gap-10 p-4 md:px-8 md:py-6 bg-slate-900 rounded-[2.5rem] shadow-2xl">
              <div className="flex items-center gap-3 px-4 md:px-8 text-white md:border-r border-white/10">
                <Smartphone size={20} className="text-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">Mobile Ready</span>
              </div>
              <div className="flex items-center gap-3 px-4 md:px-8 text-white md:border-r border-white/10">
                <Monitor size={20} className="text-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">Desktop Grid</span>
              </div>
              <div className="flex items-center gap-3 px-4 md:px-8 text-white">
                <Cpu size={20} className="text-indigo-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">Gemini Engine</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* The Sovereignty Pledge */}
      <section className="py-60 relative overflow-hidden bg-slate-950 text-center">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#4f46e5_0%,transparent_70%)] animate-pulse" style={{ animationDuration: "5s" }}></div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto px-6 relative z-10 space-y-12"
        >
          <div className="w-24 h-24 mx-auto bg-indigo-500/10 rounded-3xl flex items-center justify-center text-indigo-400 border border-indigo-500/20 mb-8">
            <ShieldCheck size={48} strokeWidth={1.5} />
          </div>
          <h2 className="text-5xl md:text-8xl font-black text-white tracking-tighter leading-none">Ready to Occupy <br /> Your Own Mind?</h2>
          <p className="text-2xl text-slate-400 font-light italic leading-relaxed">The Archive is waiting. Your Standing is yet to be established.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setAuthMode('register'); setShowAuth(true); }}
            className="px-16 py-8 bg-white text-slate-950 rounded-[2.5rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:shadow-indigo-500/20 transition-all relative overflow-hidden group"
          >
            <span className="relative z-10">Initiate Sovereign Profile</span>
            <div className="absolute inset-0 bg-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </motion.button>

          <div className="pt-20 flex flex-col items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">A Premium product from</span>
            <motion.a
              href="https://eliment.in"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-3 px-6 py-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all group"
            >
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white"><Command size={18} /></div>
              <span className="text-xl font-black text-white tracking-tighter group-hover:text-indigo-400 transition-colors">eliment.in</span>
            </motion.a>
          </div>
        </motion.div>
      </section>

      {/* Initiation Flow (Auth Modal) */}
      <AnimatePresence>
        {showAuth && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-3xl flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden relative border border-white/50"
            >
              <LoginView
                isModal={true}
                onSuccess={(name, plan) => {
                  onInitiate(name, plan);
                  setShowAuth(false);
                }}
                onClose={() => setShowAuth(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="py-20 px-12 border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white"><Command size={20} /></div>
            <p className="text-xl font-black text-slate-900 tracking-tighter">Life OS</p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 md:gap-12 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
            {['Foundations', 'The Council', 'Imperial Privacy', 'Terms of Focus', 'Contact'].map(link => (
              <button key={link} className="hover:text-indigo-600 transition-colors">{link}</button>
            ))}
          </div>

          <div className="pt-10 border-t border-slate-50 w-full text-center space-y-8">
            <div className="flex flex-col items-center gap-3">
              <span className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">
                Built for the Intentional Soul • Since Antiquity
              </span>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                A Product From <a href="https://eliment.in" className="text-indigo-600 hover:underline flex items-center gap-1"><Command size={10} /> eliment.in</a>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div >
  );
};

export default Landing;
