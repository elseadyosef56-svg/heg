
import React, { useState, useEffect } from 'react';
import { UserSettings, PrayerData } from '../types';
import { API_BASE } from '../constants';
import { Printer, Download, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';

interface CalendarProps { settings: UserSettings; }

const Calendar: React.FC<CalendarProps> = ({ settings }) => {
  const [days, setDays] = useState<any[]>([]);
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
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <h2 className="text-3xl font-amiri font-bold text-[#d4af37]">
          {isRamadan ? `إمساكية رمضان ${year}` : `مواقيت الصلاة - ${currentMonthName} ${year}`}
        </h2>
        <div className="flex items-center gap-3">
          <button onClick={() => changeMonth(-1)} className="p-2 glass rounded-lg hover:bg-white/10 transition-all"><ChevronRight /></button>
          <span className="font-bold text-white px-4 min-w-[120px] text-center">{currentMonthName} {year}</span>
          <button onClick={() => changeMonth(1)} className="p-2 glass rounded-lg hover:bg-white/10 transition-all"><ChevronLeft /></button>
          <div className="w-px h-6 bg-white/10 mx-2"></div>
          <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-2 bg-[#d4af37] text-white rounded-xl hover:bg-[#b8962e] transition-all shadow-lg shadow-[#d4af37]/20">
            <Printer size={18} />
            طباعة
          </button>
        </div>
      </div>

      <div className="print-only hidden text-center mb-8">
        <h1 className="text-4xl font-bold mb-2">{isRamadan ? "إمساكية شهر رمضان المبارك" : "مواقيت الصلاة اليومية"}</h1>
        <p className="text-xl">مدينة {settings.city} - {settings.country}</p>
        <p className="text-sm mt-2">لعام {year} م / {days[0]?.date.hijri.year} هـ</p>
      </div>

      <div className="overflow-x-auto glass rounded-3xl border border-white/10 shadow-2xl">
        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <Loader2 className="animate-spin text-[#d4af37]" size={48} />
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-400">{error}</div>
        ) : (
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-white/5 text-[#d4af37] border-b border-white/10">
                <th className="p-5 font-bold">اليوم</th>
                <th className="p-5 font-bold">التاريخ الهجري</th>
                <th className="p-5 font-bold">الفجر</th>
                <th className="p-5 font-bold">الشروق</th>
                <th className="p-5 font-bold">الظهر</th>
                <th className="p-5 font-bold">العصر</th>
                <th className="p-5 font-bold">{isRamadan ? "المغرب (إفطار)" : "المغرب"}</th>
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
                    <td className="p-5 whitespace-nowrap text-[#d4af37] font-bold font-mono">{day.timings.Fajr.split(' ')[0]}</td>
                    <td className="p-5 whitespace-nowrap text-gray-400 font-mono">{day.timings.Sunrise.split(' ')[0]}</td>
                    <td className="p-5 whitespace-nowrap text-gray-400 font-mono">{day.timings.Dhuhr.split(' ')[0]}</td>
                    <td className="p-5 whitespace-nowrap text-gray-400 font-mono">{day.timings.Asr.split(' ')[0]}</td>
                    <td className="p-5 whitespace-nowrap text-orange-500 font-bold font-mono">{day.timings.Maghrib.split(' ')[0]}</td>
                    <td className="p-5 whitespace-nowrap text-gray-400 font-mono">{day.timings.Isha.split(' ')[0]}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Calendar;
