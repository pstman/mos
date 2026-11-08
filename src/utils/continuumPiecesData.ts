/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * پایگاه داده تالار قطعات و ایستگاه‌بندی پیوستار آکوستیک (فلات کهن ایران تا دانوب)
 * بازه زمانی استاندارد هر نغمه: ۲۰ تا ۳۰ ثانیه
 * بدون هوش مصنوعی؛ مبتنی بر فایل‌های استاندارد صوتی (.mp3 / .m4a / .webm) و پیوندهای مستقیم
 * نگارش به زبان فارسی پالوده و پاکیزه با اصطلاحات تخصصی ارگانولوژی و خنیاگری
 */

export interface ContinuumStationPiece {
  id: string;
  stationId: 'iranian-plateau' | 'mesopotamia-caucasus' | 'scythian-steppe' | 'danube-carpathian';
  stationNameFa: string;
  stationNameEn: string;
  stationNumber: number;
  routeTitleFa: string;
  titleFa: string;
  titleEn: string;
  musicalSystemFa: string; // نام دستگاه، مقام یا نغمه
  instrumentsFa: string[];
  durationSec: number;
  summaryFa: string;
  historicalContextFa: string;
  organologyNotesFa: string;
  audioUrl: string; // لینک مستقیم فایل صوتی استاندارد (.mp3 / .m4a / .webm)
  youtubeUrl?: string; // پیوند مستقیم یوتیوب
  coverImageUrl: string;
  isCustomOverride?: boolean;
}

const STORAGE_PIECES_KEY = 'enamix_continuum_pieces_v1';

