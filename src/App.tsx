/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, type ReactNode } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Home, Map, User, Users } from 'lucide-react';
import Login from './pages/Login';
import HomePage from './pages/Dashboard';
import Planting from './pages/Planting';
import MapDashboard from './pages/MapDashboard';
import Profile from './pages/Profile';
import Weather from './pages/Weather';
import Iot from './pages/Iot';
import Alerts from './pages/Alerts';
import Notifications from './pages/Notifications';
import Agreement from './pages/Agreement';
import About from './pages/About';
import News from './pages/News';
import Video from './pages/Video';
import { cn } from './lib/utils';
import { User as UserType } from './types';
import { DEMO_USERS } from './mockData';
import { UserContext, useUser } from './UserContext';

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const isGroupRole = user.role === 'GROUP_ADMIN' || user.role === 'NONGKEN_ADMIN' || user.role === 'LAND_COMPANY_ADMIN';

  const tabs = [
    { path: '/home', icon: Home, label: '首页' },
    { path: '/land', icon: Map, label: '土地资源' },
    ...(isGroupRole ? [{ path: '/planting?tab=personnel', icon: Users, label: '人员档案' }] : []),
    { path: '/profile', icon: User, label: '我的' },
  ];

  if (location.pathname === '/login') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 z-50 pb-[env(safe-area-inset-bottom,0px)]">
      <div className="flex justify-around items-center h-16 px-2 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = tab.path.includes('planting')
            ? location.pathname.includes('planting') && location.search.includes('personnel')
            : location.pathname.startsWith(tab.path);
          return (
            <motion.button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={cn(
                "flex flex-col items-center gap-0.5 transition-colors",
                isActive ? "text-blue-700" : "text-slate-400"
              )}
              whileTap={{ scale: 0.95 }}
            >
              <tab.icon className={cn("w-6 h-6", isActive ? "fill-current" : "stroke-[2px]")} />
              <span className={cn("text-[11px]", isActive ? "font-bold" : "font-medium")}>
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}

function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-screen bg-slate-100 font-sans text-slate-800 flex flex-col">
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      <Navigation />
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<UserType>(() => {
    const saved = localStorage.getItem('demoUser');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (DEMO_USERS[parsed.username]) {
          return DEMO_USERS[parsed.username];
        }
      } catch {}
    }
    return DEMO_USERS['farm'];
  });

  const isLoggedIn = !!localStorage.getItem('isLoggedIn');

  const handleLogin = (username: string) => {
    const u = DEMO_USERS[username] || DEMO_USERS['farm'];
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('demoUser', JSON.stringify(u));
    setUser(u);
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('demoUser');
    setUser(DEMO_USERS['farm']);
  };

  const switchRole = (roleKey: string) => {
    const u = DEMO_USERS[roleKey];
    if (u) {
      localStorage.setItem('demoUser', JSON.stringify(u));
      setUser(u);
    }
  };

  return (
    <UserContext.Provider value={{ user, switchRole }}>
      <HashRouter>
        <Routes>
          <Route
            path="/login"
            element={isLoggedIn ? <Navigate to="/home" replace /> : <Login onLogin={handleLogin} />}
          />
          <Route
            path="/*"
            element={
              isLoggedIn ? (
                <MainLayout>
                  <Routes>
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/planting/*" element={<Planting />} />
                    <Route path="/weather" element={<Weather />} />
                    <Route path="/land/*" element={<MapDashboard />} />
                    <Route path="/iot" element={<Iot />} />
                    <Route path="/alerts" element={<Alerts />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/agreement" element={<Agreement />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/news" element={<News />} />
                    <Route path="/news/:id" element={<News />} />
                    <Route path="/video" element={<Video />} />
                    <Route path="/video/:id" element={<Video />} />
                    <Route path="/profile" element={<Profile onLogout={handleLogout} />} />
                    <Route path="/" element={<Navigate to="/home" replace />} />
                  </Routes>
                </MainLayout>
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </HashRouter>
    </UserContext.Provider>
  );
}
