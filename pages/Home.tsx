
import React, { useState, useEffect } from 'react';
import { UserSettings, PrayerData } from '../types';
import { API_BASE, PRAYER_NAMES, ARAB_COUNTRIES } from '../constants';
import { MapPin, Bell, RefreshCw, Loader2, Moon, Sun, ArrowRightLeft, Clock, CalendarDays } from 'lucide-react';

interface HomeProps {
  settings: UserSettings;
}

const Home: React.FC<HomeProps> = ({ settings }) => {
  const [data, setData] = useState<PrayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());

  const fetchTimings = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `${API_BASE}/timingsByCity?city=${encodeURIComponent(settings.city)}&country=${encodeURIComponent(settings.country)}&method=${settings.method}`;
      const response = await fetch(url);
      const json = await response.json();
      if (json.code === 200) {
        setData(json.data);
      } else {
        throw new Error(json.status);
      }
    } catch (err) {
      setError('فشل تحميل المواقيت. يرجى التحقق من الاتصال.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimings();
  }, [settings.city, settings.country, settings.method]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getCountdown = (targetTimeStr: string) => {
    if (!targetTimeStr) return null;
    const [hours, minutes] = targetTimeStr.split(':').map(Number);
    const target = new Date(now);
    target.setHours(hours, minutes, 0, 0);
    
    if (target < now) {
      target.setDate(target.getDate() + 1);
    }
    
    const diff = target.getTime() - now.getTime();
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { h, m, s };
  };

  const isRamadan = data?.date.hijri.month.number === 9;
  const iftarTime = data?.timings.Maghrib;
  const imsakTime = data?.timings.Imsak;
  const iftarCountdown = getCountdown(iftarTime || '');
  const imsakCountdown = getCountdown(imsakTime || '');
  const countryName = ARAB_COUNTRIES.find(c => c.code === settings.country)?.name || settings.country;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Hero Section Reverted */}
      <section className="relative h-72 md:h-96 rounded-[2rem] overflow-hidden shadow-2xl border border-white/10">
        <img 
          src={isRamadan 
            ? "https://images.unsplash.com/photo-1542662565-7e4b66bae529?auto=format&fit=crop&q=80&w=1200" 
            : "https://images.unsplash.com/photo-1466442929976-97f336a657be?auto=format&fit=crop&q=80&w=1200"} 
          alt="Header Background"
          className="w-full h-full object-cover scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050a18] via-[#050a18]/40 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-right space-y-2">
            <h2 className="text-4xl md:text-6xl font-amiri font-bold text-white drop-shadow-lg">
              {isRamadan ? "رمضان مبارك" : "أوقات رمضان"}
            </h2>
            <p className="text-[#d4af37] text-xl md:text-2xl font-medium drop-shadow-md">
              {data?.date.hijri.day} {data?.date.hijri.month.ar} {data?.date.hijri.year} هـ
            </p>
          </div>
          <div className="glass px-6 py-4 rounded-2xl flex items-center gap-4 text-white border border-white/20">
            <div className="bg-[#d4af37] p-2 rounded-lg">
              <MapPin size={20} className="text-[#050a18]" />
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400">الموقع المختار</div>
              <div className="font-bold text-lg">{settings.city}, {countryName}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Ramadan Highlights Section */}
      {isRamadan ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass p-8 rounded-3xl border-r-8 border-r-[#d4af37] shadow-xl relative overflow-hidden group">
            <div className="absolute -left-10 -top-10 w-32 h-32 bg-[#d4af37]/10 rounded-full blur-3xl group-hover:bg-[#d4af37]/20 transition-all"></div>
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <Moon className="text-[#d4af37]" />
                موعد الإفطار
              </h3>
              <div className="text-[#d4af37] font-mono text-xl font-bold bg-[#d4af37]/10 px-4 py-1 rounded-full">
                {iftarTime}
              </div>
            </div>
            <div className="flex justify-between items-center bg-black/20 p-6 rounded-2xl">
              <TimeDigit value={iftarCountdown?.h || 0} label="ساعة" color="#d4af37" />
              <span className="text-3xl font-bold text-[#d4af37]/40">:</span>
              <TimeDigit value={iftarCountdown?.m || 0} label="دقيقة" color="#d4af37" />
              <span className="text-3xl font-bold text-[#d4af37]/40">:</span>
              <TimeDigit value={iftarCountdown?.s || 0} label="ثانية" color="#d4af37" />
            </div>
          </div>

          <div className="glass p-8 rounded-3xl border-r-8 border-r-orange-500 shadow-xl relative overflow-hidden group">
            <div className="absolute -left-10 -top-10 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-all"></div>
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-white flex items-center gap-3">
                <Sun className="text-orange-500" />
                موعد الإمساك
              </h3>
              <div className="text-orange-500 font-mono text-xl font-bold bg-orange-500/10 px-4 py-1 rounded-full">
                {imsakTime}
              </div>
            </div>
            <div className="flex justify-between items-center bg-black/20 p-6 rounded-2xl">
              <TimeDigit value={imsakCountdown?.h || 0} label="ساعة" color="#f97316" />
              <span className="text-3xl font-bold text-orange-500/40">:</span>
              <TimeDigit value={imsakCountdown?.m || 0} label="دقيقة" color="#f97316" />
              <span className="text-3xl font-bold text-orange-500/40">:</span>
              <TimeDigit value={imsakCountdown?.s || 0} label="ثانية" color="#f97316" />
            </div>
          </div>
        </div>
      ) : (
        <div className="glass p-8 md:p-12 rounded-[2.5rem] border border-[#d4af37]/20 shadow-2xl relative overflow-hidden group text-center">
          <div className="absolute top-6 left-6">
             <span className="bg-[#d4af37] text-[#050a18] text-[10px] md:text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg animate-pulse">
               قريباً في رمضان
             </span>
          </div>
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-[#d4af37]/5 rounded-full blur-3xl"></div>
          <div className="relative z-10 space-y-6">
            <div className="flex justify-center gap-4">
               <div className="w-16 h-16 bg-[#d4af37]/10 rounded-2xl flex items-center justify-center text-[#d4af37] shadow-xl border border-[#d4af37]/20">
                 <Moon size={32} />
               </div>
               <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center text-orange-500 shadow-xl border border-orange-500/20">
                 <Sun size={32} />
               </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-3xl font-amiri font-bold text-white">مواعيد الإفطار والإمساك</h3>
              <p className="text-gray-400 max-w-lg mx-auto leading-relaxed text-lg">
                سيتم تفعيل عدادات الإفطار والإمساك التنازلية تلقائياً فور دخول شهر رمضان المبارك. نسأل الله أن يبلغنا وإياكم الشهر الفضيل.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* All Prayers Section */}
      <section className="pt-4">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-2xl font-bold text-white flex items-center gap-3">
            <RefreshCw size={24} className={`text-[#d4af37] ${loading ? 'animate-spin' : ''}`} />
            مواقيت الصلاة لليوم
          </h3>
        </div>
        
        {loading ? (
          <div className="h-48 flex flex-col items-center justify-center gap-4 glass rounded-3xl">
            <Loader2 className="animate-spin text-[#d4af37]" size={48} />
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 p-8 rounded-3xl text-center">
            <p className="text-red-200 mb-4">{error}</p>
            <button onClick={fetchTimings} className="bg-red-500 hover:bg-red-600 px-6 py-2 rounded-xl text-white font-bold transition-all">تحديث</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {data && Object.entries(data.timings)
              .filter(([key]) => ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].includes(key))
              .map(([key, value]) => (
                <PrayerCard key={key} name={PRAYER_NAMES[key]} time={value} type={key} isRamadan={isRamadan} />
              ))}
          </div>
        )}
      </section>

      <div className="text-center pt-4">
        <a href="#/settings" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#d4af37] transition-all bg-white/5 px-6 py-3 rounded-full border border-white/5">
          <ArrowRightLeft size={16} />
          تعديل الموقع أو طريقة الحساب
        </a>
      </div>
    </div>
  );
};

