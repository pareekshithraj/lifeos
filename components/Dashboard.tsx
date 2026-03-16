
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { RefreshCw, Users, Shield, Zap, Target, ArrowRight, Sparkles, Scale, X, Check, Lock, Brain, Flame, Anchor, Gavel, Command, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardProps {
  currentPlan?: string;
  birthDate?: string;
}

const Dashboard: React.FC<DashboardProps> = ({ user_uid, currentPlan = 'Disciple', birthDate = '1995-04-26' }) => {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [pulseCount, setPulseCount] = useState(1420);
  const [equanimity, setEquanimity] = useState(70); 
  const [wisdom, setWisdom] = useState(85);
  const [courage, setCourage] = useState(62);
  const [justice, setJustice] = useState(75);
  const [temperance, setTemperance] = useState(90);
  const [showMandate, setShowMandate] = useState(false);
  const [mandateText, setMandateText] = useState<string | null>(null);

  // Fetch Today's Focus for display
  const [todayFocusMs, setTodayFocusMs] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      if (!user_uid) return;
      try {
        const state = await sql`SELECT * FROM user_states WHERE user_uid = ${user_uid}`;
        if (state.length > 0) {
          setEquanimity(state[0].equanimity);
          setWisdom(state[0].wisdom);
          setCourage(state[0].courage);
          setJustice(state[0].justice);
          setTemperance(state[0].temperance);
        }

        const focus = await sql`
          SELECT SUM(duration_ms) as total 
          FROM focus_sessions 
          WHERE user_uid = ${user_uid} 
          AND started_at >= CURRENT_DATE
        `;
        setTodayFocusMs(Number(focus[0]?.total || 0));

        const userCount = await sql`SELECT COUNT(*) as count FROM users`;
        setPulseCount(Number(userCount[0]?.count || 1420) + 1000);
      } catch (error) {
        console.error("Dashboard fetch failed:", error);
      }
    };
    fetchData();
  }, [user_uid]);

  const syncState = async (updates: any) => {
    if (!user_uid) return;
    try {
      await sql`
        INSERT INTO user_states (user_uid, equanimity, wisdom, courage, justice, temperance)
        VALUES (${user_uid}, ${updates.equanimity ?? equanimity}, ${updates.wisdom ?? wisdom}, ${updates.courage ?? courage}, ${updates.justice ?? justice}, ${updates.temperance ?? temperance})
        ON CONFLICT (user_uid) DO UPDATE SET
          equanimity = EXCLUDED.equanimity,
          wisdom = EXCLUDED.wisdom,
          courage = EXCLUDED.courage,
          justice = EXCLUDED.justice,
          temperance = EXCLUDED.temperance,
          last_updated = CURRENT_TIMESTAMP
      `;
    } catch (error) {
      console.error("Failed to sync state:", error);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    const pulse = setInterval(() => setPulseCount(prev => prev + (Math.random() > 0.5 ? 1 : -1)), 3000);
    
    const hasSeenMandate = localStorage.getItem('last_mandate_date') === new Date().toDateString();
    if (!hasSeenMandate) {
      setTimeout(() => generateMandate(), 1500);
    }
    
    return () => { clearInterval(timer); clearInterval(pulse); };
  }, []);

  const generateMandate = async () => {
    setIsLoading(true);
    setShowMandate(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Generate a daily 'Stoic Mandate'. A short, authoritative directive for the user to follow today based on virtue, courage, and focus. Max 15 words.",
        config: { systemInstruction: "You are the Voice of Reason. Your tone is imperial and wise." }
      });
      setMandateText(response.text?.trim() || "Master your impulses; master your destiny.");
    } catch (e) {
      setMandateText("Conquer the morning, and the day will belong to you.");
    } finally {
      setIsLoading(false);
    }
  };

  const closeMandate = () => {
    localStorage.setItem('last_mandate_date', new Date().toDateString());
    setShowMandate(false);
  };

  const calculateMementoMori = () => {
    const start = new Date(birthDate);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const weeksLived = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
    const totalWeeks = 4160; // 80 years
    return { lived: weeksLived, total: totalWeeks };
  };

  const memento = calculateMementoMori();
  const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  const secondsString = time.getSeconds().toString().padStart(2, '0');
  const dateString = time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const stats = [
    { 
      id: 'guidance', 
      label: 'Guidance', 
      val: 'Vocal', 
      icon: <Sparkles size={20} />, 
      color: 'bg-indigo-50 text-indigo-600',
      requiredPlan: 'Sage'
    },
    { 
      id: 'stopwatch', 
      label: 'Focusing', 
      val: formatFocus(todayFocusMs), 
      icon: <Zap size={20} />, 
      color: 'bg-slate-900 text-white',
      requiredPlan: 'Disciple'
    },
    { 
      id: 'discipline', 
      label: 'Discipline', 
      val: '92%', 
      icon: <Shield size={20} />, 
      color: 'bg-emerald-50 text-emerald-600',
      requiredPlan: 'Disciple'
    }
  ];

  const virtues = [
    { name: 'Wisdom', icon: <Brain size={14} />, level: wisdom, color: 'from-amber-400 to-orange-500' },
    { name: 'Courage', icon: <Flame size={14} />, level: courage, color: 'from-rose-500 to-red-600' },
    { name: 'Justice', icon: <Gavel size={14} />, level: justice, color: 'from-indigo-500 to-blue-600' },
    { name: 'Temperance', icon: <Anchor size={14} />, level: temperance, color: 'from-emerald-400 to-teal-500' }
  ];

  const formatFocus = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const hasAccess = (required: string) => {
    if (required === 'Disciple') return true;
    if (required === 'Architect' && (currentPlan === 'Architect' || currentPlan === 'Sage')) return true;
    if (required === 'Sage' && currentPlan === 'Sage') return true;
    return false;
  };

  return (
    <div className="min-h-full flex flex-col items-center justify-between py-8 md:py-12 px-2 md:px-6 relative select-none">
      {showMandate && (
        <div className="fixed inset-0 z-[100] bg-slate-900 flex items-center justify-center p-6 md:p-8 animate-in fade-in duration-700">
          <div className="max-w-3xl w-full text-center space-y-8 md:space-y-12">
            <div className="flex flex-col items-center gap-4 text-indigo-400">
              <Sparkles size={32} className="md:size-[48px] animate-pulse" />
              <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.5em] opacity-60">The Morning Mandate</span>
            </div>
            
            <div className="min-h-[100px] flex items-center justify-center">
              {isLoading ? (
                <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
              ) : (
                <h2 className="text-3xl md:text-7xl font-black text-white tracking-tighter leading-tight animate-in slide-in-from-bottom-8 duration-1000">
                  {mandateText}
                </h2>
              )}
            </div>

            <button 
              onClick={closeMandate}
              className="px-8 md:px-12 py-4 md:py-5 bg-white text-slate-900 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-[0.3em] hover:scale-105 transition-all flex items-center gap-3 mx-auto shadow-2xl shadow-indigo-500/20"
            >
              <Check size={18} /> I Vow to Uphold
            </button>
          </div>
        </div>
      )}

      {/* Background blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="w-[300px] md:w-[800px] h-[300px] md:h-[800px] rounded-full blur-[100px] md:blur-[160px] absolute -top-20 -left-20 bg-indigo-500/10"></div>
        <div className="w-[300px] md:w-[600px] h-[300px] md:h-[600px] rounded-full blur-[80px] md:blur-[140px] absolute -bottom-20 -right-20 bg-emerald-500/10"></div>
      </div>

      <div className="w-full flex justify-between items-center px-4 md:px-0">
        <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/80 shadow-sm">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)] animate-pulse"></div>
          <div className="flex items-center gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            <Users size={12} />
            <span>{pulseCount.toLocaleString()} Souls</span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 opacity-20">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-slate-900 rounded-lg flex items-center justify-center text-white"><Command size={14} /></div>
            <span className="text-[10px] font-black text-slate-900 tracking-tighter">eliment.in</span>
          </div>
        </div>
      </div>

      <div className="text-center my-12 md:my-0">
        <p className="text-slate-400 font-black tracking-[0.4em] md:tracking-[0.6em] uppercase mb-4 md:mb-8 text-[8px] md:text-[10px] opacity-60">Sovereign Point</p>
        <div className="mb-2 md:mb-4 relative inline-flex items-baseline gap-2 md:gap-4">
          <h1 className="text-[6rem] md:text-[16rem] font-black tracking-tighter text-slate-900 leading-[0.85] text-glow">{timeString}</h1>
          <span className="text-2xl md:text-6xl font-black text-slate-200 tabular-nums">{secondsString}</span>
        </div>
        <p className="text-lg md:text-3xl text-slate-400 font-light tracking-widest">{dateString}</p>
      </div>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-end">
        {/* Virtue & Memento Section */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-card rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 space-y-8">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3 text-slate-400">
                <Scale size={18} />
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em]">Virtue Pulse</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Integrity check active</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {virtues.map((v) => (
                <div key={v.name} className="space-y-3 cursor-pointer group" onClick={() => {
                  const newVal = Math.min(100, v.level + 5);
                  if (v.name === 'Wisdom') setWisdom(newVal);
                  if (v.name === 'Courage') setCourage(newVal);
                  if (v.name === 'Justice') setJustice(newVal);
                  if (v.name === 'Temperance') setTemperance(newVal);
                  syncState({ [v.name.toLowerCase()]: newVal });
                }}>
                  <div className="flex justify-between items-center px-1">
                    <div className="flex items-center gap-2">
                      <div className="text-slate-400">{v.icon}</div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{v.name}</span>
                    </div>
                    <span className="text-[10px] font-black tabular-nums">{v.level}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${v.color} transition-all duration-1000 ease-out`}
                      style={{ width: `${v.level}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-4 border-t border-slate-50">
               <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Daily Equanimity</span>
                  <span className="text-xl font-black text-slate-900">{equanimity}%</span>
               </div>
               <input 
                type="range" 
                min="0" 
                max="100" 
                value={equanimity} 
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  setEquanimity(val);
                }}
                onMouseUp={() => syncState({ equanimity })}
                onTouchEnd={() => syncState({ equanimity })}
                className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-slate-900 mt-4"
              />
            </div>
          </div>

          {/* Memento Mori Mini Tracker */}
          <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-slate-100 shadow-sm flex items-center justify-between group cursor-pointer hover:shadow-md transition-all" onClick={() => navigate('/life-clock')}>
             <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white"><History size={20} /></div>
                <div>
                   <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Memento Mori</p>
                   <p className="text-sm font-black text-slate-900">{memento.lived} / {memento.total} Weeks Lived</p>
                </div>
             </div>
             <div className="flex items-center gap-1">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className={`w-1.5 h-1.5 rounded-full ${i < 4 ? 'bg-slate-900' : 'bg-slate-100'}`}></div>
                ))}
             </div>
          </div>
        </div>

        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
          {stats.map((stat) => {
            const locked = !hasAccess(stat.requiredPlan);
            return (
              <button
                key={stat.id}
                onClick={() => navigate(`/${stat.id}`)}
                className={`glass-card rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 text-left hover:scale-[1.02] transition-all group flex items-center sm:flex-col sm:justify-between relative overflow-hidden ${locked ? 'opacity-80' : ''}`}
              >
                {locked && (
                  <div className="absolute inset-0 bg-slate-50/10 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex flex-col items-center gap-2">
                      <Lock size={16} className="text-slate-400" />
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">{stat.requiredPlan} Only</span>
                    </div>
                  </div>
                )}
                <div className={`w-10 h-10 md:w-12 md:h-12 ${stat.color} rounded-xl md:rounded-2xl flex items-center justify-center mb-0 sm:mb-4 mr-4 sm:mr-0 shadow-sm`}>
                  {locked ? <Lock size={18} /> : stat.icon}
                </div>
                <div className="flex-1 sm:w-full">
                  <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5 md:mb-1">
                    {stat.label}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl md:text-2xl font-black text-slate-900 tracking-tighter">
                      {locked ? 'Locked' : stat.val}
                    </span>
                    <ArrowRight size={14} className="text-slate-200 group-hover:text-slate-900 hidden sm:block" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
