
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Scale, Sparkles, Plus, Trash2, ArrowRight, ShieldCheck, Zap, AlertCircle, Command, HelpCircle } from 'lucide-react';

interface MatrixItem {
  id: string;
  text: string;
  type: 'internal' | 'external';
}

const ControlMatrix: React.FC = () => {
  const [situation, setSituation] = useState('');
  const [items, setItems] = useState<MatrixItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const analyzeSituation = async () => {
    if (!situation.trim()) return;
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Given the situation: "${situation}", identify exactly 3 internal factors (within control) and 3 external factors (outside control). Return as a JSON array of objects with "text" and "type" (either 'internal' or 'external'). Ensure the distinction is based on classic Stoic logic.`,
        config: { 
          responseMimeType: "application/json",
          systemInstruction: "You are a Stoic logic engine. You provide clinical, accurate breakdowns of control. Your mission is to help the user realize where their agency truly lies."
        }
      });
      const parsed: {text: string, type: 'internal' | 'external'}[] = JSON.parse(response.text || '[]');
      const newItems = parsed.map(item => ({ ...item, id: Math.random().toString(36).substr(2, 9) }));
      setItems([...newItems]);
    } catch (e) {
      console.error(e);
      // Fallback manual items if API fails
      setItems([
        { id: 'f1', text: 'My internal judgment of the event', type: 'internal' },
        { id: 'f2', text: 'The actions I choose to take next', type: 'internal' },
        { id: 'f3', text: 'The outcome of my actions', type: 'external' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const addItem = (type: 'internal' | 'external') => {
    if (!inputValue.trim()) return;
    setItems([...items, { id: Date.now().toString(), text: inputValue, type }]);
    setInputValue('');
  };

  const clearMatrix = () => {
    setItems([]);
    setSituation('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-slate-400">
            <Scale size={18} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">The Dichotomy of Control</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Control Matrix</h1>
          <p className="text-slate-500 font-light italic max-w-lg">
            "The chief task in life is simply this: to identify and separate matters..."
          </p>
        </div>
        <div className="flex items-center gap-4">
            <button 
              onClick={clearMatrix}
              className="px-6 py-3 bg-white border border-slate-100 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:text-slate-900 transition-all"
            >
              Reset Matrix
            </button>
        </div>
      </header>

      <div className="bg-white rounded-[3.5rem] border border-slate-100 p-8 md:p-12 shadow-sm space-y-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Scale size={120} />
        </div>
        <div className="space-y-4 relative z-10">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-4">Current Disturbance / Situation</label>
            <div className="flex items-center gap-2 text-indigo-400">
               <HelpCircle size={14} />
               <span className="text-[10px] font-black uppercase tracking-widest">What occupies your mind?</span>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-4">
            <input 
              type="text" 
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              placeholder="e.g. A difficult meeting tomorrow with a critical stakeholder..."
              className="flex-1 bg-slate-50 border-none rounded-3xl px-8 py-5 focus:ring-4 focus:ring-indigo-100 transition-all font-bold text-slate-700 shadow-inner"
            />
            <button 
              onClick={analyzeSituation}
              disabled={isLoading || !situation.trim()}
              className="px-10 py-5 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-200/50 flex items-center justify-center gap-4 hover:bg-slate-800 disabled:opacity-50 active:scale-95 transition-all"
            >
              {isLoading ? <Sparkles className="animate-spin" size={18} /> : <Zap size={18} />}
              Analyze Matrix
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative">
        {/* Decorative Divider */}
        <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-px bg-slate-100 -translate-x-1/2"></div>
        
        {/* Internal Column */}
        <div className="space-y-8 animate-in slide-in-from-left-8 duration-700">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-4 text-emerald-600">
              <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center shadow-sm">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest">Internal Domain</h2>
                <p className="text-[8px] font-black text-emerald-400 uppercase tracking-[0.2em]">Solely your agency</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {items.filter(i => i.type === 'internal').map(item => (
              <div key={item.id} className="bg-white p-8 rounded-[2rem] border border-emerald-100 shadow-sm hover:shadow-xl transition-all duration-500 group relative">
                <p className="font-bold text-slate-800 text-lg leading-relaxed">{item.text}</p>
                <div className="absolute top-4 right-4 flex items-center gap-2">
                   <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-2 py-1 rounded">Control</span>
                   <button 
                    onClick={() => setItems(items.filter(i => i.id !== item.id))} 
                    className="text-slate-100 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                   >
                    <Trash2 size={16} />
                   </button>
                </div>
              </div>
            ))}
            
            <div className="p-4 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200 flex gap-3">
              <input 
                type="text" 
                placeholder="Declare an internal anchor..."
                className="flex-1 bg-transparent border-none px-4 py-3 text-sm font-bold placeholder:text-slate-300 focus:outline-none italic"
                onKeyDown={(e) => e.key === 'Enter' && addItem('internal')}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <button 
                onClick={() => addItem('internal')} 
                className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* External Column */}
        <div className="space-y-8 animate-in slide-in-from-right-8 duration-700">
          <div className="flex items-center justify-between px-4">
            <div className="flex items-center gap-4 text-slate-400">
              <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center shadow-sm">
                <AlertCircle size={20} />
              </div>
              <div>
                <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">External Noise</h2>
                <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">Beyond your power</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {items.filter(i => i.type === 'external').map(item => (
              <div key={item.id} className="bg-slate-50/40 p-8 rounded-[2rem] border border-slate-100 transition-all duration-500 group relative grayscale opacity-60 hover:grayscale-0 hover:opacity-100">
                <p className="font-bold text-slate-500 text-lg leading-relaxed line-through decoration-slate-300 decoration-2">{item.text}</p>
                <div className="absolute top-4 right-4 flex items-center gap-2">
                   <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest bg-white px-2 py-1 rounded">No Agency</span>
                   <button 
                    onClick={() => setItems(items.filter(i => i.id !== item.id))} 
                    className="text-slate-100 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all p-1"
                   >
                    <Trash2 size={16} />
                   </button>
                </div>
              </div>
            ))}
            
            {items.filter(i => i.type === 'external').length === 0 && !isLoading && (
              <div className="p-16 border border-dashed border-slate-100 rounded-[3rem] text-center space-y-4 opacity-20">
                <ArrowRight size={32} className="mx-auto" />
                <p className="text-[10px] font-black uppercase tracking-widest">Separate the distractions</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="pt-20 text-center space-y-8">
        <div className="flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-xl text-white">
            <Command size={16} />
            <span className="text-[10px] font-black tracking-widest uppercase">eliment.in sovereign tool</span>
          </div>
          <p className="text-slate-400 text-xs italic font-light max-w-sm">"It’s not what happens to you, but how you react to it that matters." — Epictetus</p>
        </div>
      </footer>
    </div>
  );
};

export default ControlMatrix;
