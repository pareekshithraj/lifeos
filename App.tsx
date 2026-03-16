
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CalendarView from './components/CalendarView';
import Discipline from './components/Discipline';
import Timetable from './components/Timetable';
import Stopwatch from './components/Stopwatch';
import Finance from './components/Finance';
import Settings from './components/Settings';
import Profile from './components/Profile';
import Reflections from './components/Reflections';
import LifeClock from './components/LifeClock';
import Social from './components/Social';
import Leaderboard from './components/Leaderboard';
import StoicGuidance from './components/StoicGuidance';
import Landing from './components/Landing';
import ControlMatrix from './components/ControlMatrix';
import SovereignAvatar from './components/SovereignAvatar';
import LoginView from './components/LoginView';
import sql from './db';
import { Shield, Crown, Sparkles } from 'lucide-react';

const HeaderActions: React.FC<{ avatar: string | null; name: string; plan: string; onLogout: () => void }> = ({ avatar, name, plan, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isProfileActive = location.pathname === '/profile';

  const getPlanBadge = () => {
    switch (plan.toLowerCase()) {
      case 'sage':
        return (
          <div className="flex items-center gap-1.5 md:gap-2 bg-amber-50 border border-amber-200 px-3 md:px-4 py-1.5 md:py-2 rounded-2xl shadow-sm animate-pulse">
            <Crown size={12} className="text-amber-600 md:size-[14px]" />
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-amber-700">Sage</span>
          </div>
        );
      case 'architect':
        return (
          <div className="flex items-center gap-1.5 md:gap-2 bg-indigo-50 border border-indigo-200 px-3 md:px-4 py-1.5 md:py-2 rounded-2xl shadow-sm">
            <Sparkles size={12} className="text-indigo-600 md:size-[14px]" />
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-indigo-700">Architect</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 md:gap-2 bg-slate-50 border border-slate-200 px-3 md:px-4 py-1.5 md:py-2 rounded-2xl shadow-sm opacity-60">
            <Shield size={12} className="text-slate-400 md:size-[14px]" />
            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-500">Disciple</span>
          </div>
        );
    }
  };

  return (
    <div className="fixed top-4 right-4 md:absolute md:top-8 md:right-8 z-50 flex items-center gap-3 md:gap-6">
      {getPlanBadge()}
      <SovereignAvatar
        name={name}
        avatar={avatar}
        size="md"
        plan={plan}
        active={isProfileActive}
        onClick={() => navigate('/profile')}
      />
      <button
        onClick={onLogout}
        className="hidden md:block text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest"
      >
        Logout
      </button>
    </div>
  );
};

const AppContent: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [theme, setTheme] = useState('slate');
  const [backgroundStyle, setBackgroundStyle] = useState<string>('');

  const [profileData, setProfileData] = useState({
    uid: '',
    name: 'Author',
    identity: 'The Intentional Architect',
    mission: 'To cultivate a mind that remains undisturbed by external chaos.',
    avatar: null as string | null,
    birthDate: '1995-04-26',
    followingCount: 12,
    followersCount: 842,
    plan: 'Disciple'
  });

  useEffect(() => {
    document.body.className = `theme-${theme} bg-slate-50 text-slate-900 transition-colors duration-700`;
  }, [theme]);

  // Session Listener
  useEffect(() => {
    const session = localStorage.getItem('life_os_session');
    if (session) {
      try {
        const user = JSON.parse(session);
        setProfileData({
          uid: user.uid,
          name: user.name || 'Sovereign Soul',
          identity: user.identity || '',
          mission: user.mission || '',
          avatar: user.avatar || null,
          plan: user.plan || 'Disciple'
        });
        setIsAuthenticated(true);
      } catch (e) {
        console.error("Failed to parse session", e);
      }
    }
  }, []);

  // Listen for Electron Deep Links
  useEffect(() => {
    if ((window as any).electron) {
      (window as any).electron.onDeepLink((url: string) => {
        console.log("Deep Link Received:", url);
      });
    }
  }, []);

  const updateProfile = async (newData: Partial<typeof profileData>) => {
    const updated = { ...profileData, ...newData };
    setProfileData(updated);
    
    // Cloud Sync
    if (updated.uid) {
      try {
        await sql`
          UPDATE users 
          SET name = ${updated.name}, 
              identity = ${updated.identity}, 
              mission = ${updated.mission}, 
              avatar = ${updated.avatar}, 
              plan = ${updated.plan} 
          WHERE uid = ${updated.uid}
        `;
        localStorage.setItem('life_os_session', JSON.stringify(updated));
      } catch (error) {
        console.error("Failed to sync profile:", error);
      }
    }
  };

  const handleLogin = (user: any) => {
    const fullUser = {
      uid: user.uid,
      name: user.name || 'Sovereign Soul',
      identity: user.identity || '',
      mission: user.mission || '',
      avatar: user.avatar || null,
      plan: user.plan || 'Disciple'
    };
    setProfileData(fullUser);
    setIsAuthenticated(true);
    localStorage.setItem('life_os_session', JSON.stringify(fullUser));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setProfileData(prev => ({ ...prev, name: 'Author', avatar: null }));
    localStorage.removeItem('life_os_session');
  };

  if (!isAuthenticated) {
    // Electron Flow: Dedicated Login View (No Marketing)
    if ((window as any).electron) {
      return <LoginView onSuccess={handleLogin} />;
    }
    // Web Flow: Marketing Landing Page
    return <Landing onInitiate={handleLogin} />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen w-full bg-[#fcfcfc] overflow-hidden text-slate-900 selection:bg-slate-900 selection:text-white relative">
      {/* Dynamic Background Layer */}
      <div
        className="absolute inset-0 z-0 transition-all duration-1000 ease-in-out pointer-events-none"
        style={{
          background: backgroundStyle || 'transparent',
          opacity: backgroundStyle ? 1 : 0
        }}
      />

      <div className="relative z-10 flex flex-col md:flex-row w-full h-full overflow-hidden">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <main className="flex-1 flex flex-col transition-all duration-300 relative overflow-y-auto custom-scrollbar pb-24 md:pb-0 animate-in fade-in duration-1000">
          <HeaderActions
            avatar={profileData.avatar}
            name={profileData.name}
            plan={profileData.plan}
            onLogout={handleLogout}
          />

          <div className="p-6 md:p-12 lg:p-16 w-full max-w-screen-2xl mx-auto">
            <Routes>
              <Route path="/" element={<Dashboard user_uid={profileData.uid} currentPlan={profileData.plan} birthDate={profileData.birthDate} />} />
              <Route path="/dashboard" element={<Dashboard user_uid={profileData.uid} currentPlan={profileData.plan} birthDate={profileData.birthDate} />} />
              <Route path="/guidance" element={<StoicGuidance user_uid={profileData.uid} currentPlan={profileData.plan} />} />
              <Route path="/control-matrix" element={<ControlMatrix />} />
              <Route
                path="/social"
                element={
                  <Social
                    user_uid={profileData.uid}
                    onFollowChange={(count) => updateProfile({ followingCount: profileData.followingCount + count })}
                    currentFollowingCount={profileData.followingCount}
                    currentUserName={profileData.name}
                    currentUserAvatar={profileData.avatar}
                    currentUserIdentity={profileData.identity}
                  />
                }
              />
              <Route path="/leaderboard" element={<Leaderboard user_uid={profileData.uid} />} />
              <Route path="/calendar" element={<CalendarView user_uid={profileData.uid} />} />
              <Route path="/discipline" element={<Discipline user_uid={profileData.uid} />} />
              <Route path="/timetable" element={<Timetable user_uid={profileData.uid} />} />
              <Route path="/stopwatch" element={<Stopwatch user_uid={profileData.uid} />} />
              <Route path="/finance" element={<Finance user_uid={profileData.uid} />} />
              <Route path="/reflections" element={<Reflections user_uid={profileData.uid} currentPlan={profileData.plan} />} />
              <Route path="/life-clock" element={<LifeClock birthDate={profileData.birthDate} />} />
              <Route
                path="/profile"
                element={<Profile data={profileData} onUpdate={updateProfile} />}
              />
              <Route
                path="/settings"
                element={
                  <Settings
                    onThemeChange={setTheme}
                    currentTheme={theme}
                    currentPlan={profileData.plan}
                    onPlanChange={(plan) => updateProfile({ plan })}
                    onBackgroundChange={setBackgroundStyle}
                    currentBackground={backgroundStyle}
                  />
                }
              />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
