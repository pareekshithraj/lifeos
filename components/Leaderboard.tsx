
import React, { useState } from 'react';
import { Trophy, Zap, Shield, Target, Flame, Crown, Medal, Search, Filter, TrendingUp, UserCheck, Star } from 'lucide-react';
import SovereignAvatar from './SovereignAvatar';

interface LeaderboardUser {
  id: string;
  name: string;
  identity: string;
  integrity: number; // Percentage
  streak: number; // Days
  focusHours: number;
  rank: number;
  avatar: string | null;
  isCurrentUser?: boolean;
}

import sql from '../db';

interface LeaderboardProps {
  user_uid: string;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ user_uid }) => {
  const [activeMetric, setActiveMetric] = useState<'integrity' | 'streak' | 'focus'>('integrity');
  const [searchQuery, setSearchQuery] = useState('');
  const [sages, setSages] = useState<LeaderboardUser[]>([]);

  // Fetch Sages
  React.useEffect(() => {
    const fetchSages = async () => {
      try {
        const results = await sql`SELECT uid as id, name, identity, plan, avatar FROM users`;
        // In a real app we would join with stats tables. 
        // For now, we'll assign random mock stats to the real users to show the UI working.
        const mapped: LeaderboardUser[] = results.map((u, i) => ({
          id: u.id,
          name: u.name,
          identity: u.identity || 'Seeker',
          integrity: Math.floor(Math.random() * 30) + 70,
          streak: Math.floor(Math.random() * 50),
          focusHours: Math.floor(Math.random() * 200),
          rank: 0,
          avatar: u.avatar,
          isCurrentUser: u.id === user_uid
        }));
        setSages(mapped);
      } catch (error) {
        console.error("Failed to fetch sages:", error);
      }
    };
    fetchSages();
  }, [user_uid]);

  const sortedSages = React.useMemo(() => {
    return [...sages].sort((a, b) => {
      if (activeMetric === 'integrity') return b.integrity - a.integrity;
      if (activeMetric === 'streak') return b.streak - a.streak;
      return b.focusHours - a.focusHours;
    }).map((s, i) => ({ ...s, rank: i + 1 }));
  }, [sages, activeMetric]);

  const filteredSages = sortedSages.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.identity.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-slate-400">
            <Trophy size={18} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">The Vertical Climb</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Hall of Sages</h1>
          <p className="text-slate-500 font-light italic max-w-md">
            "It is not death that a man should fear, but he should fear never beginning to live."
          </p>
        </div>

        <div className="flex flex-col gap-4 items-end w-full md:w-auto">
          {/* Metric Selector */}
          <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-slate-100 shadow-sm w-full md:w-auto">
            <button
              onClick={() => setActiveMetric('integrity')}
              className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeMetric === 'integrity' 
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Integrity
            </button>
            <button
              onClick={() => setActiveMetric('streak')}
              className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeMetric === 'streak' 
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Streak
            </button>
            <button
              onClick={() => setActiveMetric('focus')}
              className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeMetric === 'focus' 
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              Focus
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full max-w-xs group">
            <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
            <input 
              type="text"
              placeholder="Locate a Peer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-100 rounded-2xl pl-11 pr-4 py-3 text-xs font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-slate-50 transition-all shadow-sm"
            />
          </div>
        </div>
      </header>

      {/* Main Table */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="py-6 px-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 w-24">Rank</th>
                <th className="py-6 px-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Sage</th>
                <th className="py-6 px-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-center">Integrity</th>
                <th className="py-6 px-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-center">Streak</th>
                <th className="py-6 px-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-center">Total Focus</th>
                <th className="py-6 px-10 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSages.map((sage) => (
                <tr 
                  key={sage.id} 
                  className={`group transition-all duration-300 ${sage.isCurrentUser ? 'bg-slate-900 text-white' : 'hover:bg-slate-50'}`}
                >
                  <td className="py-8 px-10">
                    <div className="flex items-center gap-3">
                      {sage.rank === 1 && <Crown size={20} className="text-amber-500" />}
                      {sage.rank === 2 && <Medal size={20} className="text-slate-400" />}
                      {sage.rank === 3 && <Medal size={20} className="text-amber-700" />}
                      <span className={`text-xl font-black ${sage.isCurrentUser ? 'text-white' : 'text-slate-300 group-hover:text-slate-900'}`}>
                        {sage.rank.toString().padStart(2, '0')}
                      </span>
                    </div>
                  </td>
                  <td className="py-8 px-4">
                    <div className="flex items-center gap-4">
                      <SovereignAvatar 
                        name={sage.name} 
                        avatar={sage.avatar} 
                        size="md" 
                        className={sage.isCurrentUser ? "bg-white text-slate-900" : ""}
                      />
                      <div>
                        <h3 className="font-black leading-tight flex items-center gap-2">
                          {sage.name}
                          {sage.isCurrentUser && <span className="bg-indigo-500 text-[8px] px-1.5 py-0.5 rounded text-white uppercase tracking-widest">You</span>}
                        </h3>
                        <p className={`text-[10px] font-bold uppercase tracking-widest ${sage.isCurrentUser ? 'text-slate-400' : 'text-indigo-600'}`}>{sage.identity}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-8 px-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-black text-lg">{sage.integrity}%</span>
                      <div className={`w-16 h-1 rounded-full overflow-hidden ${sage.isCurrentUser ? 'bg-white/10' : 'bg-slate-100'}`}>
                        <div 
                          className={`h-full transition-all duration-1000 ${sage.isCurrentUser ? 'bg-indigo-400' : 'bg-indigo-600'}`}
                          style={{ width: `${sage.integrity}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="py-8 px-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-1.5">
                        <Flame size={14} className={sage.isCurrentUser ? 'text-amber-400' : 'text-rose-500'} />
                        <span className="font-black text-lg">{sage.streak}</span>
                      </div>
                      <span className={`text-[8px] font-black uppercase tracking-widest ${sage.isCurrentUser ? 'opacity-40' : 'text-slate-300'}`}>Days</span>
                    </div>
                  </td>
                  <td className="py-8 px-4 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-black text-lg">{sage.focusHours}h</span>
                      <span className={`text-[8px] font-black uppercase tracking-widest ${sage.isCurrentUser ? 'opacity-40' : 'text-slate-300'}`}>Pure Focus</span>
                    </div>
                  </td>
                  <td className="py-8 px-10 text-right">
                    {sage.rank <= 3 ? (
                      <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${sage.isCurrentUser ? 'bg-white/10 text-white' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-100'}`}>
                        <Star size={10} fill="currentColor" />
                        Sage Council
                      </div>
                    ) : (
                      <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${sage.isCurrentUser ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-400'}`}>
                        Disciple
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
