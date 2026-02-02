
import React, { useState, useEffect } from 'react';
import { UserSettings, PrayerData } from '../types';
import { API_BASE, PRAYER_NAMES } from '../constants';
import { RefreshCw, Loader2, Moon, Sun, Navigation, Clock, Sparkles } from 'lucide-react';

interface HomeProps {
  settings: UserSettings;
}

const Home: React.FC<HomeProps> = ({ settings }) => {
  const [data, setData] = useState<PrayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(new Date());
  const [locationName, setLocationName] = useState({ city: settings.city, country: settings.country });

  const fetchTimings = async (lat?: number, lng?: number) => {
    setLoading(true);
    setError(null);
    try {
      let url = "";
      if (lat && lng) {
        url = `${API_BASE}/timings?latitude=${lat}&longitude=${lng}&method=${settings.method}`;
      } else {
        url = `${API_BASE}/timingsByCity?city=${encodeURIComponent(settings.city)}&country=${encodeURIComponent(settings.country)}&method=${settings.method}`;
      }
      
      const response = await fetch(url);
      const json = await response.json();
      if (json.code === 200) {
        setData(json.data);
        if (lat && lng) {
          const city = json.data.meta.timezone.split('/')[1]?.replace('_', ' ') || "موقعي الحالي";
          setLocationName({ city, country: "" });
        }
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
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchTimings(position.coords.latitude, position.coords.longitude);
        },
        () => fetchTimings()
      );
    } else {
      fetchTimings();
    }
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
    if (target < now) target.setDate(target.getDate() + 1);
    const diff = target.getTime() - now.getTime();
    return {
      h: Math.floor(diff / (1000 * 60 * 60)),
      m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
      s: Math.floor((diff % (1000 * 60)) / 1000)
    };
  };

  const isRamadan = data?.date.hijri.month.number === 9;
  const iftarTime = data?.timings.Maghrib;
  const imsakTime = data?.timings.Imsak;
  const iftarCountdown = getCountdown(iftarTime || '');
  const imsakCountdown = getCountdown(imsakTime || '');

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Hero Section */}
      <section className="relative h-72 md:h-96 rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border border-white/10">
        <img 
          src={isRamadan 
            ? "https://images.unsplash.com/photo-1542662565-7e4b66bae529?auto=format&fit=crop&q=80&w=1200" 
            : "https://images.unsplash.com/photo-1466442929976-97f336a657be?auto=format&fit=crop&q=80&w=1200"} 
          alt="Header Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050a18] via-[#050a18]/40 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
          <div className="text-center md:text-right space-y-1">
            <h2 className="text-4xl md:text-7xl font-amiri font-bold text-white drop-shadow-lg">
              {isRamadan ? "رمضان مبارك" : "أوقات رمضان"}
            </h2>
            <p className="text-[#d4af37] text-xl md:text-3xl font-medium drop-shadow-md">
              {data?.date.hijri.day} {data?.date.hijri.month.ar} {data?.date.hijri.year} هـ
            </p>
          </div>
          <div className="glass px-6 py-4 rounded-[2rem] flex items-center gap-4 text-white border border-white/20 shadow-xl">
            <div className="bg-[#d4af37] p-3 rounded-2xl">
              <Navigation size={22} className="text-[#050a18]" />
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-400 font-bold uppercase tracking-wider">الموقع</div>
              <div className="font-bold text-lg md:text-2xl">{locationName.city}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Ramadan Badge & Highlights */}
      <div className="relative pt-6">
        {!isRamadan && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20">
            <div className="bg-gradient-to-r from-[#d4af37] to-orange-500 text-[#050a18] px-8 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2 border-2 border-white/20 whitespace-nowrap animate-pulse">
              <Sparkles size={20} />
              <span>قريباً في رمضان</span>
            </div>
          </div>
        )}

        {isRamadan ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <HighlightCard title="موعد الإفطار" time={iftarTime || ''} countdown={iftarCountdown} icon={<Moon className="text-[#d4af37]" />} color="#d4af37" />
            <HighlightCard title="موعد الإمساك" time={imsakTime || ''} countdown={imsakCountdown} icon={<Sun className="text-orange-500" />} color="#f97316" />
          </div>
        ) : (
          <div className="glass p-10 md:p-16 rounded-[3rem] border border-[#d4af37]/20 shadow-2xl text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[#d4af37]/5 group-hover:bg-[#d4af37]/10 transition-colors"></div>
            <div className="relative z-10 space-y-6">
               <div className="flex justify-center">
                 <div className="w-20 h-20 bg-[#d4af37]/10 rounded-[2rem] flex items-center justify-center text-[#d4af37] shadow-inner">
                   <Moon size={40} />
                 </div>
              </div>
              <h3 className="text-3xl md:text-5xl font-amiri font-bold text-white">ترقبوا إمساكية الشهر الفضيل</h3>
              <p className="text-gray-400 max-w-xl mx-auto leading-relaxed text-base md:text-xl">
                سيتم تفعيل العداد التنازلي لمواعيد الإفطار والإمساك فور ثبوت رؤية هلال شهر رمضان المبارك لعام 1446هـ.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Prayer Times List */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Clock size={28} className="text-[#d4af37]" />
            مواقيت الصلاة اليوم
          </h3>
          {loading && <Loader2 className="animate-spin text-[#d4af37]" size={24} />}
        </div>
        
        {error ? (
          <div className="bg-red-500/10 border border-red-500/30 p-10 rounded-[2rem] text-center">
            <p className="text-red-200 text-lg">{error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {data && Object.entries(data.timings)
              .filter(([key]) => ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].includes(key))
              .map(([key, value]) => (
                <PrayerCard key={key} name={PRAYER_NAMES[key]} time={value} type={key} isRamadan={isRamadan} />
              ))}
          </div>
        )}
      </section>

      <div className="text-center pt-4">
        <button 
          onClick={() => fetchTimings()}
          className="inline-flex items-center gap-3 text-gray-400 hover:text-[#d4af37] transition-all bg-white/5 hover:bg-white/10 px-8 py-4 rounded-full border border-white/5 text-base font-bold btn-large"
        >
          <RefreshCw size={20} />
          تحديث البيانات
        </button>
      </div>
    </div>
  );
};

