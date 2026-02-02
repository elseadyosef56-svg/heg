
import React, { useState, useEffect } from 'react';
import { UserSettings, PrayerData } from '../types';
import { API_BASE } from '../constants';
import { Printer, ChevronRight, ChevronLeft, Loader2, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarProps { settings: UserSettings; }

const Calendar: React.FC<CalendarProps> = ({ settings }) => {
  const [days, setDays] = useState<PrayerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchCalendar = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = `${API_BASE}/calendarByCity?city=${encodeURIComponent(settings.city)}&country=${encodeURIComponent(settings.country)}&method=${settings.method}&month=${month}&year=${year}`;
      const response = await fetch(url);
      const json = await response.json();
      if (json.code === 200) {
        setDays(json.data);
      } else {
        throw new Error('API Error');
      }
    } catch (err) {
      setError('فشل تحميل التقويم.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, [month, year, settings.city, settings.country]);

  const handlePrint = () => window.print();

  const changeMonth = (dir: number) => {
    let newMonth = month + dir;
    let newYear = year;
    if (newMonth > 12) { newMonth = 1; newYear++; }
    if (newMonth < 1) { newMonth = 12; newYear--; }
    setMonth(newMonth);
    setYear(newYear);
  };

  const isRamadan = days.length > 0 && days[0].date.hijri.month.number === 9;
  const currentMonthName = days.length > 0 ? days[0].date.hijri.month.ar : '';

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-700 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print px-2">
        <h2 className="text-2xl md:text-3xl font-amiri font-bold text-[#d4af37] flex items-center gap-3">
          <CalendarIcon className="hidden md:block" />
          {isRamadan ? `إمساكية رمضان ${year}` : `المواقيت - ${currentMonthName} ${year}`}
        </h2>
        <div className="flex items-center justify-between md:justify-end gap-3 glass p-2 rounded-2xl w-full md:w-auto">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-white/10 rounded-lg"><ChevronRight size={20}/></button>
          <span className="font-bold text-white text-sm md:text-base min-w-[100px] text-center">{currentMonthName} {year}</span>
          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-white/10 rounded-lg"><ChevronLeft size={20}/></button>
          <button onClick={handlePrint} className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#d4af37] text-[#050a18] rounded-xl hover:bg-[#b8962e] transition-all font-bold">
            <Printer size={18} />
            طباعة
          </button>
        </div>
      </div>

      <div className="overflow-hidden glass rounded-3xl border border-white/10 shadow-2xl">
        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <Loader2 className="animate-spin text-[#d4af37]" size={48} />
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-400">{error}</div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-right border-collapse">
                <thead>
                  <tr className="bg-white/5 text-[#d4af37] border-b border-white/10">
                    <th className="p-5 font-bold">اليوم</th>
                    <th className="p-5 font-bold">الهجري</th>
                    <th className="p-5 font-bold text-lg">الميلادي</th>
                    <th className="p-5 font-bold">الفجر</th>
                    <th className="p-5 font-bold">الظهر</th>
                    <th className="p-5 font-bold">العصر</th>
                    <th className="p-5 font-bold text-orange-400">المغرب</th>
                    <th className="p-5 font-bold">العشاء</th>
                  </tr>
                </thead>
                <tbody>
                  {days.map((day, idx) => {
                    const isToday = new Date().toDateString() === new Date(day.date.readable).toDateString();
                    return (
                      <tr key={idx} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${isToday ? 'bg-[#d4af37]/10' : ''}`}>
                        <td className="p-5 whitespace-nowrap font-medium text-white">{day.date.hijri.weekday.ar}</td>
                        <td className="p-5 whitespace-nowrap text-gray-400">{day.date.hijri.day} {day.date.hijri.month.ar}</td>
                        <td className="p-5 whitespace-nowrap text-white font-bold text-lg">{day.date.gregorian.day} {day.date.gregorian.month.en}</td>
                        <td className="p-5 whitespace-nowrap text-[#d4af37] font-mono">{day.timings.Fajr.split(' ')[0]}</td>
                        <td className="p-5 whitespace-nowrap text-gray-400 font-mono">{day.timings.Dhuhr.split(' ')[0]}</td>
                        <td className="p-5 whitespace-nowrap text-gray-400 font-mono">{day.timings.Asr.split(' ')[0]}</td>
                        <td className="p-5 whitespace-nowrap text-orange-400 font-bold font-mono">{day.timings.Maghrib.split(' ')[0]}</td>
                        <td className="p-5 whitespace-nowrap text-gray-400 font-mono">{day.timings.Isha.split(' ')[0]}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-white/5">
              {days.map((day, idx) => {
                const isToday = new Date().toDateString() === new Date(day.date.readable).toDateString();
                return (
                  <div key={idx} className={`p-5 space-y-3 ${isToday ? 'bg-[#d4af37]/10' : ''}`}>
                    <div className="flex justify-between items-center">
                      <div className="text-white font-bold text-lg">{day.date.hijri.weekday.ar} - {day.date.hijri.day} {day.date.hijri.month.ar}</div>
                      <div className="text-[#d4af37] font-black text-xl bg-[#d4af37]/10 px-3 py-1 rounded-lg">
                        {day.date.gregorian.day}
                        <span className="text-[10px] block font-normal opacity-70 leading-none">{day.date.gregorian.month.en}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                      <div className="bg-white/5 p-2 rounded-xl">
                        <div className="text-gray-500 mb-1">الفجر</div>
                        <div className="text-[#d4af37] font-mono font-bold">{day.timings.Fajr.split(' ')[0]}</div>
                      </div>
                      <div className="bg-[#d4af37]/10 p-2 rounded-xl">
                        <div className="text-[#d4af37] mb-1">المغرب</div>
                        <div className="text-[#d4af37] font-mono font-bold">{day.timings.Maghrib.split(' ')[0]}</div>
                      </div>
                      <div className="bg-white/5 p-2 rounded-xl">
                        <div className="text-gray-500 mb-1">العشاء</div>
                        <div className="text-white font-mono font-bold">{day.timings.Isha.split(' ')[0]}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Calendar;
