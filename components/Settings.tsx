
import React, { useState } from 'react';
import { Palette, Layers, Bell, Shield, Trash2, CheckCircle2, CreditCard, Sparkles, Crown, ArrowUpRight, RotateCcw, Image as ImageIcon, Zap } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface SettingsProps {
  onThemeChange: (theme: string) => void;
  currentTheme: string;
  currentPlan: string;
  onPlanChange: (plan: string) => void;
  onBackgroundChange: (bg: string) => void;
  currentBackground: string;
}

const THEMES = [
  { id: 'slate', name: 'Deep Slate', color: 'bg-slate-900', desc: 'Default Stoic' },
  { id: 'ivory', name: 'Ivory Stoic', color: 'bg-orange-50', desc: 'High Clarity' },
  { id: 'midnight', name: 'Midnight', color: 'bg-black', desc: 'OLED Focus' },
  { id: 'papyrus', name: 'Papyrus', color: 'bg-[#f4ecd8]', desc: 'Reflective' },
];

const PRESET_BGS = [
  { id: 'none', name: 'System Default', value: '', type: 'solid' },
  { id: 'solid-slate', name: 'Muted Slate', value: '#f1f5f9', type: 'solid' },
  { id: 'solid-cream', name: 'Warm Cream', value: '#fffcf5', type: 'solid' },
  { id: 'grad-serenity', name: 'Serenity', value: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', type: 'gradient' },
  { id: 'grad-focus', name: 'Deep Focus', value: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)', type: 'gradient' },
  { id: 'grad-dusk', name: 'Dusk Glow', value: 'linear-gradient(225deg, #fff7ed 0%, #ffedd5 100%)', type: 'gradient' },
];

const Settings: React.FC<SettingsProps> = ({ 
  onThemeChange, 
  currentTheme, 
  currentPlan, 
  onPlanChange,
  onBackgroundChange,
  currentBackground
}) => {
  const [bgType, setBgType] = useState('pure');
  const [aiInsights, setAiInsights] = useState(true);
  const [focusSound, setFocusSound] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAIPattern = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Generate a single CSS 'background-image' property value for a subtle, minimalist, abstract stoic background. Use light, high-clarity colors like whites, soft slates, or pale cremes. Combine linear gradients or radial gradients for a mesh effect. Return ONLY the property value string, e.g., 'radial-gradient(at 0% 0%, #f1f5f9 0, transparent 50%), radial-gradient(at 50% 0%, #f8fafc 0, transparent 50%)'. Do not include quotes or semicolons.",
        config: {
          systemInstruction: "You are a minimalist UI designer. Your output is only valid CSS background strings."
        }
      });
      const pattern = response.text?.trim() || 'linear-gradient(to bottom, #f8fafc, #f1f5f9)';
      onBackgroundChange(pattern);
    } catch (error) {
      console.error("AI Generation failed", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-12 pb-24">
      <header>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Preferences</h1>
        <p className="text-slate-400 mt-2 font-light">Fine-tune your environment for maximum clarity.</p>
      </header>

      {/* Subscription Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 text-slate-400">
          <CreditCard size={20} />
          <h2 className="text-sm font-black uppercase tracking-[0.3em]">Billing & Standing</h2>
        </div>

        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform duration-1000">
            <Sparkles size={120} />
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-2">Current Commitment</p>
              <div className="flex items-center gap-4">
                <h3 className="text-3xl font-black">{currentPlan}</h3>
                <div className="px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-300">Active Standing</div>
              </div>
              <p className="text-xs text-slate-400 mt-3 font-medium italic">Your next renewal is on the next new moon cycle (Oct 14).</p>
            </div>
            
            <div className="flex gap-4">
              <button 
                onClick={() => onPlanChange('Sage')}
                className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3"
              >
                Change Standing <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Identity Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 text-slate-400">
          <Palette size={20} />
          <h2 className="text-sm font-black uppercase tracking-[0.3em]">Visual Identity</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => onThemeChange(t.id)}
              className={`p-6 rounded-[2rem] border transition-all duration-500 text-left relative overflow-hidden group ${
                currentTheme === t.id 
                  ? 'border-slate-900 ring-4 ring-slate-100 shadow-xl' 
                  : 'border-slate-100 hover:border-slate-300 bg-white'
              }`}
            >
              <div className={`w-8 h-8 rounded-full ${t.color} mb-4 shadow-sm group-hover:scale-110 transition-transform`}></div>
              <p className="font-bold text-slate-900 text-sm">{t.name}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">{t.desc}</p>
              {currentTheme === t.id && (
                <CheckCircle2 size={16} className="absolute top-4 right-4 text-slate-900" />
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Background Selection Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 text-slate-400">
          <ImageIcon size={20} />
          <h2 className="text-sm font-black uppercase tracking-[0.3em]">Background Canvas</h2>
        </div>

        <div className="bg-white border border-slate-100 rounded-[3rem] p-8 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {PRESET_BGS.map((bg) => (
              <button
                key={bg.id}
                onClick={() => onBackgroundChange(bg.value)}
                className={`p-4 rounded-2xl border transition-all flex items-center gap-3 group ${
                  currentBackground === bg.value 
                  ? 'border-slate-900 bg-slate-50 ring-2 ring-slate-100' 
                  : 'border-slate-50 hover:border-slate-200'
                }`}
              >
                <div 
                  className="w-10 h-10 rounded-xl border border-slate-100 shadow-sm"
                  style={{ background: bg.value || '#f8fafc' }}
                ></div>
                <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-900 leading-none mb-1">{bg.name}</p>
                  <p className="text-[8px] font-bold text-slate-300 uppercase">{bg.type}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="pt-8 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <h4 className="font-black text-slate-900 text-sm flex items-center gap-2">
                <Zap size={14} className="text-indigo-600" />
                Stoic Flow Generator
              </h4>
              <p className="text-xs text-slate-400">Generate a unique, subtle abstract pattern using AI.</p>
            </div>
            <button 
              onClick={generateAIPattern}
              disabled={isGenerating}
              className={`px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 shadow-xl ${
                isGenerating 
                ? 'bg-slate-100 text-slate-300' 
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100'
              }`}
            >
              {isGenerating ? <RotateCcw className="animate-spin" size={14} /> : <Sparkles size={14} />}
              {isGenerating ? 'Drafting...' : 'Generate AI Pattern'}
            </button>
          </div>
        </div>
      </section>

      {/* Cognition & System Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 text-slate-400">
          <Bell size={20} />
          <h2 className="text-sm font-black uppercase tracking-[0.3em]">System Behavior</h2>
        </div>

        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-4 space-y-2">
          <div className="flex items-center justify-between p-6 rounded-3xl hover:bg-slate-50 transition-colors">
            <div>
              <p className="font-bold text-slate-800">Profound Mode</p>
              <p className="text-xs text-slate-400 mt-1">Enable AI insights for discipline rules.</p>
            </div>
            <button 
              onClick={() => setAiInsights(!aiInsights)}
              className={`w-14 h-8 rounded-full p-1 transition-colors duration-500 ${aiInsights ? 'bg-slate-900' : 'bg-slate-200'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full transition-transform duration-500 ${aiInsights ? 'translate-x-6' : 'translate-x-0 shadow-sm'}`}></div>
            </button>
          </div>

          <div className="flex items-center justify-between p-6 rounded-3xl hover:bg-slate-50 transition-colors">
            <div>
              <p className="font-bold text-slate-800">Focus Chamber Sound</p>
              <p className="text-xs text-slate-400 mt-1">Subtle ticking during focus sessions.</p>
            </div>
            <button 
              onClick={() => setFocusSound(!focusSound)}
              className={`w-14 h-8 rounded-full p-1 transition-colors duration-500 ${focusSound ? 'bg-slate-900' : 'bg-slate-200'}`}
            >
              <div className={`w-6 h-6 bg-white rounded-full transition-transform duration-500 ${focusSound ? 'translate-x-6' : 'translate-x-0 shadow-sm'}`}></div>
            </button>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 text-slate-400">
          <Shield size={20} />
          <h2 className="text-sm font-black uppercase tracking-[0.3em]">Integrity & Data</h2>
        </div>

        <div className="p-10 border border-rose-100 bg-rose-50/20 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-black text-slate-900">Purge OS History</h3>
            <p className="text-sm text-slate-400 mt-2">Permanently delete all routines, discipline records, and plans.</p>
          </div>
          <button className="flex items-center gap-3 bg-white border border-rose-200 text-rose-600 px-8 py-4 rounded-2xl hover:bg-rose-600 hover:text-white transition-all font-bold shadow-lg shadow-rose-100">
            <Trash2 size={18} />
            <span>Reset Everything</span>
          </button>
        </div>
      </section>

      <footer className="text-center pt-12">
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300">Life OS v1.0 • Built for the Intentional</p>
      </footer>
    </div>
  );
};

export default Settings;
