
import React, { useState } from 'react';
import { Rule, DisciplineRecord } from '../types';
import { Check, X, Plus, Trash2, Sparkles } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

import sql from '../db';

interface DisciplineProps {
  user_uid: string;
}

const Discipline: React.FC<DisciplineProps> = ({ user_uid }) => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [records, setRecords] = useState<DisciplineRecord>({});
  
  const [newRuleLabel, setNewRuleLabel] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [aiInsight, setAiInsight] = useState<{id: string, text: string} | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  // Fetch Logic
  React.useEffect(() => {
    const fetchData = async () => {
      if (!user_uid) return;
      try {
        const dbRules = await sql`SELECT * FROM rules WHERE user_uid = ${user_uid} ORDER BY created_at ASC`;
        setRules(dbRules.map(r => ({ id: r.id, label: r.label })));

        const dbRecords = await sql`SELECT * FROM discipline_records WHERE user_uid = ${user_uid}`;
        const recordsMap: DisciplineRecord = {};
        dbRecords.forEach(r => {
          const dateStr = new Date(r.date).toISOString().split('T')[0];
          if (!recordsMap[dateStr]) recordsMap[dateStr] = {};
          recordsMap[dateStr][r.rule_id] = r.completed;
        });
        setRecords(recordsMap);
      } catch (error) {
        console.error("Failed to fetch discipline data:", error);
      }
    };
    fetchData();
  }, [user_uid]);

  const toggleRule = async (ruleId: string, value: boolean) => {
    setRecords(prev => ({
      ...prev,
      [today]: {
        ...(prev[today] || {}),
        [ruleId]: value,
      }
    }));

    try {
      await sql`
        INSERT INTO discipline_records (user_uid, rule_id, date, completed)
        VALUES (${user_uid}, ${ruleId}, ${today}, ${value})
        ON CONFLICT (user_uid, rule_id, date) DO UPDATE SET completed = ${value}
      `;
    } catch (error) {
      console.error("Failed to sync record:", error);
    }
  };

  const addRule = async () => {
    if (!newRuleLabel || !user_uid) return;
    const newId = crypto.randomUUID();
    setRules([...rules, { id: newId, label: newRuleLabel }]);
    
    try {
      await sql`INSERT INTO rules (id, user_uid, label) VALUES (${newId}, ${user_uid}, ${newRuleLabel})`;
    } catch (error) {
      console.error("Failed to save rule:", error);
    }

    setNewRuleLabel('');
    setShowAdd(false);
  };

  const deleteRule = async (id: string) => {
    setRules(rules.filter(r => r.id !== id));
    if (aiInsight?.id === id) setAiInsight(null);

    try {
      await sql`DELETE FROM rules WHERE id = ${id}`;
    } catch (error) {
      console.error("Failed to delete rule:", error);
    }
  };

  const getAiInsight = async (rule: Rule) => {
    if (aiInsight?.id === rule.id) {
      setAiInsight(null);
      return;
    }
    
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Briefly explain the cognitive or life-quality benefit of this discipline rule: "${rule.label}". Max 15 words. Be clinical and profound.`,
        config: {
          systemInstruction: "You are a performance psychologist. No fluff."
        }
      });
      setAiInsight({ id: rule.id, text: response.text?.trim() || "Structural discipline yields clarity." });
    } catch (e) {
      setAiInsight({ id: rule.id, text: "Consistency reinforces your core identity." });
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-12 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Discipline</h1>
          <p className="text-slate-400 mt-2 font-light">The cost of freedom is constraint.</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)}
          className="p-4 bg-slate-900 text-white rounded-[1.5rem] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
        >
          <Plus size={24} />
        </button>
      </header>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex justify-between items-center">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Rules of Life</span>
          <span className="text-xs font-bold text-slate-600">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        </div>

        <div className="divide-y divide-slate-50">
          {rules.map(rule => {
            const status = records[today]?.[rule.id];
            const hasInsight = aiInsight?.id === rule.id;

            return (
              <div key={rule.id} className="group">
                <div className="p-8 flex items-center justify-between transition-colors hover:bg-slate-50/20">
                  <div className="flex items-center gap-4">
                    <div className={`w-2 h-2 rounded-full ${status === true ? 'bg-emerald-500' : status === false ? 'bg-rose-500' : 'bg-slate-200'} transition-colors duration-500`}></div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className={`text-xl transition-all duration-500 ${status === true ? 'text-slate-300 line-through font-light' : 'text-slate-800 font-semibold'}`}>
                          {rule.label}
                        </span>
                        <button 
                          onClick={() => getAiInsight(rule)}
                          className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-all ${hasInsight ? 'text-indigo-600' : 'text-slate-300 hover:text-indigo-400'}`}
                        >
                          <Sparkles size={14} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => deleteRule(rule.id)}
                      className="p-2 text-slate-200 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity mr-2"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => toggleRule(rule.id, false)}
                      className={`p-4 rounded-2xl transition-all duration-300 ${status === false ? 'bg-rose-500 text-white shadow-lg shadow-rose-100' : 'bg-slate-50 text-slate-300 hover:bg-rose-50 hover:text-rose-400'}`}
                    >
                      <X size={20} />
                    </button>
                    <button
                      onClick={() => toggleRule(rule.id, true)}
                      className={`p-4 rounded-2xl transition-all duration-300 ${status === true ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' : 'bg-slate-50 text-slate-300 hover:bg-emerald-50 hover:text-emerald-400'}`}
                    >
                      <Check size={20} />
                    </button>
                  </div>
                </div>
                
                {hasInsight && (
                  <div className="px-12 pb-8 animate-in slide-in-from-top-2 duration-300">
                    <div className="text-xs text-indigo-600/70 bg-indigo-50/30 p-5 rounded-2xl border border-indigo-100/50 leading-relaxed font-medium italic">
                      {isAiLoading ? "Consulting foundations..." : `"${aiInsight.text}"`}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {rules.length === 0 && (
            <div className="p-20 text-center text-slate-300 italic font-light tracking-widest">
              Tabula Rasa. Define your boundaries.
            </div>
          )}
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-[4px] flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-sm p-12 shadow-2xl animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-black mb-8 text-slate-900 tracking-tight">New Rule</h2>
            <input 
              type="text"
              autoFocus
              value={newRuleLabel}
              onChange={(e) => setNewRuleLabel(e.target.value)}
              placeholder="e.g. Deep Work before Noon"
              className="w-full bg-slate-50 border border-slate-100 rounded-[1.5rem] px-6 py-5 mb-10 focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all"
            />
            <div className="flex gap-4">
              <button 
                onClick={() => setShowAdd(false)}
                className="flex-1 px-4 py-5 rounded-2xl text-slate-400 hover:bg-slate-50 transition-colors font-bold text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={addRule}
                className="flex-1 bg-slate-900 text-white px-4 py-5 rounded-2xl hover:bg-slate-800 transition-all font-bold text-sm shadow-xl shadow-slate-200"
              >
                Establish
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="text-center text-[9px] text-slate-300 pt-16 uppercase tracking-[0.4em] font-black opacity-30">
        Local Sovereignty • No External Tracking
      </div>
    </div>
  );
};

export default Discipline;
