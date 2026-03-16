
import React, { useState } from 'react';
import { DAYS_OF_WEEK } from '../constants';
import { TimetableEntry } from '../types';
import { Plus, Trash2, Clock, Calendar, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import sql from '../db';

const HOURS = Array.from({ length: 18 }, (_, i) => `${(i + 6).toString().padStart(2, '0')}:00`);

interface TimetableProps {
  user_uid: string;
}

const Timetable: React.FC<TimetableProps> = ({ user_uid }) => {
  const [entries, setEntries] = useState<TimetableEntry[]>([]);

  // Fetch Entries
  React.useEffect(() => {
    const fetchEntries = async () => {
      if (!user_uid) return;
      try {
        const results = await sql`
          SELECT * FROM timetable_entries 
          WHERE user_uid = ${user_uid}
        `;
        setEntries(results.map(r => ({
          id: r.id,
          day: r.day,
          startTime: r.start_time,
          endTime: r.end_time,
          label: r.label
        })));
      } catch (error) {
        console.error("Failed to fetch entries:", error);
      }
    };
    fetchEntries();
  }, [user_uid]);

  const [selectedDay, setSelectedDay] = useState('Monday');
  const [showAdd, setShowAdd] = useState(false);
  const [newEntry, setNewEntry] = useState<Partial<TimetableEntry>>({
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    label: '',
  });

  const addEntry = async () => {
    if (!newEntry.label || !user_uid) return;
    const newId = crypto.randomUUID();
    const entryData = { ...newEntry, id: newId } as TimetableEntry;
    setEntries([...entries, entryData]);
    
    try {
      await sql`
        INSERT INTO timetable_entries (id, user_uid, day, start_time, end_time, label)
        VALUES (${newId}, ${user_uid}, ${newEntry.day}, ${newEntry.startTime}, ${newEntry.endTime}, ${newEntry.label})
      `;
    } catch (error) {
      console.error("Failed to sync entry:", error);
    }
    setShowAdd(false);
  };

  const deleteEntry = async (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
    try {
      await sql`DELETE FROM timetable_entries WHERE id = ${id}`;
    } catch (error) {
      console.error("Failed to delete entry:", error);
    }
  };

  const dayEntries = entries
    .filter(e => e.day === selectedDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 text-indigo-500"
          >
            <Clock size={20} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Temporal Structure</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-black text-slate-900 tracking-tight"
          >
            Weekly Protocol
          </motion.h1>
          <p className="text-slate-400 font-light italic max-w-lg">
            "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
          </p>
        </div>
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-3 bg-slate-900 text-white px-6 py-4 rounded-[1.5rem] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 group"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
          <span className="font-bold text-xs uppercase tracking-widest">Add Routine Block</span>
        </motion.button>
      </header>

      {/* Day Selector */}
      <div className="flex overflow-x-auto gap-3 pb-4 custom-scrollbar">
        {DAYS_OF_WEEK.map((day, i) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`flex-shrink-0 px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition-all duration-300 border ${selectedDay === day
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200'
                : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-200 hover:text-indigo-500'
              }`}
          >
            {day}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Timeline View */}
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode='wait'>
            <motion.div
              key={selectedDay}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {dayEntries.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-slate-300 bg-white/50 rounded-[2rem] border border-dashed border-slate-200">
                  <Calendar size={48} className="mb-4 opacity-50" />
                  <p className="text-sm font-bold uppercase tracking-widest">No protocols set for {selectedDay}</p>
                </div>
              ) : (
                dayEntries.map((entry, index) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group bg-white p-6 rounded-[2rem] border border-slate-100 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50 transition-all duration-300 flex items-center justify-between relative overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-500 rounded-l-2xl"></div>
                    <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4 md:gap-8 pl-4">
                      <div className="flex items-center gap-3 w-32 shrink-0">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                          <Clock size={16} />
                        </div>
                        <div>
                          <p className="text-xs font-black text-slate-900">{entry.startTime}</p>
                          <p className="text-[10px] font-bold text-slate-400">{entry.endTime}</p>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-800 text-lg">{entry.label}</h3>
                        <p className="text-xs text-slate-400 font-medium mt-1">Non-negotiable task</p>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="p-3 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </motion.div>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
            <div className="absolute top-0 right-0 p-8 opacity-10"><Clock size={120} /></div>
            <h3 className="text-2xl font-black mb-2">{dayEntries.length} Blocks</h3>
            <p className="text-indigo-200 text-sm font-medium mb-8">Scheduled for {selectedDay}</p>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-indigo-100 text-xs font-bold bg-white/10 p-3 rounded-xl backdrop-blur-md">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>Adhere to the schedule</span>
              </div>
              <div className="flex items-center gap-3 text-indigo-100 text-xs font-bold bg-white/10 p-3 rounded-xl backdrop-blur-md">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>Log completion in Discipline</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[3rem] w-full max-w-md p-10 shadow-2xl relative"
          >
            <button
              onClick={() => setShowAdd(false)}
              className="absolute top-8 right-8 text-slate-300 hover:text-slate-900 transition-colors"
            >
              <X size={24} />
            </button>

            <h2 className="text-2xl font-black text-slate-900 mb-8">New Protocol Block</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Activity Description</label>
                <input
                  type="text"
                  value={newEntry.label}
                  onChange={(e) => setNewEntry({ ...newEntry, label: e.target.value })}
                  placeholder="e.g. Deep Work, Physical Training"
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-800 placeholder:text-slate-300 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Day</label>
                  <div className="relative">
                    <select
                      value={newEntry.day}
                      onChange={(e) => setNewEntry({ ...newEntry, day: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-800 focus:ring-4 focus:ring-indigo-100 transition-all outline-none appearance-none"
                    >
                      {DAYS_OF_WEEK.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                    <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Start Time</label>
                  <div className="relative">
                    <select
                      value={newEntry.startTime}
                      onChange={(e) => setNewEntry({ ...newEntry, startTime: e.target.value })}
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 font-bold text-slate-800 focus:ring-4 focus:ring-indigo-100 transition-all outline-none appearance-none"
                    >
                      {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
                  </div>
                </div>
              </div>

              <button
                onClick={addEntry}
                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 mt-4 active:scale-95"
              >
                Confirm Protocol
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Timetable;
