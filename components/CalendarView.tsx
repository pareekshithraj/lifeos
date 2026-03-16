
import React, { useState, useMemo } from 'react';
// Added X to the imports from lucide-react to fix the "Cannot find name 'X'" error
import { Plus, Trash2, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Notebook, Sparkles, X } from 'lucide-react';
import { Activity } from '../types';
import sql from '../db';

const DAYS_OF_WEEK_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CalendarViewProps {
  user_uid: string;
}

const CalendarView: React.FC<CalendarViewProps> = ({ user_uid }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  
  // Fetch Activities
  React.useEffect(() => {
    const fetchActivities = async () => {
      if (!user_uid) return;
      try {
        const results = await sql`
          SELECT * FROM calendar_activities 
          WHERE user_uid = ${user_uid}
        `;
        setActivities(results.map(r => ({
          id: r.id,
          title: r.title,
          time: r.time,
          date: r.date,
          notes: r.notes || ''
        })));
      } catch (error) {
        console.error("Failed to fetch activities:", error);
      }
    };
    fetchActivities();
  }, [user_uid]);
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Modal Form State
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('09:00');
  const [newNotes, setNewNotes] = useState('');

  const viewMonth = currentMonth.getMonth();
  const viewYear = currentMonth.getFullYear();

  const daysInMonth = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const days = [];
    
    // Padding for start of month
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }
    
    // Actual days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(viewYear, viewMonth, i));
    }
    
    return days;
  }, [viewMonth, viewYear]);

  const selectedDateStr = selectedDate.toISOString().split('T')[0];
  const dailyActivities = activities
    .filter(a => a.date === selectedDateStr)
    .sort((a, b) => a.time.localeCompare(b.time));

  const addActivity = async () => {
    if (!newTitle || !user_uid) return;
    const newId = crypto.randomUUID();
    const activity: Activity = {
      id: newId,
      title: newTitle,
      time: newTime,
      date: selectedDateStr,
      notes: newNotes,
    };
    setActivities([...activities, activity]);
    
    try {
      await sql`
        INSERT INTO calendar_activities (id, user_uid, title, time, date, notes)
        VALUES (${newId}, ${user_uid}, ${newTitle}, ${newTime}, ${selectedDateStr}, ${newNotes || null})
      `;
    } catch (error) {
      console.error("Failed to sync activity:", error);
    }

    setNewTitle('');
    setNewNotes('');
    setShowAddModal(false);
  };

  const deleteActivity = async (id: string) => {
    setActivities(activities.filter(a => a.id !== id));
    try {
      await sql`DELETE FROM calendar_activities WHERE id = ${id}`;
    } catch (error) {
      console.error("Failed to delete activity:", error);
    }
  };

  const navigateMonth = (offset: number) => {
    setCurrentMonth(new Date(viewYear, viewMonth + offset, 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date: Date) => {
    return date.getDate() === selectedDate.getDate() && 
           date.getMonth() === selectedDate.getMonth() && 
           date.getFullYear() === selectedDate.getFullYear();
  };

  const hasActivities = (date: Date) => {
    const dStr = date.toISOString().split('T')[0];
    return activities.some(a => a.date === dStr);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-24 animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-slate-400">
            <CalendarIcon size={18} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Temporal Architecture</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">The Calendar</h1>
          <p className="text-slate-500 font-light italic max-w-md">
            "We do not receive a short life, but we make it so."
          </p>
        </div>
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center justify-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold text-sm shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95 group"
        >
          <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
          Plan Intention
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Monthly Grid */}
        <div className="lg:col-span-8 bg-white rounded-[3.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-10 border-b border-slate-50 flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => navigateMonth(-1)}
                className="p-3 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-slate-900"
              >
                <ChevronLeft size={20} />
              </button>
              <button 
                onClick={() => setCurrentMonth(new Date())}
                className="px-5 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
              >
                Current
              </button>
              <button 
                onClick={() => navigateMonth(1)}
                className="p-3 hover:bg-slate-50 rounded-xl transition-all text-slate-400 hover:text-slate-900"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="p-4 md:p-10">
            <div className="grid grid-cols-7 mb-6">
              {DAYS_OF_WEEK_LABELS.map(label => (
                <div key={label} className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-slate-300 py-4">
                  {label}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1 md:gap-4">
              {daysInMonth.map((day, idx) => (
                <div key={idx} className="aspect-square">
                  {day ? (
                    <button
                      onClick={() => setSelectedDate(day)}
                      className={`w-full h-full rounded-2xl md:rounded-[2rem] flex flex-col items-center justify-center relative transition-all duration-300 group
                        ${isSelected(day) 
                          ? 'bg-slate-900 text-white shadow-2xl shadow-slate-300 ring-8 ring-white z-10 scale-105' 
                          : 'bg-white hover:bg-slate-50 text-slate-600 border border-transparent hover:border-slate-100'
                        }`}
                    >
                      <span className={`text-sm md:text-lg font-black ${isToday(day) && !isSelected(day) ? 'text-indigo-600' : ''}`}>
                        {day.getDate()}
                      </span>
                      {hasActivities(day) && (
                        <div className={`absolute bottom-2 md:bottom-4 w-1 h-1 rounded-full ${isSelected(day) ? 'bg-white/40' : 'bg-slate-200'}`} />
                      )}
                      {isToday(day) && !isSelected(day) && (
                        <div className="absolute top-2 right-2 w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
                      )}
                    </button>
                  ) : (
                    <div className="w-full h-full" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selected Day Details */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 text-white rounded-[3.5rem] p-10 shadow-2xl shadow-slate-200">
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Detail View</p>
                <h3 className="text-2xl font-black tracking-tight">
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long' })}
                </h3>
                <p className="text-sm font-light opacity-60">
                   {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                 <Sparkles size={20} className="text-indigo-400" />
              </div>
            </div>

            <div className="space-y-4">
              {dailyActivities.length > 0 ? (
                dailyActivities.map(activity => (
                  <div key={activity.id} className="group bg-white/5 border border-white/10 rounded-[2rem] p-6 hover:bg-white/10 transition-all duration-300 relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2 text-indigo-400">
                        <Clock size={14} />
                        <span className="text-xs font-black tabular-nums">{activity.time}</span>
                      </div>
                      <button 
                        onClick={() => deleteActivity(activity.id)}
                        className="text-white/20 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <h4 className="font-bold text-lg mb-2">{activity.title}</h4>
                    {activity.notes && (
                      <div className="flex gap-2 opacity-50 italic font-light text-xs leading-relaxed">
                        <Notebook size={12} className="shrink-0 mt-0.5" />
                        <p>{activity.notes}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-20 text-center space-y-4 opacity-30 border border-dashed border-white/20 rounded-[3rem]">
                  <CalendarIcon size={32} className="mx-auto" />
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">Tabula Rasa</p>
                </div>
              )}
            </div>

            <button 
              onClick={() => setShowAddModal(true)}
              className="w-full mt-8 py-5 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:bg-indigo-50 transition-all flex items-center justify-center gap-3"
            >
              <Plus size={16} />
              Add Intent
            </button>
          </div>

          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">Foundational Insight</h4>
            <p className="text-slate-600 font-light italic leading-relaxed text-sm">
              "You could leave life right now. Let that determine what you do and say and think." 
            </p>
            <p className="text-[9px] font-black text-slate-300 uppercase mt-4">— Marcus Aurelius</p>
          </div>
        </div>
      </div>

      {/* Add Intention Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-[3.5rem] w-full max-w-md p-12 shadow-2xl animate-in fade-in zoom-in duration-300 border border-white/20">
            <div className="flex justify-between items-start mb-8">
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Plan Intention</h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">For {selectedDate.toLocaleDateString()}</p>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-slate-50 rounded-full transition-colors text-slate-300 hover:text-slate-900"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 block ml-2">Title</label>
                <input 
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="What is the objective?"
                  autoFocus
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 focus:ring-4 focus:ring-slate-100 transition-all font-bold text-slate-700"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 block ml-2">Temporal Point</label>
                <div className="relative">
                  <Clock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                  <input 
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full bg-slate-50 border-none rounded-2xl pl-16 pr-6 py-4 focus:ring-4 focus:ring-slate-100 transition-all font-mono font-bold text-slate-700"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 block ml-2">Reflections / Notes</label>
                <textarea 
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="Additional context or boundaries..."
                  rows={3}
                  className="w-full bg-slate-50 border-none rounded-2xl px-6 py-5 focus:ring-4 focus:ring-slate-100 transition-all italic font-light text-slate-600 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-12">
              <button 
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-5 rounded-2xl text-slate-400 hover:bg-slate-50 transition-colors font-bold text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={addActivity}
                className="flex-1 bg-slate-900 text-white px-4 py-5 rounded-2xl hover:bg-slate-800 transition-all font-bold text-sm shadow-xl shadow-slate-200"
              >
                Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
