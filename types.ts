
export interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
  Imsak: string;
  Midnight: string;
  Firstthird: string;
  Lastthird: string;
}

export interface DateInfo {
  readable: string;
  timestamp: string;
  hijri: {
    date: string;
    day: string;
    month: { number: number; en: string; ar: string };
    year: string;
    designation: { abbreviated: string; expanded: string };
  };
  gregorian: {
    date: string;
    day: string;
    month: { number: number; en: string };
    year: string;
  };
}

export interface PrayerData {
  timings: PrayerTimings;
  date: DateInfo;
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
}

export enum CalculationMethod {
  UniversityOfIslamicSciencesKarachi = 1,
  IslamicSocietyOfNorthAmerica = 2,
  MuslimWorldLeague = 3,
  UmmAlQuraUniversityMakkah = 4,
  EgyptianGeneralAuthorityOfSurvey = 5,
  InstituteOfGeophysicsUniversityOfTehran = 7,
  GulfRegion = 8,
  Kuwait = 9,
  Qatar = 10,
  MajlisUgamaIslamSingapuraSingapore = 11,
  UnionOrganizationIslamiqueDeFrance = 12,
  DiyanetİşleriBaşkanlığıTurkey = 13,
  SpiritualAdministrationOfMuslimsOfRussia = 14
}