const HighlightCard: React.FC<{ title: string, time: string, countdown: any, icon: React.ReactNode, color: string }> = ({ title, time, countdown, icon, color }) => (
  <div className="glass p-8 md:p-10 rounded-[2.5rem] border-r-8 shadow-xl overflow-hidden relative" style={{ borderRightColor: color }}>
    <div className="flex justify-between items-start mb-6">
      <h3 className="text-xl md:text-3xl font-bold text-white flex items-center gap-3">
        {icon} {title}
      </h3>
      <div className="font-mono text-xl md:text-2xl font-bold px-4 py-2 rounded-2xl bg-white/5" style={{ color }}>
        {time}
      </div>
    </div>
    <div className="flex justify-between items-center bg-black/30 p-6 md:p-8 rounded-[2rem]">
      <TimeDigit value={countdown?.h || 0} label="ساعة" color={color} />
      <span className="text-3xl md:text-5xl opacity-30">:</span>
      <TimeDigit value={countdown?.m || 0} label="دقيقة" color={color} />
      <span className="text-3xl md:text-5xl opacity-30">:</span>
      <TimeDigit value={countdown?.s || 0} label="ثانية" color={color} />
    </div>
  </div>
);

const TimeDigit: React.FC<{ value: number; label: string; color: string }> = ({ value, label, color }) => (
  <div className="text-center min-w-[60px] md:min-w-[80px]">
    <div className="text-3xl md:text-5xl font-mono font-bold tabular-nums" style={{ color }}>
      {String(value).padStart(2, '0')}
    </div>
    <div className="text-[10px] md:text-xs text-gray-500 mt-2 font-bold uppercase tracking-widest">{label}</div>
  </div>
);

const PrayerCard: React.FC<{ name: string; time: string; type: string; isRamadan: boolean }> = ({ name, time, type, isRamadan }) => {
  const isSpecial = (type === 'Maghrib' || type === 'Fajr') && isRamadan;
  return (
    <div className={`p-6 md:p-8 rounded-[2rem] border transition-all hover:scale-105 ${
      isSpecial ? 'bg-[#d4af37]/15 border-[#d4af37]/50 shadow-xl ring-2 ring-[#d4af37]/20' : 'glass border-white/10'
    }`}>
      <div className="text-gray-400 text-xs md:text-sm mb-3 md:mb-4 font-bold uppercase tracking-wider">{name}</div>
      <div className={`text-2xl md:text-3xl font-bold font-mono ${isSpecial ? 'text-[#d4af37]' : 'text-white'}`}>
        {time}
      </div>
    </div>
  );
};

export default Home;