export const DEFAULT_CONTINUUM_PIECES: ContinuumStationPiece[] = [
  {
    id: 'piece_station_1_iran',
    stationId: 'iranian-plateau',
    stationNameFa: 'ایستگاه یکم: فلات کهن ایران (ایران باستان و پارس)',
    stationNameEn: 'Station 1: Iranian Plateau',
    stationNumber: 1,
    routeTitleFa: 'سرچشمه خنیا و پرده‌بندی سنتور کهن و نای',
    titleFa: 'درآمد و فرود شور و دشتی با سنتور کهن و نای هفت‌بند',
    titleEn: 'Dastgah Shur & Dashti Motif on Persian Santur and Ney',
    musicalSystemFa: 'دستگاه شور و نغمه دشتی (سی کُرن - فاصله دوم خنثای ۱۳۵ سنتی)',
    instrumentsFa: ['سنتور کهن ۹ خرک', 'نای هفت‌بند گیاهی', 'تنبک چوب گردو'],
    durationSec: 26,
    summaryFa: 'طنین آغازین پیوستار آکوستیک از فلات کهن ایران با مضراب‌های ظریف چوب گردو بر سیم‌های برنجی سنتور و نوای نفس‌گیر نای هفت‌بند در فاصله ۱۳۵ سنتی سی کُرن.',
    historicalContextFa: 'ردپای تاریخی ساز سنتور به نقوش برجسته سنگی بین‌النهرین و ایلام باستان (سده‌های هشتم و هفتم پیش از زایش مسیح) بازمی‌گردد. در این نغمه، ساز سنتور به همراه نای با کوک ایرانی، بنیان پیوستار آکوستیک را پی‌ریزی می‌کند.',
    organologyNotesFa: 'در سنتور ایرانی، هر خرک حامل چهار سیم هم‌کوک است که با ضربه مضراب لخت نمددار، رزونانس همدلانه غنی پدید می‌آورد. نای هفت‌بند با شیوه دندان‌لب و ستون هوای استوانه‌ای، صدای زنگ‌دار ویژه شرقی ایجاد می‌کند.',
    audioUrl: 'https://cdn.jsdelivr.net/gh/nbrosowsky/tonejs-instruments@master/samples/harp/D4.mp3',
    youtubeUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    coverImageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'piece_station_2_mesopotamia',
    stationId: 'mesopotamia-caucasus',
    stationNameFa: 'ایستگاه دوم: میان‌راهی میان‌رودان و قفقاز (آناتولی و ارمنستان)',
    stationNameEn: 'Station 2: Mesopotamia & Caucasian Foothills',
    stationNumber: 2,
    routeTitleFa: 'گذرگاه شاهراه ابریشم، تنبور و کاوال بدوی',
    titleFa: 'نغمه‌های باستانی مقام اوشاک با کاوال چوبی و تسامبال بدوی',
    titleEn: 'Makam Ussak Dialogue on Wooden Caval & Archaic Cimbalom',
    musicalSystemFa: 'مقام اوشاک و کمای هولدرین (کاهش ۲۲ سنتی نسبت به اعتدال مساوی)',
    instrumentsFa: ['کاوال چوبی زبانه‌دار', 'تسامبال بدوی چوبی', 'تنبور کهن'],
    durationSec: 24,
    summaryFa: 'گفت‌وگوی ملودیک میان کاوال چوبی کوهپایه‌های آرارات و تسامبال چوبی بدوی؛ نشان‌دهنده دگرگونی کالبد سنتور در گذر از میان‌رودان به سوی آناتولی.',
    historicalContextFa: 'دست‌نوشته‌های کهن دیمیتری کانتمیر (شاهزاده مولداوی و ادیب دربار استانبول) نشان می‌دهد که چگونه سازهای زهی ایرانی و ترکی از طریق این گلوگاه کوهستانی وارد حوزه بالکان و سپس رومانی شدند.',
    organologyNotesFa: 'کاوال چوبی از چوب شمشاد یا آلو جنگلی تراشیده می‌شود و هشت سوراخ بر رو و یک سوراخ زیر دارد. تسامبال بدوی فاقد پدال بوده و با مضراب‌های پیچیده در پارچه پشمی نواخته می‌شود.',
    audioUrl: 'https://cdn.jsdelivr.net/gh/nbrosowsky/tonejs-instruments@master/samples/flute/A4.mp3',
    youtubeUrl: 'https://www.youtube.com/watch?v=k1b8zms9qYk',
    coverImageUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'piece_station_3_scythian',
    stationId: 'scythian-steppe',
    stationNameFa: 'ایستگاه سوم: شاهراه سکاها و آلان‌ها (دشت‌های اوراسیا و قفقاز شمالی)',
    stationNameEn: 'Station 3: Scythian & Alanic Steppe Corridor',
    stationNumber: 3,
    routeTitleFa: 'پویه سوارکاران کهن، ریتم‌های تکاپویی و هورای باستانی',
    titleFa: 'پایکوبی هورای کهن سکایی با کاسه طنینی زهی و طبل‌های پوستی',
    titleEn: 'Archaic Scythian Steppe Pulsation and Horseman Rhythms',
    musicalSystemFa: 'ریتم‌های لنگ و پرده‌بندی کهن استپی (میزان‌های ترکیبی ۵/۸ و ۷/۸)',
    instrumentsFa: ['ساز زهی پوستی اسب‌نوازان', 'طبل پوستی تک‌دهانه', 'سوتک استخوانی'],
    durationSec: 25,
    summaryFa: 'ریتم‌های شتابنده و ضربی الهام‌گرفته از تاخت اسبان سکاها و هورای باستانی که ریشه رقص‌های دوره‌ای هورا در رومانی و مولداوی را شکل داد.',
    historicalContextFa: 'سکاها و آلان‌ها اقوام کهن ایرانی‌تبار شمال دریای سیاه و قفقاز بودند که فرهنگ زهی-کوبه‌ای عشایری را از استپ‌های اوراسیا به دهانه رود دانوب رساندند. سازهای کشف‌شده در کورگان‌های باستانی شاهد این پیوند صوتی است.',
    organologyNotesFa: 'کاسه طنینی سازهای این منطقه یکپارچه از ریشه درخت تراشیده شده و روی آن پوست آهو یا بز کشیده می‌شد که پلی میان سازهای زهی پوست‌دار شرقی و سازهای اروپایی پدید آورد.',
    audioUrl: 'https://cdn.jsdelivr.net/gh/nbrosowsky/tonejs-instruments@master/samples/guitar-acoustic/D4.mp3',
    youtubeUrl: 'https://www.youtube.com/watch?v=0hX03w1F9m0',
    coverImageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'piece_station_4_danube',
    stationId: 'danube-carpathian',
    stationNameFa: 'ایستگاه چهارم: فرودگاه حوزه دانوب و کوه‌های کارپات (رومانی و بالکان)',
    stationNameEn: 'Station 4: Danubian & Carpathian Basin',
    stationNumber: 4,
    routeTitleFa: 'پایان پیوستار: تسامبال کنسرتی بزرگ و آواز سوزناک دوئینا',
    titleFa: 'رقص لنگ لوتاری‌ها و آواز دوئینا با تسامبال بزرگ (Țambal Mare)',
    titleEn: 'Carpathian Doina and Lăutari Asymmetrical Dance on Concert Cimbalom',
    musicalSystemFa: 'گام‌های لیدیایی و هارمونیک مینور شرقی با ریتم لنگ ۹/۸ (اکساک رومانیایی)',
    instrumentsFa: ['تسامبال کنسرتی بزرگ (Țambal Mare)', 'کاوال رومانیایی', 'ویولن لوتاری با کوک‌های باز'],
    durationSec: 28,
    summaryFa: 'اوج شکوهمند پیوستار صوتی در دشت‌های والاچیا و مولداوی؛ نوای حزن‌انگیز دوئینا که به رقص پرشور هورا و مضراب‌نوازی شعبده‌گونه نوازندگان لوتاری بر روی تسامبال بزرگ تبدیل می‌شود.',
    historicalContextFa: 'در اواخر سده نوزدهم، یوژف شوندا در بوداپست و سازندگان بخارست با افزودن دمپر پدالی و قاب چدنی به سنتور شرقی، تسامبال کنسرتی ۴ اکتاوی را آفریدند که امروزه قلب تپنده خنیاگری کارپات است.',
    organologyNotesFa: 'تسامبال کنسرتی وزنی بیش از ۷۵ کیلوگرم دارد و کشش ده‌ها سیم فولادی و برنجی را تحمل می‌کند. مضراب‌های چوبی پوشیده در چرم ضخیم امکان صدادهی رعدآسا یا مخملین را فراهم می‌سازند.',
    audioUrl: 'https://cdn.jsdelivr.net/gh/nbrosowsky/tonejs-instruments@master/samples/piano/G4.mp3',
    youtubeUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
    coverImageUrl: 'https://images.unsplash.com/photo-1612225330812-01a9c6b355ec?auto=format&fit=crop&w=1200&q=80'
  }
];

export function getStoredContinuumPieces(): ContinuumStationPiece[] {
  try {
    const raw = localStorage.getItem(STORAGE_PIECES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return DEFAULT_CONTINUUM_PIECES;
}

export function saveContinuumPieces(pieces: ContinuumStationPiece[]): void {
  try {
    localStorage.setItem(STORAGE_PIECES_KEY, JSON.stringify(pieces));
  } catch (err) {
    console.error('Error saving continuum pieces:', err);
  }
}

export function updateContinuumPiece(
  id: string,
  updatedFields: Partial<ContinuumStationPiece>
): ContinuumStationPiece[] {
  const current = getStoredContinuumPieces();
  const index = current.findIndex(p => p.id === id);
  if (index === -1) return current;

  current[index] = {
    ...current[index],
    ...updatedFields,
    isCustomOverride: true
  };
  saveContinuumPieces(current);
  return current;
}

export function resetContinuumPiecesToDefault(): ContinuumStationPiece[] {
  try {
    localStorage.removeItem(STORAGE_PIECES_KEY);
  } catch {
    // ignore
  }
  return DEFAULT_CONTINUUM_PIECES;
}
