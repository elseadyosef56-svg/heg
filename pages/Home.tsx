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
        (position) => fetchTimings(position.coords.latitude, position.coords.longitude),
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
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700 pb-12">
      <section className="relative h-64 md:h-96 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10">
        <img 
          src={isRamadan 
            ? "https://images.unsplash.com/photo-1542662565-7e4b66bae529?auto=format&fit=crop&q=80&w=1200" 
            : "https://images.unsplash.com/photo-1466442929976-97f336a657be?auto=format&fit=crop&q=80&w=1200"} 
          alt="Header Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050a18] via-[#050a18]/40 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-right">
            <h2 className="text-3xl md:text-7xl font-amiri font-bold text-white drop-shadow-lg">
              {isRamadan ? "رمضان مبارك" : "أوقات رمضان"}
            </h2>
            <p className="text-[#d4af37] text-lg md:text-3xl font-medium mt-1">
              {data?.date.hijri.day} {data?.date.hijri.month.ar} {data?.date.hijri.year} هـ
            </p>
          </div>
          <div className="glass px-6 py-4 rounded-[2rem] flex items-center gap-4 text-white border border-white/20">
            <div className="bg-[#d4af37] p-2 md:p-3 rounded-2xl">
              <Navigation size={22} className="text-[#050a18]" />
            </div>
            <div className="text-right">
              <div className="text-[10px] text-gray-400 font-bold uppercase">الموقع</div>
              <div className="font-bold text-base md:text-2xl">{locationName.city}</div>
            </div>
          </div>
        </div>
      </section>

      {isRamadan ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <HighlightCard title="موعد الإفطار" time={iftarTime || ''} countdown={iftarCountdown} icon={<Moon className="text-[#d4af37]" />} color="#d4af37" />
          <HighlightCard title="موعد الإمساك" time={imsakTime || ''} countdown={imsakCountdown} icon={<Sun className="text-orange-500" />} color="#f97316" />
        </div>
      ) : (
        <div className="glass p-10 rounded-[3rem] border border-[#d4af37]/20 text-center space-y-4">
           <div className="flex justify-center"><Moon className="text-[#d4af37] w-12 h-12" /></div>
           <h3 className="text-2xl md:text-4xl font-amiri font-bold">ترقبوا إمساكية الشهر الفضيل</h3>
           <p className="text-gray-400 max-w-lg mx-auto">سيتم تفعيل العداد التنازلي لمواعيد الإفطار والإمساك فور ثبوت رؤية هلال شهر رمضان المبارك.</p>
        </div>
      )}

      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-2xl font-bold flex items-center gap-3">
            <Clock size={28} className="text-[#d4af37]" />
            مواقيت الصلاة
          </h3>
          {loading && <Loader2 className="animate-spin text-[#d4af37]" />}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {data && Object.entries(data.timings)
            .filter(([key]) => ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'].includes(key))
            .map(([key, value]) => (
              <div key={key} className={`p-6 rounded-[2rem] border glass text-center ${key === 'Maghrib' && isRamadan ? 'border-[#d4af37]/50 ring-1 ring-[#d4af37]/20 bg-[#d4af37]/10' : 'border-white/10'}`}>
                <div className="text-gray-500 text-xs mb-2 font-bold uppercase">{PRAYER_NAMES[key]}</div>
                <div className={`text-xl md:text-2xl font-bold font-mono ${key === 'Maghrib' ? 'text-[#d4af37]' : 'text-white'}`}>{value}</div>
              </div>
            ))}
        </div>
      </section>

      <div className="text-center pt-4">
        <button onClick={() => fetchTimings()} className="bg-white/5 hover:bg-white/10 text-gray-400 px-8 py-4 rounded-full border border-white/5 flex items-center gap-2 mx-auto transition-all">
          <RefreshCw size={20} />
          تحديث المواقيت
        </button>
      </div>
    </div>
  );
};

const HighlightCard: React.FC<{ title: string, time: string, countdown: any, icon: React.ReactNode, color: string }> = ({ title, time, countdown, icon, color }) => (
  <div className="glass p-8 rounded-[2.5rem] border-r-8 shadow-xl" style={{ borderRightColor: color }}>
    <div className="flex justify-between items-center mb-6">
      <h3 className="text-xl md:text-2xl font-bold flex items-center gap-3">{icon} {title}</h3>
      <div className="font-mono text-xl font-bold px-4 py-2 rounded-2xl bg-white/5" style={{ color }}>{time}</div>
    </div>
    <div className="flex justify-between items-center bg-black/20 p-6 rounded-[2rem]">
      <TimeBox value={countdown?.h || 0} label="ساعة" color={color} />
      <span className="text-2xl opacity-30">:</span>
      <TimeBox value={countdown?.m || 0} label="دقيقة" color={color} />
      <span className="text-2xl opacity-30">:</span>
      <TimeBox value={countdown?.s || 0} label="ثانية" color={color} />
    </div>
  </div>
);

const TimeBox: React.FC<{ value: number, label: string, color: string }> = ({ value, label, color }) => (
  <div className="text-center">
    <div className="text-3xl font-mono font-bold" style={{ color }}>{String(value).padStart(2, '0')}</div>
    <div className="text-[10px] text-gray-500 mt-1 uppercase">{label}</div>
  </div>
);

export default Home;