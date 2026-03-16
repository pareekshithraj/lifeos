
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Settings, Command, Sparkles } from 'lucide-react';
import { NAVIGATION_ITEMS } from '../constants';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, onToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = location.pathname.substring(1) || 'dashboard';

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={`hidden md:flex glass-panel border-r border-slate-100 flex-col transition-all duration-700 ease-in-out z-50 h-screen sticky top-0 ${
          isCollapsed ? 'w-24' : 'w-72'
        }`}
      >
        <div className="p-8 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-900 rounded-[1.2rem] flex items-center justify-center text-white shadow-xl shadow-slate-200">
                <Command size={22} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <h1 className="text-xl font-black tracking-tighter text-slate-900 leading-none">
                  Life OS
                </h1>
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-slate-400 mt-1">Sovereign Edition</span>
              </div>
            </div>
          )}
          <button 
            onClick={onToggle}
            className={`p-2 hover:bg-slate-100 rounded-xl text-slate-300 transition-all ${isCollapsed ? 'mx-auto' : 'ml-auto'}`}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-2 custom-scrollbar overflow-y-auto overflow-x-hidden">
          {NAVIGATION_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => navigate(`/${item.id}`)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 group ${
                activeTab === item.id 
                  ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 translate-x-1' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              <div className={`transition-transform duration-300 group-hover:scale-110 ${activeTab === item.id ? 'text-white' : ''}`}>
                {React.cloneElement(item.icon as React.ReactElement<any>, { size: 18 })}
              </div>
              {!isCollapsed && (
                <span className="font-bold tracking-tight text-sm flex-1 text-left">{item.label}</span>
              )}
              {!isCollapsed && activeTab === item.id && (
                <div className="w-1.5 h-1.5 rounded-full bg-white opacity-40"></div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-100">
          <button 
            onClick={() => navigate('/settings')}
            className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
              activeTab === 'settings' 
                ? 'bg-slate-100 text-slate-900' 
                : 'text-slate-300 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Settings size={18} />
            {!isCollapsed && <span className="font-bold tracking-tight text-[10px] uppercase tracking-[0.2em]">Preferences</span>}
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 h-16 glass-panel rounded-3xl border border-white/40 shadow-2xl z-[100] flex items-center justify-around px-2 backdrop-blur-3xl">
        {NAVIGATION_ITEMS.slice(0, 5).map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(`/${item.id}`)}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 ${
              activeTab === item.id 
                ? 'bg-slate-900 text-white shadow-lg' 
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {React.cloneElement(item.icon as React.ReactElement<any>, { size: 18 })}
          </button>
        ))}
        <button
          onClick={() => navigate('/settings')}
          className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all ${
            activeTab === 'settings' 
              ? 'bg-slate-900 text-white shadow-lg' 
              : 'text-slate-400'
          }`}
        >
          <Settings size={18} />
        </button>
      </nav>
    </>
  );
};

export default Sidebar;
