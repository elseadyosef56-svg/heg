import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';
import About from './pages/About';
import Quran from './pages/Quran';
import AIChat from './pages/AIChat';
import LiveSession from './pages/LiveSession';
import Dua from './pages/Dua';
import { UserSettings } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { Moon, Calendar as CalendarIcon, Settings as SettingsIcon, BookOpen, MessageCircle, Mic, Heart, Menu, X } from 'lucide-react';

const App: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('ramadan_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const updateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    localStorage.setItem('ramadan_settings', JSON.stringify(newSettings));
  };

  return (
    <HashRouter>
      <Layout settings={settings}>
        <Routes>
          <Route path="/" element={<Home settings={settings} />} />
          <Route path="/calendar" element={<Calendar settings={settings} />} />
          <Route path="/quran" element={<Quran settings={settings} onUpdate={updateSettings} />} />
          <Route path="/dua" element={<Dua />} />
          <Route path="/ai-chat" element={<AIChat />} />
          <Route path="/live" element={<LiveSession />} />
          <Route path="/settings" element={<Settings settings={settings} onUpdate={updateSettings} />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

const Layout: React.FC<{ children: React.ReactNode; settings: UserSettings }> = ({ children, settings }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'الرئيسية', icon: <Moon size={20} /> },
    { path: '/calendar', label: 'التقويم', icon: <CalendarIcon size={20} /> },
    { path: '/quran', label: 'المصحف', icon: <BookOpen size={20} /> },
    { path: '/dua', label: 'الأدعية', icon: <Heart size={20} /> },
    { path: '/ai-chat', label: 'المساعد', icon: <MessageCircle size={20} /> },
    { path: '/live', label: 'صوت مباشر', icon: <Mic size={20} /> },
    { path: '/settings', label: 'الإعدادات', icon: <SettingsIcon size={20} /> },
  ];

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${settings.theme === 'gold' ? 'bg-[#1a140a]' : 'bg-[#050a18]'}`}>
      <header className="sticky top-0 z-50 glass border-b border-white/10 px-4 py-3 md:px-8 flex items-center justify-between no-print">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-[#d4af37] to-[#f97316] rounded-full flex items-center justify-center shadow-lg">
            <Moon className="text-white fill-white" size={20} />
          </div>
          <h1 className="text-xl font-amiri font-bold text-[#d4af37]">أوقات رمضان</h1>
        </Link>

        <nav className="hidden md:flex gap-1 lg:gap-3">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all text-xs lg:text-sm ${
                location.pathname === link.path 
                ? 'bg-[#d4af37]/20 text-[#d4af37]' 
                : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.icon}
              <span className="font-medium">{link.label}</span>
            </Link>
          ))}
        </nav>

        <button className="md:hidden p-2 text-gray-400" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </header>

      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md md:hidden" onClick={() => setIsMenuOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-72 bg-[#0a0f1d] p-6 shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
             <div className="flex justify-between items-center mb-8">
               <span className="text-[#d4af37] font-bold font-amiri text-xl">القائمة</span>
               <button onClick={() => setIsMenuOpen(false)} className="text-gray-400 p-2"><X size={24} /></button>
             </div>
             <div className="flex flex-col gap-2 overflow-y-auto">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-colors ${
                    location.pathname === link.path ? 'bg-[#d4af37] text-[#050a18] font-bold shadow-lg' : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  {link.icon}
                  <span className="text-lg">{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        {children}
      </main>

      <footer className="py-8 border-t border-white/5 text-center text-gray-500 text-xs opacity-50">
        © {new Date().getFullYear()} أوقات رمضان - مدعوم بالذكاء الاصطناعي
      </footer>
    </div>
  );
};

export default App;