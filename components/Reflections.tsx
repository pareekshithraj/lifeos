
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Send, Sparkles, History, Quote, Lock, Crown, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import sql from '../db';

interface ReflectionsProps {
  user_uid: string;
  currentPlan?: string;
}

const Reflections: React.FC<ReflectionsProps> = ({ user_uid, currentPlan = 'Disciple' }) => {
  const navigate = useNavigate();
  const [entry, setEntry] = useState('');
  const [audit, setAudit] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // Fetch latest reflection for today
  useEffect(() => {
    const fetchLatest = async () => {
      if (!user_uid) return;
      try {
        const results = await sql`
          SELECT * FROM reflection_entries 
          WHERE user_uid = ${user_uid} 
          AND date = CURRENT_DATE
          ORDER BY created_at DESC LIMIT 1
        `;
        if (results.length > 0) {
          setEntry(results[0].content);
          setAudit(results[0].audit);
        }
      } catch (error) {
        console.error("Failed to fetch reflection:", error);
      }
    };
    fetchLatest();
  }, [user_uid]);

  const isArchitectOrSage = currentPlan === 'Architect' || currentPlan === 'Sage';

  const performStoicAudit = async () => {
    if (!isArchitectOrSage) {
      setShowPaywall(true);
      return;
    }
    if (!entry.trim()) return;
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: `Analyze the following daily reflection and provide a brief Stoic Audit (max 60 words). Identify if the author acted with virtue, focus, or allowed external chaos to disturb them. Reflection: "${entry}"`,
      });
      const auditText = response.text?.trim() || "Reflection processed.";
      setAudit(auditText);

      // Persist to Neon
      const newId = crypto.randomUUID();
      await sql`
        INSERT INTO reflection_entries (id, user_uid, content, audit)
        VALUES (${newId}, ${user_uid}, ${entry}, ${auditText})
      `;
    } catch (error) {
      console.error("Audit failed:", error);
      setAudit("The day is done. Your effort is noted. Rest now to act better tomorrow.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-24 relative">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">The Reflection Chamber</h1>
        <p className="text-slate-400 font-light italic">"The unexamined life is not worth living."</p>
      </header>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm p-10 space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <Quote size={180} />
        </div>
        
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Evening Review</label>
          <textarea 
            value={entry}
            onChange={(e) => setEntry(e.target.value)}
            placeholder="How did you handle your obstacles today? Where did you lose your focus? Where did you succeed?"
            className="w-full h-64 bg-slate-50 border-none rounded-[2rem] p-8 focus:ring-4 focus:ring-slate-100 transition-all text-slate-700 leading-relaxed italic resize-none"
          />
        </div>

        <div className="flex justify-between items-center">
          <button className="flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors text-sm font-bold">
            <History size={18} />
            View Past Audits
          </button>
          
          <button 
            onClick={performStoicAudit}
            disabled={isLoading || !entry}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-sm shadow-xl transition-all relative group overflow-hidden ${
              isLoading || !entry 
              ? 'bg-slate-100 text-slate-300' 
              : 'bg-slate-900 text-white shadow-slate-200 hover:bg-slate-800'
            }`}
          >
            {!isArchitectOrSage && <Lock size={14} className="text-white/40 group-hover:text-amber-400 transition-colors" />}
            {isLoading ? <Sparkles className="animate-spin" size={18} /> : <Send size={18} />}
            Seek AI Audit
            {!isArchitectOrSage && <span className="absolute top-0 right-0 px-2 py-0.5 bg-amber-500 text-[8px] font-black">Architect+</span>}
          </button>
        </div>
      </div>

      {showPaywall && (
        <div className="fixed inset-0 z-[200] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
          <div className="bg-white rounded-[4rem] w-full max-w-lg overflow-hidden shadow-2xl p-12 text-center relative border border-white/20">
            <div className="absolute top-0 right-0 p-8 opacity-5"><Crown size={120} /></div>
            <div className="w-20 h-20 bg-indigo-50 rounded-[2rem] flex items-center justify-center text-indigo-600 mx-auto mb-8 shadow-inner">
              <Sparkles size={40} />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Expand Your Consciousness</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-10 italic font-medium">
              "To see clearly, one must be willing to pay the price of clarity. AI Audits require Architect Standing."
            </p>
            <div className="flex gap-4">
              <button onClick={() => setShowPaywall(false)} className="flex-1 px-4 py-5 rounded-2xl text-slate-400 hover:bg-slate-50 transition-colors font-bold text-sm">Maybe Later</button>
              <button 
                onClick={() => navigate('/profile')}
                className="flex-1 bg-slate-900 text-white px-4 py-5 rounded-2xl hover:bg-slate-800 transition-all font-bold text-sm shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
              >
                Ascend Now <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {audit && (
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-[2.5rem] p-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-3 text-indigo-600 mb-6">
            <Sparkles size={20} />
            <h2 className="text-[10px] font-black uppercase tracking-[0.3em]">The Stoic Audit</h2>
          </div>
          <p className="text-indigo-900 text-lg leading-relaxed font-medium italic">
            "{audit}"
          </p>
        </div>
      )}
    </div>
  );
};

export default Reflections;
