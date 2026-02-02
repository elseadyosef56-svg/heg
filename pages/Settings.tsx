
import React, { useState } from 'react';
import { UserSettings } from '../types';
import { CALCULATION_METHODS, DEFAULT_SETTINGS, ARAB_COUNTRIES, ADHAN_SOUNDS } from '../constants';
import { Save, RotateCcw, Bell, Globe, MapPin, Volume2, Music, Calculator } from 'lucide-react';

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
      onUpdate({ ...settings, country: countryCode, city: countryObj.cities[0] });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : (type === 'number' ? parseInt(value) : value);
    onUpdate({ ...settings, [name]: val });
  };

  const handleAdhanChange = (name: string, value: any) => {
    onUpdate({ ...settings, adhanSettings: { ...settings.adhanSettings, [name]: value } });
  };

  const resetSettings = () => {
    if (confirm('هل تريد حقاً إعادة ضبط كافة الإعدادات؟')) onUpdate(DEFAULT_SETTINGS);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-top-4 duration-700 pb-20">
      <h2 className="text-3xl font-amiri font-bold text-[#d4af37] text-center">إعدادات التطبيق</h2>

      <section className="glass p-8 rounded-3xl border border-white/10 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="p-2 bg-[#d4af37]/20 text-[#d4af37] rounded-xl"><Globe size={22} /></span>
          الموقع الجغرافي
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="text-gray-400 text-sm">الدولة</label>
            <select name="country" value={settings.country} onChange={handleCountryChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#d4af37] transition-all">
              {ARAB_COUNTRIES.map(c => <option key={c.code} value={c.code} className="bg-[#0a0f1d]">{c.name}</option>)}
            </select>
          </div>
          <div className="space-y-3">
            <label className="text-gray-400 text-sm">المدينة</label>
            <select name="city" value={settings.city} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#d4af37] transition-all">
              {selectedCountryObj.cities.map(c => <option key={c} value={c} className="bg-[#0a0f1d]">{c}</option>)}
            </select>
          </div>
        </div>
        
        <div className="mt-6 space-y-3">
          <label className="text-gray-400 text-sm flex items-center gap-2"><Calculator size={14}/> طريقة الحساب</label>
          <select 
            name="method" 
            value={settings.method} 
            onChange={handleChange} 
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#d4af37] transition-all"
          >
            {CALCULATION_METHODS.map(m => <option key={m.id} value={m.id} className="bg-[#0a0f1d]">{m.name}</option>)}
          </select>
        </div>
      </section>

      {/* صوت الأذان */}
      <section className="glass p-8 rounded-3xl border border-white/10 shadow-xl">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="p-2 bg-blue-500/20 text-blue-500 rounded-xl"><Volume2 size={22} /></span>
          إعدادات صوت الأذان
        </h3>
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
            <div className="text-white font-bold text-sm md:text-base">تفعيل صوت الأذان عند الموعد</div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={settings.adhanSettings.enabled} onChange={(e) => handleAdhanChange('enabled', e.target.checked)} className="sr-only peer" />
              <div className="w-14 h-7 bg-gray-700 rounded-full peer peer-checked:bg-[#d4af37] after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-full"></div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-gray-400 text-sm flex items-center gap-2"><Music size={14}/> صوت الأذان</label>
              <select 
                value={settings.adhanSettings.soundId} 
                onChange={(e) => handleAdhanChange('soundId', e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#d4af37]"
              >
                {ADHAN_SOUNDS.map(s => <option key={s.id} value={s.id} className="bg-[#0a0f1d]">{s.name}</option>)}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-gray-400 text-sm flex items-center gap-2"><Volume2 size={14}/> مستوى الصوت</label>
              <input 
                type="range" 
                min="0" max="1" step="0.1" 
                value={settings.adhanSettings.volume} 
                onChange={(e) => handleAdhanChange('volume', parseFloat(e.target.value))}
                className="w-full accent-[#d4af37] mt-3" 
              />
            </div>
          </div>
        </div>
      </section>

      <section className="glass p-8 rounded-3xl border border-white/10">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="p-2 bg-yellow-500/20 text-yellow-500 rounded-xl"><Bell size={22} /></span>
          تنبيهات رمضان
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
             <span className="text-white text-sm">تنبيه قبل الإفطار (دقيقة)</span>
             <input type="number" name="minutesBeforeIftar" value={settings.minutesBeforeIftar} onChange={handleChange} className="w-16 bg-white/10 border-none rounded-lg p-2 text-center text-[#d4af37]"/>
           </div>
           <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
             <span className="text-white text-sm">تنبيه قبل الإمساك (دقيقة)</span>
             <input type="number" name="minutesBeforeImsak" value={settings.minutesBeforeImsak} onChange={handleChange} className="w-16 bg-white/10 border-none rounded-lg p-2 text-center text-[#d4af37]"/>
           </div>
        </div>
      </section>

      <div className="flex gap-4 pt-4 no-print">
        <button onClick={() => alert('تم حفظ الإعدادات بنجاح!')} className="flex-1 bg-[#d4af37] text-[#050a18] py-4 rounded-2xl font-bold text-lg shadow-xl active:scale-95 transition-all">حفظ التغييرات</button>
        <button onClick={resetSettings} className="bg-white/5 text-gray-500 px-6 rounded-2xl hover:text-red-500 transition-colors"><RotateCcw size={20}/></button>
      </div>
    </div>
  );
};

export default Settings;
