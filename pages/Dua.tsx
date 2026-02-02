
import React, { useState, useEffect, useMemo } from 'react';
import { DuaData, DuaItem, DuaCategory } from '../types';
import { Search, Heart, Share2, Copy, Check, Type, Filter, ChevronDown, Sparkles } from 'lucide-react';

const Dua: React.FC = () => {
  const [data, setData] = useState<DuaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('dua_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>(() => {
    return (localStorage.getItem('dua_font_size') as 'sm' | 'md' | 'lg') || 'md';
  });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  useEffect(() => {
    fetch('./data/dua.json')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load duas', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    localStorage.setItem('dua_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('dua_font_size', fontSize);
  }, [fontSize]);

  const allDuas = useMemo(() => {
    if (!data) return [];
    const list: (DuaItem & { categoryName: string })[] = [];
    data.categories.forEach(cat => {
      cat.items.forEach(item => {
        list.push({ ...item, categoryName: cat.name_ar });
      });
    });
    return list;
  }, [data]);

  const filteredDuas = useMemo(() => {
    return allDuas.filter(dua => {
      const matchesSearch = dua.title.includes(searchQuery) || dua.text.includes(searchQuery);
      const matchesCategory = activeCategoryId === 'all' || 
        (data?.categories.find(c => c.id === activeCategoryId)?.items.some(i => i.id === dua.id));
      const matchesFavorites = !showOnlyFavorites || favorites.includes(dua.id);
      
      return matchesSearch && matchesCategory && matchesFavorites;
    });
  }, [allDuas, searchQuery, activeCategoryId, showOnlyFavorites, favorites, data]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    );
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const shareDua = (dua: DuaItem) => {
    if (navigator.share) {
      navigator.share({
        title: dua.title,
        text: `${dua.title}\n\n${dua.text}\n\nتمت المشاركة من تطبيق أوقات رمضان`,
      }).catch(console.error);
    } else {
      copyToClipboard(dua.text, dua.id);
      alert('تم نسخ الدعاء للمشاركة');
    }
  };

  const fontSizeClasses = {
    sm: 'text-base md:text-lg',
    md: 'text-xl md:text-2xl',
    lg: 'text-2xl md:text-3xl'
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#d4af37]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="text-center space-y-2">
        <h2 className="text-3xl md:text-4xl font-amiri font-bold text-[#d4af37]">الأدعية والأذكار</h2>
        <p className="text-gray-400 text-sm md:text-base">مجموعة مختارة من الأدعية الرمضانية والأذكار اليومية</p>
      </div>

      {/* Controls Section */}
      <div className="glass p-4 md:p-6 rounded-3xl border border-white/10 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="relative w-full">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
            <input 
              type="text"
              placeholder="ابحث في الأدعية..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 pr-12 pl-4 text-white outline-none focus:border-[#d4af37] transition-all text-sm md:text-base"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
            <button 
              onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
              className={`flex items-center gap-2 px-4 py-3 rounded-2xl transition-all whitespace-nowrap text-sm font-bold border ${
                showOnlyFavorites ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-white/5 text-gray-400 border-white/10'
              }`}
            >
              <Heart size={18} fill={showOnlyFavorites ? 'currentColor' : 'none'} />
              <span>{showOnlyFavorites ? 'كل الأدعية' : 'المفضلة'}</span>
            </button>
            
            <div className="flex bg-white/5 border border-white/10 rounded-2xl p-1">
              {(['sm', 'md', 'lg'] as const).map(size => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`px-3 py-2 rounded-xl transition-all ${
                    fontSize === size ? 'bg-[#d4af37] text-[#050a18]' : 'text-gray-500'
                  }`}
                  title={`حجم الخط: ${size === 'sm' ? 'صغير' : size === 'md' ? 'متوسط' : 'كبير'}`}
                >
                  <Type size={size === 'sm' ? 14 : size === 'md' ? 18 : 22} />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-2 border-t border-white/5 pt-4">
          <button
            onClick={() => setActiveCategoryId('all')}
            className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all border ${
              activeCategoryId === 'all' ? 'bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37]/40' : 'bg-transparent text-gray-500 border-white/5'
            }`}
          >
            الكل
          </button>
          {data?.categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold whitespace-nowrap transition-all border ${
                activeCategoryId === cat.id ? 'bg-[#d4af37]/20 text-[#d4af37] border-[#d4af37]/40' : 'bg-transparent text-gray-500 border-white/5'
              }`}
            >
              {cat.name_ar}
            </button>
          ))}
        </div>
      </div>

      {/* Duas List */}
      <div className="space-y-4 md:space-y-6">
        {filteredDuas.length > 0 ? (
          filteredDuas.map(dua => (
            <div 
              key={dua.id} 
              className="glass p-6 md:p-8 rounded-[2rem] border border-white/10 shadow-lg hover:border-[#d4af37]/30 transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Sparkles size={60} className="text-[#d4af37]" />
              </div>
              
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-widest text-[#d4af37] font-bold bg-[#d4af37]/10 px-2 py-0.5 rounded-lg">{dua.categoryName}</span>
                  <h3 className="text-xl md:text-2xl font-bold text-white font-amiri">{dua.title}</h3>
                </div>
                <button 
                  onClick={() => toggleFavorite(dua.id)}
                  className={`p-3 rounded-full transition-all active:scale-90 ${
                    favorites.includes(dua.id) ? 'bg-red-500/10 text-red-500' : 'text-gray-600 hover:text-white'
                  }`}
                >
                  <Heart size={24} fill={favorites.includes(dua.id) ? 'currentColor' : 'none'} />
                </button>
              </div>

              <p className={`font-amiri leading-relaxed text-right dua-text text-white/90 mb-6 relative z-10 ${fontSizeClasses[fontSize]}`}>
                {dua.text}
              </p>

              <div className="flex gap-2 justify-end relative z-10">
                <button 
                  onClick={() => copyToClipboard(dua.text, dua.id)}
                  className="flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-2xl transition-all text-sm font-bold btn-large"
                >
                  {copiedId === dua.id ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                  <span>{copiedId === dua.id ? 'تم النسخ' : 'نسخ'}</span>
                </button>
                <button 
                  onClick={() => shareDua(dua)}
                  className="flex items-center gap-2 px-4 py-3 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 text-[#d4af37] rounded-2xl transition-all text-sm font-bold btn-large"
                >
                  <Share2 size={18} />
                  <span>مشاركة</span>
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="glass p-12 rounded-[2.5rem] border border-white/5 text-center space-y-4">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto text-gray-600">
              <Filter size={40} />
            </div>
            <h3 className="text-xl font-bold text-white">لا توجد نتائج</h3>
            <p className="text-gray-500">جرب البحث بكلمات أخرى أو تغيير الفلتر</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dua;
