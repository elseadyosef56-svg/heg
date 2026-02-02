
import React from 'react';

export const API_BASE = 'https://api.aladhan.com/v1';

export const DEFAULT_SETTINGS = {
  country: 'Saudi Arabia',
  city: 'Riyadh',
  method: 4,
  notificationIftar: false,
  notificationImsak: false,
  minutesBeforeIftar: 10,
  minutesBeforeImsak: 10,
  theme: 'dark' as const,
};

export const ARAB_COUNTRIES = [
  { name: 'السعودية', code: 'Saudi Arabia', cities: ['الرياض', 'مكة المكرمة', 'المدينة المنورة', 'جدة', 'الدمام', 'الطائف', 'تبوك', 'أبها'] },
  { name: 'مصر', code: 'Egypt', cities: ['القاهرة', 'الإسكندرية', 'الجيزة', 'شبرا الخيمة', 'بورسعيد', 'السويس', 'الأقصر', 'أسوان'] },
  { name: 'الإمارات', code: 'United Arab Emirates', cities: ['أبو ظبي', 'دبي', 'الشارقة', 'عجمان', 'رأس الخيمة', 'الفجيرة', 'العين'] },
  { name: 'الكويت', code: 'Kuwait', cities: ['الكويت', 'الأحمدي', 'حولي', 'السالمية', 'الفروانية'] },
  { name: 'قطر', code: 'Qatar', cities: ['الدوحة', 'الريان', 'الوكرة', 'الخور', 'لوسيل'] },
  { name: 'عمان', code: 'Oman', cities: ['مسقط', 'صلالة', 'نزوى', 'صحار', 'صور'] },
  { name: 'البحرين', code: 'Bahrain', cities: ['المنامة', 'المحرق', 'الرفاع', 'مدينة حمد'] },
  { name: 'الأردن', code: 'Jordan', cities: ['عمان', 'إربد', 'الزرقاء', 'العقبة', 'مادبا'] },
  { name: 'فلسطين', code: 'Palestine', cities: ['القدس', 'غزة', 'رام الله', 'نابلس', 'الخليل', 'جنين', 'بيت لحم'] },
  { name: 'لبنان', code: 'Lebanon', cities: ['بيروت', 'طرابلس', 'صيدا', 'صور', 'بعلبك'] },
  { name: 'سوريا', code: 'Syria', cities: ['دمشق', 'حلب', 'حمص', 'اللاذقية', 'حماة', 'طرطوس'] },
  { name: 'العراق', code: 'Iraq', cities: ['بغداد', 'البصرة', 'الموصل', 'أربيل', 'النجف', 'كربلاء'] },
  { name: 'اليمن', code: 'Yemen', cities: ['صنعاء', 'عدن', 'تعز', 'الحديدة', 'المكلا'] },
  { name: 'المغرب', code: 'Morocco', cities: ['الرباط', 'الدار البيضاء', 'مراكش', 'فاس', 'طنجة', 'أكادير'] },
  { name: 'الجزائر', code: 'Algeria', cities: ['الجزائر', 'وهران', 'قسنطينة', 'عنابة', 'سطيف'] },
  { name: 'تونس', code: 'Tunisia', cities: ['تونس', 'صفاقس', 'سوسة', 'القيروان', 'بنزرت'] },
  { name: 'ليبيا', code: 'Libya', cities: ['طرابلس', 'بنغازي', 'مصراتة', 'الزاوية', 'طبرق'] },
  { name: 'السودان', code: 'Sudan', cities: ['الخرطوم', 'أم درمان', 'بورتسودان', 'كسلا'] },
  { name: 'موريتانيا', code: 'Mauritania', cities: ['نواكشوط', 'نواذيبو', 'كيهيدي'] },
  { name: 'جيبوتي', code: 'Djibouti', cities: ['جيبوتي', 'علي صبيح', 'تاجورة'] },
  { name: 'الصومال', code: 'Somalia', cities: ['مقديشو', 'هرجيسا', 'بوساسو'] },
  { name: 'جزر القمر', code: 'Comoros', cities: ['موروني', 'موتسامودو', 'فومبوني'] },
];

export const CALCULATION_METHODS = [
  { id: 1, name: 'جامعة العلوم الإسلامية، كراتشي' },
  { id: 2, name: 'الجمعية الإسلامية لأمريكا الشمالية (ISNA)' },
  { id: 3, name: 'رابطة العالم الإسلامي' },
  { id: 4, name: 'جامعة أم القرى، مكة' },
  { id: 5, name: 'الهيئة المصرية العامة للمساحة' },
  { id: 13, name: 'رئاسة الشؤون الدينية التركية' },
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

export const ICON_PATHS = {
  Fajr: <path d="M12 2v2M5 5l1.5 1.5M2 12h2M5 19l1.5-1.5M12 22v-2M19 19l-1.5-1.5M22 12h-2M19 5l-1.5 1.5M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z" />,
  Imsak: <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m11.314 11.314l.707.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />,
  Maghrib: <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z" />,
};
