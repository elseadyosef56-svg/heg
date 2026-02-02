import React from 'react';

export const API_BASE = 'https://api.aladhan.com/v1';
export const QURAN_API = 'https://api.alquran.cloud/v1';

export const DEFAULT_SETTINGS = {
  country: 'Saudi Arabia',
  city: 'Riyadh',
  method: 4,
  notificationIftar: false,
  notificationImsak: false,
  minutesBeforeIftar: 10,
  minutesBeforeImsak: 10,
  theme: 'dark' as const,
  adhanSettings: {
    enabled: true,
    volume: 0.8,
    soundId: 'makkah'
  },
  quranSettings: {
    fontSize: 28,
    highlightActiveAyah: true,
    autoPlayNext: true,
    selectedReciter: 'hazza',
    playbackSpeed: 1,
    repeatMode: 'off' as const,
    lastReadSurah: 1,
    lastReadAyah: 1
  }
};

export const ADHAN_SOUNDS = [
  { id: 'makkah', name: 'أذان مكة المكرمة' },
  { id: 'madinah', name: 'أذان المدينة المنورة' },
  { id: 'alaqsa', name: 'أذان المسجد الأقصى' }
];

export const ARAB_COUNTRIES = [
  { name: 'السعودية', code: 'Saudi Arabia', cities: ['الرياض', 'مكة المكرمة', 'المدينة المنورة', 'جدة', 'الدمام', 'الطائف', 'تبوك', 'أبها'] },
  { name: 'مصر', code: 'Egypt', cities: ['القاهرة', 'الإسكندرية', 'الجيزة', 'بورسعيد', 'السويس', 'الأقصر', 'أسوان'] },
  { name: 'الإمارات', code: 'United Arab Emirates', cities: ['أبو ظبي', 'دبي', 'الشارقة', 'عجمان', 'رأس الخيمة', 'الفجيرة', 'العين'] },
  { name: 'الكويت', code: 'Kuwait', cities: ['الكويت', 'الأحمدي', 'حولي', 'السالمية', 'الجهراء'] },
  { name: 'قطر', code: 'Qatar', cities: ['الدوحة', 'الريان', 'الوكرة', 'الخور'] },
  { name: 'عمان', code: 'Oman', cities: ['مسقط', 'صلالة', 'نزوى', 'صحار'] },
  { name: 'البحرين', code: 'Bahrain', cities: ['المنامة', 'المحرق', 'الرفاع', 'مدينة حمد'] },
  { name: 'الأردن', code: 'Jordan', cities: ['عمان', 'إربد', 'الزرقاء', 'العقبة'] },
  { name: 'فلسطين', code: 'Palestine', cities: ['القدس', 'غزة', 'رام الله', 'نابلس', 'الخليل'] },
  { name: 'ليبيا', code: 'Libya', cities: ['طرابلس', 'بنغازي', 'مصراتة', 'طبرق', 'سبها'] },
  { name: 'المغرب', code: 'Morocco', cities: ['الرباط', 'الدار البيضاء', 'مراكش', 'فاس', 'طنجة'] },
  { name: 'الجزائر', code: 'Algeria', cities: ['الجزائر', 'وهران', 'قسنطينة', 'عنابة'] },
  { name: 'تونس', code: 'Tunisia', cities: ['تونس', 'صفاقس', 'سوسة'] },
  { name: 'العراق', code: 'Iraq', cities: ['بغداد', 'البصرة', 'الموصل', 'أربيل'] },
  { name: 'اليمن', code: 'Yemen', cities: ['صنعاء', 'عدن', 'تعز'] },
  { name: 'لبنان', code: 'Lebanon', cities: ['بيروت', 'طرابلس', 'صيدا'] },
  { name: 'سوريا', code: 'Syria', cities: ['دمشق', 'حلب', 'حمص'] },
];

export const CALCULATION_METHODS = [
  { id: 4, name: 'جامعة أم القرى، مكة' },
  { id: 1, name: 'جامعة العلوم الإسلامية، كراتشي' },
  { id: 2, name: 'الجمعية الإسلامية لأمريكا الشمالية (ISNA)' },
  { id: 3, name: 'رابطة العالم الإسلامي' },
  { id: 5, name: 'الهيئة المصرية العامة للمساحة' },
  { id: 8, name: 'منطقة الخليج' },
];

export const PRAYER_NAMES: Record<string, string> = {
  Fajr: 'الفجر',
  Sunrise: 'الشروق',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب (الإفطار)',
  Isha: 'العشاء',
  Imsak: 'الإمساك',
};