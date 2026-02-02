
import React, { useState, useEffect, useRef } from 'react';
import { UserSettings, Surah, FullSurah, Ayah, Reciter } from '../types';
import { QURAN_API } from '../constants';
import { Search, Book, Play, Pause, SkipBack, SkipForward, X, Loader2, LayoutList, AlignRight, Eye, Repeat, Activity, AlertCircle } from 'lucide-react';

interface QuranProps {
  settings: UserSettings;
  onUpdate: (settings: UserSettings) => void;
}

const Quran: React.FC<QuranProps> = ({ settings, onUpdate }) => {
  const [view, setView] = useState<'list' | 'reader'>('list');
  const [readerMode, setReaderMode] = useState<'flow' | 'verses'>('flow');
  const [paperMode, setPaperMode] = useState(true);
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [selectedSurah, setSelectedSurah] = useState<FullSurah | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentAyahIndex, setCurrentAyahIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [reciters, setReciters] = useState<Reciter[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    fetch('./data/reciters.json')
      .then(res => res.json())
      .then(data => setReciters(data))
      .catch(() => console.error("Failed to load reciters"));
    
    setLoading(true);
    fetch(`${QURAN_API}/surah`)
      .then(res => res.json())
      .then(json => {
        setSurahs(json.data);
        setLoading(false);
      });
  }, []);

  const openSurah = async (number: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${QURAN_API}/surah/${number}/quran-uthmani`);
      const json = await res.json();
      setSelectedSurah(json.data);
      setView('reader');
      setCurrentAyahIndex(0);
      setIsPlaying(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      alert("خطأ في تحميل السورة");
    } finally {
      setLoading(false);
    }
  };

  const playAyah = async (index: number) => {
    if (!selectedSurah) return;
    if (index < 0 || index >= selectedSurah.ayahs.length) return;

    const reciter = reciters.find(r => r.id === settings.quranSettings.selectedReciter);
    if (!reciter || !reciter.base_url) {
      alert("عذراً، هذا القارئ غير متوفر حاليًا من مصدر صوت مرخّص.");
      setIsPlaying(false);
      return;
    }

    setCurrentAyahIndex(index);
    setIsAudioLoading(true);
    
    const s3 = String(selectedSurah.number).padStart(3, '0');
    const a3 = String(selectedSurah.ayahs[index].numberInSurah).padStart(3, '0');
    
    let filename = reciter.file_pattern
      .replace('{surah3}', s3)
      .replace('{ayah3}', a3)
      .replace('{surah}', String(selectedSurah.number))
      .replace('{ayah}', String(selectedSurah.ayahs[index].numberInSurah));

    const audioUrl = `${reciter.base_url}/${filename}`;

    if (audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.playbackRate = settings.quranSettings.playbackSpeed;
      audioRef.current.load();
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (e) {
        console.error("Audio play failed", e);
        setIsPlaying(false);
        // التنبيه في حال فشل المصدر
        if (index === currentAyahIndex) {
            alert("عذراً، فشل تحميل الصوت من المصدر. يرجى تجربة قارئ آخر أو التحقق من الاتصال.");
        }
      } finally {
        setIsAudioLoading(false);
      }
    }

    const ayahElement = document.getElementById(`ayah-${index}`);
    if (ayahElement) {
      ayahElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleAudioEnd = () => {
    if (settings.quranSettings.repeatMode === 'ayah') {
      playAyah(currentAyahIndex);
    } else if (settings.quranSettings.autoPlayNext && currentAyahIndex < (selectedSurah?.ayahs.length || 0) - 1) {
      playAyah(currentAyahIndex + 1);
    } else {
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      playAyah(currentAyahIndex);
    }
  };

  const filteredSurahs = surahs.filter(s => s.name.includes(searchQuery) || s.number.toString() === searchQuery);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-40">
      <audio 
        ref={audioRef} 
        onEnded={handleAudioEnd} 
        crossOrigin="anonymous" 
        onLoadStart={() => setIsAudioLoading(true)}
        onCanPlay={() => setIsAudioLoading(false)}
      />
      
      {view === 'list' ? (
        <>
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <h2 className="text-3xl font-amiri font-bold text-[#d4af37]">المصحف الشريف</h2>
            <div className="relative w-full md:w-96">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder="ابحث باسم السورة أو رقمها..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pr-12 pl-4 text-white outline-none focus:border-[#d4af37] transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="animate-spin text-[#d4af37]" size={48} />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSurahs.map(surah => (
                <button 
                  key={surah.number}
                  onClick={() => openSurah(surah.number)}
                  className="glass p-6 rounded-3xl flex items-center justify-between group hover:border-[#d4af37]/50 transition-all text-right"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] font-bold group-hover:bg-[#d4af37] group-hover:text-[#050a18] transition-all">
                      {surah.number}
                    </div>
                    <div>
                      <div className="text-xl font-bold text-white mb-1">{surah.name}</div>
                      <div className="text-xs text-gray-400">سورة {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} • {surah.numberOfAyahs} آية</div>
                    </div>
                  </div>
                  <Book className="text-gray-600 group-hover:text-[#d4af37]" size={20} />
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="space-y-6">
          {/* Reader Header */}
          <div className="flex items-center justify-between sticky top-[72px] z-40 glass p-4 rounded-2xl border border-white/10 shadow-lg">
            <button onClick={() => { setView('list'); setIsPlaying(false); audioRef.current?.pause(); }} className="p-2 hover:bg-white/10 rounded-lg text-gray-400">
              <X size={24} />
            </button>
            <div className="text-center">
              <h2 className="text-2xl font-amiri font-bold text-[#d4af37]">{selectedSurah?.name}</h2>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">{selectedSurah?.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}</p>
            </div>
            <div className="flex gap-2">
               <button 
                onClick={() => setPaperMode(!paperMode)}
                className={`p-2 rounded-lg transition-all ${paperMode ? 'bg-[#d4af37] text-white shadow-lg shadow-[#d4af37]/20' : 'text-gray-400 hover:bg-white/10'}`}
                title="تفعيل الخلفية الورقية (وضوح القراءة)"
               >
                 <Eye size={20} />
               </button>
               <button 
                onClick={() => setReaderMode(readerMode === 'flow' ? 'verses' : 'flow')}
                className="p-2 hover:bg-white/10 rounded-lg text-[#d4af37]"
                title="تغيير نمط العرض"
               >
                 {readerMode === 'flow' ? <LayoutList size={20} /> : <AlignRight size={20} />}
               </button>
            </div>
          </div>

          {/* Quran Text Container */}
          <div 
            className={`p-8 md:p-16 rounded-[2.5rem] text-center select-none shadow-2xl transition-all duration-500 ${paperMode ? 'bg-[#f5f1e6] text-[#2c1e14] border-8 border-[#e8dfc4]' : 'glass text-white/90'}`}
            style={{ 
                fontSize: `${settings.quranSettings.fontSize}px`,
                lineHeight: readerMode === 'flow' ? '3' : '2.5'
            }}
          >
            {selectedSurah?.number !== 1 && selectedSurah?.number !== 9 && (
              <div className={`text-4xl font-amiri mb-16 border-b pb-8 ${paperMode ? 'text-[#8b6b1b] border-black/5' : 'text-[#d4af37] border-white/5'}`}>بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
            )}
            
            {readerMode === 'flow' ? (
                <div className="flex flex-wrap justify-center gap-x-3 gap-y-6 font-amiri">
                {selectedSurah?.ayahs.map((ayah, index) => (
                  <span 
                    key={index}
                    id={`ayah-${index}`}
                    className={`inline transition-all px-2 py-1 rounded-2xl cursor-pointer ${currentAyahIndex === index ? 'bg-[#d4af37]/40 scale-105 shadow-md ring-2 ring-[#d4af37]/20 font-bold' : 'hover:bg-black/5'}`}
                    onClick={() => playAyah(index)}
                  >
                    {ayah.text}
                    <span className={`inline-flex items-center justify-center w-10 h-10 mx-3 text-sm border rounded-full font-sans bg-black/5 ${paperMode ? 'text-[#8b6b1b] border-[#8b6b1b]/30' : 'text-[#d4af37] border-[#d4af37]/40'}`}>
                      {ayah.numberInSurah}
                    </span>
                  </span>
                ))}
                </div>
            ) : (
                <div className="space-y-12 font-amiri text-right max-w-4xl mx-auto">
                {selectedSurah?.ayahs.map((ayah, index) => (
                    <div 
                        key={index} 
                        id={`ayah-${index}`}
                        onClick={() => playAyah(index)}
                        className={`p-6 rounded-3xl transition-all cursor-pointer border ${currentAyahIndex === index ? 'bg-[#d4af37]/20 border-[#d4af37]/50 shadow-inner' : 'border-transparent hover:bg-black/5'}`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <span className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-sans ${paperMode ? 'bg-[#8b6b1b]/10 text-[#8b6b1b]' : 'bg-[#d4af37]/10 text-[#d4af37]'}`}>{ayah.numberInSurah}</span>
                        </div>
                        <p className={`leading-relaxed transition-colors ${currentAyahIndex === index ? (paperMode ? 'text-[#5d4037] font-bold' : 'text-[#d4af37]') : ''}`}>{ayah.text}</p>
                    </div>
                ))}
                </div>
            )}
          </div>

          {/* Floating Player Controls */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-3xl z-50">
            <div className="glass bg-[#0a0f1d]/95 border-[#d4af37]/40 p-4 md:p-6 rounded-[2.5rem] shadow-2xl flex flex-col gap-4">
              <div className="flex items-center justify-between px-2 md:px-4">
                 <div className="flex items-center gap-4 md:gap-6">
                    <button 
                      onClick={() => playAyah(currentAyahIndex - 1)}
                      className="text-gray-500 hover:text-white transition-all active:scale-90"
                    >
                      <SkipForward size={24} />
                    </button>
                    <button 
                      onClick={togglePlay}
                      className="w-12 h-12 md:w-16 md:h-16 bg-[#d4af37] rounded-full flex items-center justify-center text-[#050a18] shadow-xl active:scale-90 transition-all relative"
                    >
                      {isAudioLoading ? <Loader2 className="animate-spin text-white" size={24} /> : (isPlaying ? <Pause fill="currentColor" size={24} /> : <Play fill="currentColor" size={24} className="ml-1" />)}
                    </button>
                    <button 
                      onClick={() => playAyah(currentAyahIndex + 1)}
                      className="text-gray-500 hover:text-white transition-all active:scale-90"
                    >
                      <SkipBack size={24} />
                    </button>
                 </div>

                 <div className="hidden lg:flex items-center gap-6">
                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-gray-500 text-center uppercase tracking-tighter">القارئ الحالي</span>
                        <select 
                        className="bg-white/5 border border-white/10 rounded-xl text-xs p-2 text-[#d4af37] outline-none focus:border-[#d4af37]"
                        value={settings.quranSettings.selectedReciter}
                        onChange={(e) => onUpdate({...settings, quranSettings: {...settings.quranSettings, selectedReciter: e.target.value}})}
                        >
                        {reciters.map(r => <option key={r.id} value={r.id} className="bg-[#050a18]">{r.name_ar}</option>)}
                        </select>
                    </div>
                    
                    <button 
                      onClick={() => onUpdate({...settings, quranSettings: {...settings.quranSettings, repeatMode: settings.quranSettings.repeatMode === 'off' ? 'ayah' : 'off'}})}
                      className={`p-2 rounded-xl transition-all ${settings.quranSettings.repeatMode === 'ayah' ? 'bg-[#d4af37] text-white shadow-lg shadow-[#d4af37]/20' : 'text-gray-500 hover:bg-white/5'}`}
                      title="تكرار الآية"
                    >
                      <Repeat size={20} />
                    </button>
                 </div>

                 <div className="flex items-center gap-3">
                    <button 
                      onClick={() => onUpdate({...settings, quranSettings: {...settings.quranSettings, autoPlayNext: !settings.quranSettings.autoPlayNext}})}
                      className={`hidden sm:flex p-2 rounded-xl transition-all ${settings.quranSettings.autoPlayNext ? 'text-[#d4af37]' : 'text-gray-500'}`}
                      title="التشغيل التلقائي"
                    >
                      <Activity size={20} />
                    </button>
                    <button 
                        onClick={() => { setPaperMode(!paperMode); }}
                        className={`p-2 transition-all ${paperMode ? 'text-[#d4af37]' : 'text-gray-500 hover:text-white'}`}
                    >
                        <Eye size={24} />
                    </button>
                 </div>
              </div>
              
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#d4af37] to-orange-500 transition-all duration-300"
                  style={{ width: `${((currentAyahIndex + 1) / (selectedSurah?.ayahs.length || 1)) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Quran;
