import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, Target, Shield, Eye, EyeOff, Sparkles, Command } from 'lucide-react';
import sql from '../db';

const QUOTES = [
  "True freedom is the ability to choose your response to any circumstance.",
  "You have power over your mind - not outside events. Realize this, and you will find strength.",
  "Focus on what you can control. The rest is noise.",
  "Be like the cliff against which the waves continually break.",
  "Waste no more time arguing what a good man should be. Be one."
];

interface StopwatchProps {
  user_uid: string;
}

const Stopwatch: React.FC<StopwatchProps> = ({ user_uid }) => {
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isProtocolMode, setIsProtocolMode] = useState(false);
  const [activeQuote, setActiveQuote] = useState(QUOTES[0]);
  const [todayFocusMs, setTodayFocusMs] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Fetch Today's Focus Time
  useEffect(() => {
    const fetchFocus = async () => {
      if (!user_uid) return;
      try {
        const results = await sql`
          SELECT SUM(duration_ms) as total 
          FROM focus_sessions 
          WHERE user_uid = ${user_uid} 
          AND started_at >= CURRENT_DATE
        `;
        setTodayFocusMs(Number(results[0]?.total || 0));
      } catch (error) {
        console.error("Failed to fetch focus time:", error);
      }
    };
    fetchFocus();
  }, [user_uid]);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTime(prev => prev + 10);
      }, 10);
      // Change quote every 5 minutes during focus
      const quoteInterval = setInterval(() => {
        setActiveQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
      }, 300000);
      return () => clearInterval(quoteInterval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  const logSession = async (duration: number) => {
    if (duration < 1000 || !user_uid) return;
    try {
      const newId = crypto.randomUUID();
      await sql`
        INSERT INTO focus_sessions (id, user_uid, duration_ms)
        VALUES (${newId}, ${user_uid}, ${duration})
      `;
      setTodayFocusMs(prev => prev + duration);
    } catch (error) {
      console.error("Failed to log focus session:", error);
    }
  };

  const toggle = async () => {
    if (isActive) {
      await logSession(time);
      setIsActive(false);
    } else {
      setIsActive(true);
    }
  };

  const reset = async () => {
    if (isActive) {
      await logSession(time);
    }
    setIsActive(false);
    setTime(0);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor((time / 60000) % 60);
    const seconds = Math.floor((time / 1000) % 60);
    const ms = Math.floor((time / 10) % 100);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  const formatTodayTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isProtocolMode) {
    return (
      <div className="fixed inset-0 z-[1000] bg-slate-900 flex flex-col items-center justify-center p-6 md:p-12 animate-in fade-in duration-1000">
        <div className="absolute top-12 left-12 flex items-center gap-3 opacity-20">
          <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center text-white"><Command size={16} /></div>
          <span className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Protocol Active</span>
        </div>
        
        <div className="max-w-2xl w-full text-center space-y-16">
          <p className="text-xl md:text-3xl text-slate-500 font-light italic leading-relaxed animate-in fade-in duration-1000">
            "{activeQuote}"
          </p>
          
          <div className="relative group">
            <div className="absolute inset-0 bg-white/5 rounded-full blur-[100px] scale-150 animate-pulse"></div>
            <h1 className="text-6xl md:text-[10rem] font-mono font-medium text-white tracking-tighter tabular-nums relative z-10">
              {formatTime(time).split('.')[0]}
            </h1>
          </div>
          
          <div className="flex flex-col items-center gap-8">
            <button 
              onClick={toggle}
              className="w-20 h-20 rounded-full bg-white text-slate-900 flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all"
            >
              {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} className="ml-1" fill="currentColor" />}
            </button>
            <button 
              onClick={() => setIsProtocolMode(false)}
              className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 hover:text-white transition-colors"
            >
              <Eye size={14} /> Deactivate Immersive Mode
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full flex flex-col items-center justify-center space-y-12 md:space-y-20 py-8 md:py-16 select-none overflow-hidden animate-in fade-in duration-700">
      <div className="text-center space-y-4 px-4">
        <div className="flex items-center justify-center gap-2 mb-4">
            <button 
              onClick={() => setIsProtocolMode(true)}
              className="px-4 py-2 bg-slate-100 border border-slate-200 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-white transition-all flex items-center gap-2"
            >
              <Shield size={14} className="text-indigo-500" /> Activate Deep Work Protocol
            </button>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Focus Chamber</h1>
        <p className="text-slate-400 font-light max-w-sm mx-auto text-sm md:text-base leading-relaxed tracking-wide opacity-80 italic">
          "A man who dares to waste one hour has not discovered the value of life."
        </p>
      </div>

      <div className="relative group px-4">
        <div className={`absolute inset-0 bg-slate-100 rounded-full blur-[60px] md:blur-[100px] transition-all duration-1000 ${isActive ? 'opacity-60 scale-125 md:scale-150' : 'opacity-20 scale-100'}`}></div>
        <div className={`w-64 h-64 md:w-96 md:h-96 rounded-full border border-slate-100 flex items-center justify-center bg-white shadow-[0_40px_80px_-20px_rgba(0,0,0,0.04)] relative z-10 transition-all duration-1000 ${isActive ? 'scale-[1.05] ring-[8px] md:ring-[12px] ring-slate-50' : ''}`}>
          <div className="flex flex-col items-center">
            <span className="text-4xl md:text-7xl font-mono font-medium text-slate-900 tracking-tighter tabular-nums">
              {formatTime(time)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6 md:gap-12 relative z-10">
        <button 
          onClick={reset}
          className="p-4 md:p-5 bg-white border border-slate-100 rounded-full text-slate-200 hover:text-slate-900 hover:shadow-xl transition-all active:scale-90"
        >
          <RotateCcw size={24} className="md:size-[28px]" />
        </button>

        <button 
          onClick={toggle}
          className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-white shadow-2xl transition-all duration-700 transform active:scale-95 ${
            isActive 
              ? 'bg-slate-900 shadow-slate-300 ring-8 ring-white' 
              : 'bg-indigo-600 shadow-indigo-100 ring-8 ring-white'
          }`}
        >
          {isActive ? <Pause size={30} className="md:size-[38px]" fill="currentColor" /> : <Play size={30} className="md:size-[38px] ml-1.5" fill="currentColor" />}
        </button>

        <button 
          className="p-4 md:p-5 bg-white border border-slate-100 rounded-full text-slate-200 hover:text-amber-500 hover:shadow-xl transition-all active:scale-90"
        >
          <Coffee size={24} className="md:size-[28px]" />
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-8 sm:gap-16 pt-6">
        <div className="flex items-center gap-4 text-slate-400">
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 border border-slate-100">
            <Target size={20} className="md:size-[24px]" />
          </div>
          <div>
            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] leading-none mb-2 opacity-50">Goal</p>
            <p className="text-sm md:text-base font-bold text-slate-800">Deep Work</p>
          </div>
        </div>
        
        <div className="hidden sm:block w-px h-14 bg-slate-100 self-center"></div>
        
        <div className="text-center sm:text-right flex flex-col justify-center">
          <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 leading-none mb-2 opacity-50">Today</p>
          <p className="text-sm md:text-base font-black text-slate-900 font-mono tracking-tight">{formatTodayTime(todayFocusMs)}</p>
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-2 opacity-10 grayscale">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-900 rounded-lg flex items-center justify-center text-white"><Command size={14} /></div>
            <span className="text-[10px] font-black text-slate-900 tracking-tighter">eliment.in</span>
          </div>
      </div>
    </div>
  );
};

export default Stopwatch;
