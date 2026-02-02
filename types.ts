
export interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
}

export interface PrayerData {
  timings: PrayerTimings;
  date: {
    readable: string;
    timestamp: string;
    hijri: {
      date: string;
      format: string;
      day: string;
      weekday: {
        en: string;
        ar: string;
      };
      month: {
        number: number;
        en: string;
        ar: string;
      };
      year: string;
      designation: {
        abbreviated: string;
        expanded: string;
      };
      holidays: string[];
    };
    gregorian: {
      date: string;
      format: string;
      day: string;
      weekday: {
        en: string;
      };
      month: {
        number: number;
        en: string;
      };
      year: string;
      designation: {
        abbreviated: string;
        expanded: string;
      };
    };
  };
  meta: any;
}

export interface UserSettings {
  country: string;
  city: string;
  method: number;
  notificationIftar: boolean;
  notificationImsak: boolean;
  minutesBeforeIftar: number;
  minutesBeforeImsak: number;
  theme: 'dark' | 'gold';
  adhanSettings: AdhanSettings;
  quranSettings: QuranSettings;
}

export interface AdhanSettings {
  enabled: boolean;
  volume: number;
  soundId: string;
}

export interface QuranSettings {
  fontSize: number;
  highlightActiveAyah: boolean;
  autoPlayNext: boolean;
  selectedReciter: string;
  playbackSpeed: number;
  repeatMode: 'off' | 'ayah';
  lastReadSurah: number;
  lastReadAyah: number;
}

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
}

export interface FullSurah extends Surah {
  ayahs: Ayah[];
}

export interface Reciter {
  id: string;
  name_ar: string;
  base_url: string;
  file_pattern: string;
  type: 'ayah';
}

export interface DuaItem {
  id: string;
  title: string;
  text: string;
}

export interface DuaCategory {
  id: string;
  name_ar: string;
  items: DuaItem[];
}

export interface DuaData {
  categories: DuaCategory[];
}
