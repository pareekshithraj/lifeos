
import React from 'react';

interface LifeClockProps {
  birthDate: string;
}

const LifeClock: React.FC<LifeClockProps> = ({ birthDate }) => {
  const calculateWeeks = () => {
    const start = new Date(birthDate);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    const weeksLived = Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
    const totalWeeks = 4160; // 80 years
    return { lived: weeksLived, remaining: totalWeeks - weeksLived };
  };

  const { lived, remaining } = calculateWeeks();
  const percentage = ((lived / 4160) * 100).toFixed(1);

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Memento Mori</h1>
          <p className="text-slate-400 mt-2 font-light italic">Your life, measured in weeks.</p>
        </div>
        <div className="text-right">
          <p className="text-5xl font-black text-slate-900">{percentage}%</p>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Expended</p>
        </div>
      </header>

      <div className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-sm">
        <div className="grid grid-cols-[repeat(52,minmax(0,1fr))] gap-1 md:gap-1.5">
          {Array.from({ length: 4160 }).map((_, i) => (
            <div 
              key={i} 
              className={`aspect-square rounded-full transition-all duration-1000 ${
                i < lived 
                  ? 'bg-slate-900 opacity-100' 
                  : 'bg-slate-100 hover:bg-slate-200'
              }`}
              title={i < lived ? `Week ${i} (Lived)` : `Week ${i} (Potential)`}
            />
          ))}
        </div>
        
        <div className="mt-12 flex justify-between text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">
          <span>Birth</span>
          <span>Today</span>
          <span>Potential (80 Years)</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-2xl">
          <h3 className="text-sm font-black uppercase tracking-widest opacity-50 mb-4">Stoic Urgency</h3>
          <p className="text-2xl font-light leading-relaxed">
            Every block represents a full week. Some are gone forever. <span className="text-indigo-400 font-bold">Use the remaining ones well.</span>
          </p>
        </div>
        
        <div className="bg-white border border-slate-100 p-10 rounded-[3rem]">
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Statistical Fact</h3>
          <p className="text-2xl font-light text-slate-600 leading-relaxed">
            You have approximately <span className="text-slate-900 font-bold underline decoration-indigo-500">{remaining.toLocaleString()} weeks</span> left to create the identity you desire.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LifeClock;
