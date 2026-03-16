
import React, { useState } from 'react';
import { FinanceGoal } from '../types';
import { Plus, TrendingUp, PiggyBank, Sparkles, X, ChevronRight, DollarSign, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import sql from '../db';

interface FinanceProps {
  user_uid: string;
}

const Finance: React.FC<FinanceProps> = ({ user_uid }) => {
  const [goals, setGoals] = useState<FinanceGoal[]>([]);

  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTarget, setNewTarget] = useState('');

  // Fetch Goals
  React.useEffect(() => {
    const fetchGoals = async () => {
      if (!user_uid) return;
      try {
        const results = await sql`SELECT * FROM finance_goals WHERE user_uid = ${user_uid} ORDER BY created_at DESC`;
        setGoals(results.map(r => ({
          id: r.id,
          title: r.title,
          targetAmount: Number(r.target_amount),
          currentAmount: Number(r.current_amount)
        })));
      } catch (error) {
        console.error("Failed to fetch goals:", error);
      }
    };
    fetchGoals();
  }, [user_uid]);

  const addGoal = async () => {
    if (!newTitle || !newTarget || !user_uid) return;
    const newId = crypto.randomUUID();
    const newGoal = {
      id: newId,
      title: newTitle,
      targetAmount: Number(newTarget),
      currentAmount: 0
    };

    setGoals([newGoal, ...goals]);
    
    try {
      await sql`
        INSERT INTO finance_goals (id, user_uid, title, target_amount, current_amount)
        VALUES (${newId}, ${user_uid}, ${newTitle}, ${Number(newTarget)}, 0)
      `;
    } catch (error) {
      console.error("Failed to save goal:", error);
    }

    setNewTitle('');
    setNewTarget('');
    setShowAdd(false);
  };

  const totalAssets = goals.reduce((sum, g) => sum + g.currentAmount, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 text-emerald-600"
          >
            <Wallet size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Capital Allocation</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black text-slate-900 tracking-tight"
          >
            Empire Builder
          </motion.h1>
          <p className="text-slate-400 font-light italic max-w-lg">
            "Wealth is the slave of a wise man, the master of a fool." — Seneca
          </p>
        </div>
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-3 bg-emerald-900 text-white px-6 py-4 rounded-[1.5rem] hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-100 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          <span className="font-bold text-xs uppercase tracking-widest">New Asset Target</span>
        </motion.button>
      </header>

      {/* Overview Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-emerald-900 to-slate-900 rounded-[3rem] p-10 md:p-14 text-white relative overflow-hidden shadow-2xl shadow-emerald-900/20"
      >
        <div className="absolute top-0 right-0 p-16 opacity-5"><Sparkles size={200} /></div>
        <div className="relative z-10 space-y-6">
          <div className="flex items-center gap-3 text-emerald-400 font-bold uppercase tracking-widest text-xs">
            <PiggyBank size={18} />
            <span>Total Evaluation</span>
          </div>
          <div className="space-y-1">
            <h2 className="text-6xl md:text-7xl font-black tracking-tighter">
              ${totalAssets.toLocaleString()}
            </h2>
            <p className="text-emerald-400/60 font-medium">+12% from last quarter</p>
          </div>

          <div className="pt-8 flex gap-4">
            <button className="bg-white/10 backdrop-blur-md border border-white/20 px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-white/20 transition-all">
              View Ledger
            </button>
            <button className="bg-emerald-500 text-emerald-950 px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-900/50">
              Deposit
            </button>
          </div>
        </div>
      </motion.div>

      {/* Goals Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {goals.map((goal, index) => {
          const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:shadow-emerald-50 transition-all duration-300 group"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="w-14 h-14 rounded-[1.2rem] bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform duration-500">
                  <TrendingUp size={24} />
                </div>
                <div className="bg-slate-50 px-4 py-2 rounded-xl text-slate-500 font-mono text-xs font-bold">
                  Goal #{index + 1}
                </div>
              </div>

              <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">{goal.title}</h3>

              <div className="flex justify-between items-end mb-6">
                <div>
                  <span className="text-2xl font-bold text-slate-900">${goal.currentAmount.toLocaleString()}</span>
                  <span className="text-slate-300 text-sm ml-2 font-medium">/ ${goal.targetAmount.toLocaleString()}</span>
                </div>
                <span className="text-emerald-600 font-black bg-emerald-50 px-3 py-1.5 rounded-lg text-xs tracking-wider">
                  {progress.toFixed(0)}%
                </span>
              </div>

              <div className="w-full h-4 bg-slate-50 rounded-full overflow-hidden mb-4 border border-slate-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "circOut" }}
                  className="h-full bg-emerald-500 rounded-full relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                </motion.div>
              </div>

              <div className="flex justify-end">
                <button className="text-emerald-600 font-bold text-xs uppercase tracking-widest hover:text-emerald-800 flex items-center gap-1 group/btn">
                  Allocated Funds <ChevronRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[3rem] w-full max-w-sm p-10 shadow-2xl relative"
          >
            <button
              onClick={() => setShowAdd(false)}
              className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-black text-slate-900 mb-8">Establish Goal</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Target Name</label>
                <div className="relative">
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Real Estate Fund"
                    className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-6 py-4 font-bold text-slate-800 placeholder:text-slate-300 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
                  />
                  <Sparkles size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Target Capital ($)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    placeholder="100000"
                    className="w-full bg-slate-50 border-none rounded-2xl pl-12 pr-6 py-4 font-bold text-slate-800 placeholder:text-slate-300 focus:ring-4 focus:ring-emerald-100 transition-all outline-none"
                  />
                  <DollarSign size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                </div>
              </div>
            </div>

            <button
              onClick={addGoal}
              className="w-full bg-emerald-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-200 mt-8 active:scale-95"
            >
              Initiate Protocol
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Finance;
