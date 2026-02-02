
import React, { useState, useEffect } from 'react';
import { UserSettings } from '../types';
import { CALCULATION_METHODS, DEFAULT_SETTINGS, ARAB_COUNTRIES } from '../constants';
import { Save, RotateCcw, ShieldCheck, Moon, Sun, Bell, Globe, MapPin } from 'lucide-react';

interface SettingsProps {
  settings: UserSettings;
  onUpdate: (settings: UserSettings) => void;
}

const Settings: React.FC<SettingsProps> = ({ settings, onUpdate }) => {
  const [selectedCountryObj, setSelectedCountryObj] = useState(() => 
    ARAB_COUNTRIES.find(c => c.code === settings.country) || ARAB_COUNTRIES[0]
  );

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const countryCode = e.target.value;
    const countryObj = ARAB_COUNTRIES.find(c => c.code === countryCode);
    if (countryObj) {
      setSelectedCountryObj(countryObj);
      onUpdate({ 
        ...settings, 
        country: countryCode, 
        city: countryObj.cities[0] // تعيين أول مدينة تلقائياً عند تغيير الدولة
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    onUpdate({ ...settings, [name]: val });
  };

  // Fixed type definition to accept both Input and Select elements
  const handleNumericChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    onUpdate({ ...settings, [e.target.name]: parseInt(e.target.value) || 0 });
  };

  const resetSettings = () => {
    if (confirm('هل أنت متأكد من إعادة ضبط كافة الإعدادات؟')) {
      onUpdate(DEFAULT_SETTINGS);
      setSelectedCountryObj(ARAB_COUNTRIES.find(c => c.code === DEFAULT_SETTINGS.country) || ARAB_COUNTRIES[0]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-top-4 duration-700 pb-12">
      <h2 className="text-3xl font-amiri font-bold text-[#d4af37] mb-8 text-center md:text-right">إعدادات التطبيق</h2>

      {/* Location Section */}
      <section className="glass p-8 rounded-3xl border border-white/10 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="p-2 bg-[#d4af37]/20 text-[#d4af37] rounded-xl"><Globe size={22} /></span>
          اختيار الدولة والمدينة
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-gray-400 text-sm font-medium flex items-center gap-2">
              <Globe size={14} /> الدولة العربية
            </label>
            <div className="relative">
              <select 
                name="country"
                value={settings.country}
                onChange={handleCountryChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#d4af37] outline-none transition-all appearance-none"
              >
                {ARAB_COUNTRIES.map(country => (
                  <option key={country.code} value={country.code} className="bg-[#0a0f1d]">
                    {country.name}
                  </option>
                ))}
              </select>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                ▼
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-gray-400 text-sm font-medium flex items-center gap-2">
              <MapPin size={14} /> المدينة
            </label>
            <div className="relative">
              <select 
                name="city"
                value={settings.city}
                onChange={handleChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#d4af37] outline-none transition-all appearance-none"
              >
                {selectedCountryObj.cities.map(city => (
                  <option key={city} value={city} className="bg-[#0a0f1d]">
                    {city}
                  </option>
                ))}
              </select>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                ▼
              </div>
            </div>
          </div>
        </div>
        <p className="mt-4 text-xs text-gray-500 italic">* إذا لم تجد مدينتك، يرجى اختيار أقرب مدينة رئيسية إليك.</p>
      </section>

      {/* Calculation Method */}
      <section className="glass p-8 rounded-3xl border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="p-2 bg-purple-500/20 text-purple-500 rounded-xl"><Save size={22} /></span>
          طريقة حساب المواقيت
        </h3>
        <div className="space-y-4">
          <select 
            name="method"
            value={settings.method}
            onChange={handleNumericChange}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-[#d4af37] outline-none appearance-none"
          >
            {CALCULATION_METHODS.map(m => (
              <option key={m.id} value={m.id} className="bg-[#0a0f1d]">{m.name}</option>
            ))}
          </select>
          <p className="text-gray-400 text-sm px-1">نوصي باستخدام "جامعة أم القرى" للسعودية، و"الهيئة المصرية" لمصر.</p>
        </div>
      </section>

      {/* Notifications Section */}
      <section className="glass p-8 rounded-3xl border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="p-2 bg-yellow-500/20 text-yellow-500 rounded-xl"><Bell size={22} /></span>
          تنبيهات رمضان (الإفطار والإمساك)
        </h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5">
            <div>
              <div className="text-white font-bold text-lg">تنبيه الإفطار</div>
              <div className="text-gray-400 text-sm">إرسال إشعار عند حلول موعد المغرب</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="notificationIftar" checked={settings.notificationIftar} onChange={handleChange} className="sr-only peer" />
              <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#d4af37]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/5">
            <div>
              <div className="text-white font-bold text-lg">تنبيه الإمساك</div>
              <div className="text-gray-400 text-sm">إرسال إشعار قبل الفجر بوقت كافٍ</div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="notificationImsak" checked={settings.notificationImsak} onChange={handleChange} className="sr-only peer" />
              <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#d4af37]"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-gray-400 text-sm">تنبيه الإفطار بـ (دقائق)</label>
              <input 
                type="number"
                name="minutesBeforeIftar"
                value={settings.minutesBeforeIftar}
                onChange={handleNumericChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#d4af37]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-gray-400 text-sm">تنبيه الإمساك بـ (دقائق)</label>
              <input 
                type="number"
                name="minutesBeforeImsak"
                value={settings.minutesBeforeImsak}
                onChange={handleNumericChange}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Theme Selection */}
      <section className="glass p-8 rounded-3xl border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="p-2 bg-orange-500/20 text-orange-500 rounded-xl"><Sun size={22} /></span>
          المظهر والسمات
        </h3>
        <div className="flex gap-4">
          <button 
            onClick={() => onUpdate({ ...settings, theme: 'dark' })}
            className={`flex-1 p-5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-3 ${settings.theme === 'dark' ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]' : 'border-white/10 text-gray-400 hover:bg-white/5'}`}
          >
            <Moon size={24} /> 
            <span className="font-bold text-sm">الأزرق الداكن</span>
          </button>
          <button 
            onClick={() => onUpdate({ ...settings, theme: 'gold' })}
            className={`flex-1 p-5 rounded-2xl border transition-all flex flex-col items-center justify-center gap-3 ${settings.theme === 'gold' ? 'border-[#d4af37] bg-[#d4af37]/10 text-[#d4af37]' : 'border-white/10 text-gray-400 hover:bg-white/5'}`}
          >
            <Sun size={24} /> 
            <span className="font-bold text-sm">الذهبي الفاخر</span>
          </button>
        </div>
      </section>

      <div className="flex flex-col md:flex-row gap-4 pt-8">
        <button 
          onClick={() => alert('تم حفظ الإعدادات بنجاح!')}
          className="flex-1 bg-[#d4af37] text-white py-5 rounded-2xl font-bold shadow-lg shadow-[#d4af37]/20 hover:scale-[1.01] active:scale-95 transition-all text-lg"
        >
          حفظ كافة التغييرات
        </button>
        <button 
          onClick={resetSettings}
          className="bg-white/5 text-gray-400 py-5 px-8 rounded-2xl font-bold hover:bg-red-500/10 hover:text-red-500 transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw size={18} /> إعادة ضبط
        </button>
      </div>
    </div>
  );
};

export default Settings;