const TimeDigit: React.FC<{ value: number; label: string; color: string }> = ({ value, label, color }) => (
  <div className="text-center min-w-[60px]">
    <div className="text-4xl md:text-5xl font-mono font-bold tabular-nums" style={{ color }}>
      {String(value).padStart(2, '0')}
    </div>
    <div className="text-[10px] text-gray-500 mt-1 font-bold uppercase tracking-widest">{label}</div>
  </div>
);

const PrayerCard: React.FC<{ name: string; time: string; type: string; isRamadan: boolean }> = ({ name, time, type, isRamadan }) => {
  const isIftar = type === 'Maghrib' && isRamadan;
  const isFajr = type === 'Fajr' && isRamadan;
  return (
    <div className={`p-6 rounded-3xl border transition-all hover:scale-105 ${
      isIftar 
      ? 'bg-gradient-to-br from-[#d4af37]/20 to-transparent border-[#d4af37]/50 shadow-lg shadow-[#d4af37]/10' 
      : isFajr
      ? 'bg-gradient-to-br from-orange-500/20 to-transparent border-orange-500/50 shadow-lg'
      : 'glass border-white/10'
    }`}>
      <div className="text-gray-400 text-xs mb-3 font-medium">{name}</div>
      <div className={`text-2xl font-bold font-mono ${isIftar ? 'text-[#d4af37]' : isFajr ? 'text-orange-500' : 'text-white'}`}>
        {time}
      </div>
    </div>
  );
};

export default Home;
