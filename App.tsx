
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';
import About from './pages/About';
import { UserSettings } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { Moon, Calendar as CalendarIcon, Settings as SettingsIcon, Info, Menu, X, Download, Smartphone } from 'lucide-react';

const App: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('ramadan_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const updateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    localStorage.setItem('ramadan_settings', JSON.stringify(newSettings));
  };

  // PWA Install Logic
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js').catch(err => {
          console.log('SW registration failed: ', err);
        });
      });
    }

    // Capture install prompt
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show banner after 3 seconds of usage
      setTimeout(() => setShowInstallBanner(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstallBanner(false);
    }
  };

  return (
    <HashRouter>
      <Layout settings={settings} showInstall={showInstallBanner} onInstall={handleInstallClick} onCloseInstall={() => setShowInstallBanner(false)}>
        <Routes>
          <Route path="/" element={<Home settings={settings} />} />
          <Route path="/calendar" element={<Calendar settings={settings} />} />
          <Route path="/settings" element={<Settings settings={settings} onUpdate={updateSettings} />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

interface LayoutProps {
  children: React.ReactNode;
  settings: UserSettings;
  showInstall: boolean;
  onInstall: () => void;
  onCloseInstall: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, settings, showInstall, onInstall, onCloseInstall }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { path: '/', label: 'الرئيسية', icon: <Moon size={20} /> },
    { path: '/calendar', label: 'التقويم', icon: <CalendarIcon size={20} /> },
    { path: '/settings', label: 'الإعدادات', icon: <SettingsIcon size={20} /> },
    { path: '/about', label: 'حول', icon: <Info size={20} /> },
  ];

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${settings.theme === 'gold' ? 'bg-[#1a140a]' : 'bg-[#050a18]'}`}>
      
      {/* PWA Install Banner (Mobile Only) */}
      {showInstall && (
        <div className="fixed bottom-6 left-4 right-4 z-[100] md:hidden animate-in slide-in-from-bottom-full duration-500">
          <div className="glass bg-[#0a0f1d]/90 border-[#d4af37]/30 p-4 rounded-2xl flex items-center justify-between shadow-2xl border">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-tr from-[#d4af37] to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Smartphone className="text-white" size={24} />
              </div>
              <div className="text-right">
                <div className="text-white font-bold text-sm">تثبيت "أوقات رمضان"</div>
                <div className="text-gray-400 text-[10px]">تصفح أسرع وبدون إنترنت</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={onInstall}
                className="bg-[#d4af37] text-[#050a18] px-4 py-2 rounded-lg text-xs font-bold shadow-lg active:scale-95 transition-all"
              >
                تثبيت الآن
              </button>
              <button onClick={onCloseInstall} className="text-gray-500 p-1">
                <X size={18} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/10 px-4 py-3 md:px-8 flex items-center justify-between no-print">
        <Link to="/" className="flex items-center gap-3" onClick={closeMenu}>
          <div className="w-10 h-10 bg-gradient-to-tr from-[#d4af37] to-[#f97316] rounded-full flex items-center justify-center shadow-lg shadow-orange-500/20">
            <Moon className="text-white fill-white" size={20} />
          </div>
          <h1 className="text-xl md:text-2xl font-amiri font-bold text-[#d4af37]">أوقات رمضان</h1>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
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

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 text-gray-400 hover:text-white active:scale-90 transition-transform"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </header>

      {/* Mobile Sidebar */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden no-print" onClick={closeMenu}>
          <div 
            className="absolute right-0 top-0 h-full w-72 bg-[#0a0f1d] p-6 shadow-2xl transition-transform duration-300 transform translate-x-0"
            onClick={e => e.stopPropagation()}
          >
             <div className="flex flex-col gap-3 mt-12">
              <div className="mb-6 px-4">
                <div className="text-[#d4af37] font-amiri text-2xl font-bold">القائمة الرئيسية</div>
                <div className="h-1 w-12 bg-[#d4af37] mt-2 rounded-full"></div>
              </div>
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={closeMenu}
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                    location.pathname === link.path 
                    ? 'bg-[#d4af37] text-[#050a18] font-bold shadow-lg shadow-[#d4af37]/20' 
                    : 'text-gray-300 hover:bg-white/5 border border-transparent hover:border-white/10'
                  }`}
                >
                  {link.icon}
                  <span className="text-lg">{link.label}</span>
                </Link>
              ))}
              
              <div className="mt-auto pt-10 px-4">
                 <button 
                  onClick={() => { closeMenu(); onInstall(); }}
                  className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 text-gray-300 py-4 rounded-2xl text-sm font-medium"
                 >
                   <Download size={18} /> تثبيت على الهاتف
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 text-center text-gray-500 text-sm no-print">
        <p className="mb-2">© {new Date().getFullYear()} أوقات رمضان</p>
        <p className="text-[10px] opacity-50">دقة المواعيد تعتمد على طريقة الحساب المختارة</p>
      </footer>
    </div>
  );
};

export default App;
