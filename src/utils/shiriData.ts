/**
 * Pure Data Models, Seed Data, Rozblog Template Engine & Equalizer Logic
 * for Mostafa Shiri Official Website (مصطفی شیری | وب‌سایت رسمی)
 */

export const STORAGE_KEYS = {
  HOST_API_KEY: 'shiri_cloudflare_worker_url',
  STORAGE_DATA_KEY: 'shiri_site_data_cache',
  ADMIN_SESSION_KEY: 'shiri_admin_logged_in',
  THEME_KEY: 'shiri_theme_pref',
} as const;

export const DEFAULT_ADMIN_PASS = 'ms1376';

export type TrackCategory = 'single' | 'collaboration' | 'album';

export interface TrackItem {
  id: string;
  title: string;
  subtitle: string;
  category: TrackCategory;
  slug: string;
  image: string;
  audio: string;
  duration: string;
  releaseDate: string;
  bpm?: number;
  musicalKey?: string;
  arrangement: string;
  mixMaster: string;
  lyrics: string;
  plays: number;
}

export interface VideoItem {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  videoUrl: string;
  posterUrl: string;
  duration: string;
  releaseDate: string;
  quality: string;
  director: string;
  description: string;
}

export interface BlogPostItem {
  id: string;
  title: string;
  slug: string;
  category: string;
  date: string;
  excerpt: string;
  content: string;
  coverImage: string;
  audioUrl?: string;
  videoUrl?: string;
  readingTime: string;
}

export interface MenuLink {
  id: string;
  title: string;
  link: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  mode: 'dark' | 'light';
  bgMain: string;
  bgCard: string;
  bgSurface: string;
  colorGold: string;
  colorBorder: string;
  textMain: string;
  textMuted: string;
}

export interface TemplateConfig {
  activePresetId: string;
  bgMain: string;
  bgCard: string;
  bgSurface: string;
  colorGold: string;
  colorBorder: string;
  gridColumns: 2 | 3;
  enable3DTilt: boolean;
  enableCursorGlow: boolean;
  enableHeroParticles: boolean;
  desktopBannerUrl: string;
  mobileBannerUrl: string;
  customRozblogTemplate: string;
  showCustomTemplateBlock: boolean;
}

export interface ArtistProfile {
  nameFa: string;
  nameEn: string;
  monogram: string;
  roleTitle: string;
  shortBio: string;
  fullBio: string;
  studioName: string;
  location: string;
  contactEmail: string;
  instagramHandle: string;
  telegramHandle: string;
}

export interface CustomBlock {
  id: string;
  title: string;
  position: 'top' | 'middle' | 'sidebar' | 'footer';
  enabled: boolean;
  htmlContent: string;
}

export interface SiteData {
  profile: ArtistProfile;
  tracks: TrackItem[];
  videos: VideoItem[];
  blog: BlogPostItem[];
  menu: MenuLink[];
  socials: SocialLink[];
  template: TemplateConfig;
  customBlocks: CustomBlock[];
}

export interface EqualizerBand {
  frequency: number;
  label: string;
  roleFa: string;
  type: 'lowshelf' | 'peaking' | 'highshelf';
  gain: number; // -12 to +12 dB
}

export interface EqualizerPreset {
  id: string;
  nameFa: string;
  nameEn: string;
  gains: [number, number, number, number, number]; // [60Hz, 230Hz, 910Hz, 3.6kHz, 14kHz]
}

export const DEFAULT_EQ_BANDS: EqualizerBand[] = [
  { frequency: 60, label: '60 Hz', roleFa: 'ساب‌بیس عمیق (Sub)', type: 'lowshelf', gain: 0 },
  { frequency: 230, label: '230 Hz', roleFa: 'گرمای بیس و بدنه (Warmth)', type: 'peaking', gain: 0 },
  { frequency: 910, label: '910 Hz', roleFa: 'وضوح میدرنج و سازها (Mid)', type: 'peaking', gain: 0 },
  { frequency: 3600, label: '3.6 kHz', roleFa: 'حضور وکال و خواننده (Vocal)', type: 'peaking', gain: 0 },
  { frequency: 14000, label: '14 kHz', roleFa: 'شفافیت و هوای استودیویی (Air)', type: 'highshelf', gain: 0 },
];

export const EQ_PRESETS: EqualizerPreset[] = [
  {
    id: 'flat',
    nameFa: 'استودیو فلت (مرجع)',
    nameEn: 'Flat Studio Reference',
    gains: [0, 0, 0, 0, 0],
  },
  {
    id: 'vocal-presence',
    nameFa: 'وکال گرم و شفاف',
    nameEn: 'Vocal Presence & Air',
    gains: [-1, 1.5, 2.5, 4.5, 3],
  },
  {
    id: 'acoustic-lounge',
    nameFa: 'آکوستیک و پیانو شبانه',
    nameEn: 'Nocturnal Acoustic',
    gains: [2, 3, -1, 2.5, 4],
  },
  {
    id: 'deep-stage',
    nameFa: 'بیس عمیق و سینمایی',
    nameEn: 'Deep Stage Bass',
    gains: [6, 4.5, -1.5, 2, 3.5],
  },
  {
    id: 'master-brilliance',
    nameFa: 'مسترینگ طلایی (Hi-Fi)',
    nameEn: 'Gold Master Hi-Fi',
    gains: [3.5, 2, 0.5, 3, 5.5],
  },
];

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'obsidian-gold',
    name: 'طلایی ابسیدین (پوسته اصلی مصطفی شیری)',
    mode: 'dark',
    bgMain: '#050505',
    bgCard: '#080808',
    bgSurface: '#0d0b08',
    colorGold: '#d6b36c',
    colorBorder: '#29231a',
    textMain: '#f7f7f7',
    textMuted: '#aaaaaa',
  },
  {
    id: 'royal-velvet',
    name: 'مخمل شاهانه و برنز شبانه',
    mode: 'dark',
    bgMain: '#08060c',
    bgCard: '#100c18',
    bgSurface: '#161122',
    colorGold: '#e2b86b',
    colorBorder: '#2d233e',
    textMain: '#f9f6ff',
    textMuted: '#a99ebd',
  },
  {
    id: 'emerald-studio',
    name: 'استودیو آنالوگ زمرد و طلا',
    mode: 'dark',
    bgMain: '#040907',
    bgCard: '#08120e',
    bgSurface: '#0d1b15',
    colorGold: '#d4af37',
    colorBorder: '#1d352b',
    textMain: '#f2f9f6',
    textMuted: '#94afa3',
  },
  {
    id: 'ivory-gallery',
    name: 'گالری عاجی روشن (Light Studio)',
    mode: 'light',
    bgMain: '#f5f5f7',
    bgCard: '#ffffff',
    bgSurface: '#f0f0f2',
    colorGold: '#a67c2e',
    colorBorder: '#e2d9cd',
    textMain: '#1d1d1f',
    textMuted: '#555555',
  },
];

export const DEFAULT_SITE_DATA: SiteData = {
  profile: {
    nameFa: 'مصطفی شیری',
    nameEn: 'MOSTAFA SHIRI',
    monogram: 'MS',
    roleTitle: 'خواننده · آهنگساز · تنظیم‌کننده',
    shortBio:
      'خالق ملودی‌های شبانه و روایتگر احساسات عمیق انسانی در قالب موسیقی پاپ-آکوستیک و ارکسترال مدرن؛ جایی که تمام مراحل آهنگسازی، تنظیم و تولید صدا با وسواس استودیویی توسط خود هنرمند شکل می‌گیرد.',
    fullBio:
      'مصطفی شیری (Mostafa Shiri) خواننده، آهنگساز و تنظیم‌کننده مستقل موسیقی است که فعالیت حرفه‌ای خود را با تمرکز بر تلفیق فضای آکوستیک گرم، هارمونی‌های پیانو و تنظیم‌های مدرن استودیویی آغاز کرد. ویژگی شاخص آثار او، تولید صفر تا صد قطعات در استودیوی شخصی است؛ از نگارش خط ملودی و طراحی صدای سازهای زهی و آکوستیک تا میکس و مسترینگ نهایی، تا هر اثر امضای صوتی منحصربه‌فرد و صادقانه خود را حفظ کند.',
    studioName: 'Mostafa Shiri Personal Studio',
    location: 'تهران، ایران',
    contactEmail: 'info@mostafashiri.ir',
    instagramHandle: '@mostafashiri.music',
    telegramHandle: '@mostafashiri_official',
  },
  tracks: [
    {
      id: 'trk-1',
      title: 'شب‌های بارانی تهران',
      subtitle: 'تک‌آهنگ رسمی · تنظیم پیانو و ارکستر زهی',
      category: 'single',
      slug: 'shabhaye-barani-tehran',
      image: '/src/assets/images/album_cover_golden_night_1794140915037.jpg',
      audio: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
      duration: '03:42',
      releaseDate: '۱۴۰۵/۰۱/۱۵',
      bpm: 78,
      musicalKey: 'C Minor',
      arrangement: 'مصطفی شیری',
      mixMaster: 'استودیو شخصی مصطفی شیری',
      plays: 18420,
      lyrics: `در امتدادِ خیسِ چراغ‌های شهر
صدایِ قدم‌های تو در باران می‌پیچد
هر کلاویه‌ی پیانو، خاطراتی از پاییز را
به آغوشِ شب‌های بی‌پایان می‌سپارد...

برگرد تا دوباره از سکوتِ این اتاق
آوازی به رنگِ طلا و باران بسازیم
وقتی که شهر در غبارِ خاطره خاموش است
تنها صدایِ توست که راهِ خانه را می‌شناسد.`,
    },
    {
      id: 'trk-2',
      title: 'افقِ تنهایی',
      subtitle: 'تک‌آهنگ آکوستیک · گیتار و وکال استودیویی',
      category: 'single',
      slug: 'ofoghe-tanhaei',
      image: '/src/assets/images/album_cover_acoustic_horizon_1794140917043.jpg',
      audio: 'https://cdn.pixabay.com/download/audio/2022/10/25/audio_946b0939c8.mp3?filename=inspiring-cinematic-ambient-116199.mp3',
      duration: '04:15',
      releaseDate: '۱۴۰۴/۱۱/۲۸',
      bpm: 84,
      musicalKey: 'A Minor',
      arrangement: 'مصطفی شیری',
      mixMaster: 'مصطفی شیری (Mastering Analog Chain)',
      plays: 14950,
      lyrics: `رو به دریایِ خاموش، کنارِ ساحلِ سرد
سایه‌ای از روزهایِ رفته بر موج‌ها می‌رقصد
با هر سیمِ گیتار، زخمی کهنه بیدار می‌شود
و باد نامِ تو را تا دورترین افق می‌برد...

من مانده‌ام و نغمه‌ای که تنها برای تو سروده شد
در ساعتی که خورشید در طلایِ غروب آرام می‌گیرد.`,
    },
    {
      id: 'trk-3',
      title: 'سایه‌روشنِ پیانو',
      subtitle: 'همکاری ویژه · دوئت پیانو و سولوی ویولنسل',
      category: 'collaboration',
      slug: 'sayeh-roshan-piano',
      image: '/src/assets/images/album_cover_piano_shadow_1794140917298.jpg',
      audio: 'https://cdn.pixabay.com/download/audio/2022/08/02/audio_884fe92c21.mp3?filename= emotional-piano-115950.mp3',
      duration: '03:58',
      releaseDate: '۱۴۰۴/۰۹/۱۰',
      bpm: 72,
      musicalKey: 'F# Minor',
      arrangement: 'مصطفی شیری',
      mixMaster: 'مصطفی شیری',
      plays: 11380,
      lyrics: `میانِ نور و سایه، رویِ عاجِ سفیدِ کلاویه‌ها
حرف‌هایی هست که هیچ واژه‌ای توانِ گفتنش را ندارد
بگذار امشب فقط ملودی سخن بگوید
از روزهایی که در سکوتِ استودیو به یادِ تو گذشت.`,
    },
    {
      id: 'trk-4',
      title: 'امواجِ طلایی',
      subtitle: 'قطعه سینمایی و الکترونیک-آکوستیک',
      category: 'single',
      slug: 'amvaje-talaei',
      image: '/src/assets/images/album_cover_liquid_gold_wave_1794140919166.jpg',
      audio: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-piano-logo-10711.mp3',
      duration: '03:24',
      releaseDate: '۱۴۰۴/۰۷/۰۵',
      bpm: 92,
      musicalKey: 'D Minor',
      arrangement: 'مصطفی شیری',
      mixMaster: 'مصطفی شیری',
      plays: 12640,
      lyrics: `امواجی از نور در تاریکیِ مطلق می‌درخشند
هر فرکانس، تپشِ قلبی است که برای موسیقی می‌زند
از اعماقِ سکوت تا اوجِ آسمان
این صدایِ جاودانگیِ احساسِ ماست.`,
    },
  ],
  videos: [
    {
      id: 'vid-1',
      title: 'اجرای زنده استودیویی قطعه «شب‌های بارانی تهران»',
      subtitle: 'ضبط آنالوگ در استودیو شخصی · نسخه ۴K Master',
      slug: 'live-studio-shabhaye-barani',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      posterUrl: '/src/assets/images/hero_singer_studio_banner_1794140914800.jpg',
      duration: '00:15',
      releaseDate: '۱۴۰۵/۰۱/۲۰',
      quality: '4K STUDIO MASTER',
      director: 'مصطفی شیری',
      description:
        'اجرای زنده و بدون واسطه در فضای استودیو شخصی با میکروفون کاندنسر لامپ خلا و پیانو گرند، با میکس مستقیم استریو.',
    },
    {
      id: 'vid-2',
      title: 'پشت صحنه تنظیم و طراحی صدای «افق تنهایی»',
      subtitle: 'نگاهی به فرآیند خلق اثر، لایه‌بندی آکوستیک و میکس',
      slug: 'behind-the-scenes-ofoghe-tanhaei',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      posterUrl: '/src/assets/images/album_cover_acoustic_horizon_1794140917043.jpg',
      duration: '00:15',
      releaseDate: '۱۴۰۴/۱۲/۰۵',
      quality: '1080p HD',
      director: 'استودیو مصطفی شیری',
      description:
        'بررسی نحوه صدابرداری گیتار آکوستیک، پردازش اکولایزر آنالوگ و ایجاد فضای سه‌بعدی در میکس نهایی قطعه افق تنهایی.',
    },
  ],
  blog: [
    {
      id: 'post-1',
      title: 'چرا تمام مراحل آهنگسازی، تنظیم و میکس آثارم را خودم انجام می‌دهم؟',
      slug: 'why-i-produce-my-own-music',
      category: 'یادداشت استودیویی',
      date: '۱۴۰۵/۰۱/۱۸',
      readingTime: '۴ دقیقه مطالعه',
      coverImage: '/src/assets/images/hero_singer_studio_banner_1794140914800.jpg',
      audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
      excerpt:
        'وقتی یک خواننده خودش پشت میز تنظیم و کنسول میکس می‌نشیند، مرز میان احساسِ خواندن و رنگِ آکوستیک سازها از میان برداشته می‌شود.',
      content: `برای من موسیقی هرگز یک خط تولید صنعتی نبوده است که در آن ترانه، ملودی، تنظیم و میکس در اتاق‌های جداگانه و بی‌خبر از هم شکل بگیرند. از نخستین لحظه‌ای که پشت پیانو می‌نشینم و نطفه‌ی یک ملودی شکل می‌گیرد، رنگِ صداییِ آن قطعه، جنسِ ریوربِ وکال و حتی فرکانس‌های ساب‌بیس را در ذهنم می‌شنوم.

وقتی تنظیم و میکس اثر را خودم در استودیو انجام می‌دهم، هر ساز دقیقاً در خدمتِ حسِ جملاتِ آوازی قرار می‌گیرد. دیگر نیازی نیست به تنظیم‌کننده توضیح دهم که در فلان مصرع چقدر سکوت یا حسرت نهفته است؛ بلکه مستقیماً با انتخابِ آکوردها و داینامیکِ زهی‌ها، همان تصویرِ ذهنی را به واقعیتِ شنیداری تبدیل می‌کنم.

در پلیر اختصاصی همین وب‌سایت نیز اکولایزر ۵ بانده استودیویی را تعبیه کرده‌ام تا شما شنوندگانِ دقیق بتوانید رنگِ فرکانسی هر اثر را متناسب با هدفون یا سیستم صوتی خودتان تنظیم و تجربه کنید.`,
    },
    {
      id: 'post-2',
      title: 'داستان شکل‌گیری تک‌آهنگ «شب‌های بارانی تهران» در یک نیمه‌شب پاییزی',
      slug: 'story-of-shabhaye-barani-tehran',
      category: 'پشت صحنه آثار',
      date: '۱۴۰۴/۱۲/۲۲',
      readingTime: '۳ دقیقه مطالعه',
      coverImage: '/src/assets/images/album_cover_golden_night_1794140915037.jpg',
      excerpt:
        'روایت شبِ بارانی و خلوتی که خط اصلی پیانوی این قطعه تنها در یک برداشت زنده (One-Take) ضبط شد.',
      content: `بعضی قطعات ماه‌ها در استودیو ویرایش می‌شوند، اما «شب‌های بارانی تهران» در ساعت سه بامداد یک شب بارانی متولد شد. میکروفون‌های استریوی اتاق را روشن گذاشته بودم و صدای واقعی باران پشت پنجره استودیو با طنینِ پیانو ترکیب شد.

تصمیم گرفتم همان برداشت اولِ پیانو و وکالِ اولیه را حفظ کنم تا نفس‌های واقعی و لرزشِ صادقانه‌ی صدا زیر تیغِ ادیت‌های ماشینی از بین نرود. امیدوارم هنگام شنیدن این اثر با هدفون، گرمای آن شب را لمس کنید.`,
    },
  ],
  menu: [
    { id: 'm-1', title: 'خانه', link: '#home' },
    { id: 'm-2', title: 'آثار صوتی', link: '#tracks-section' },
    { id: 'm-3', title: 'موزیک‌ویدیوها', link: '#videos-section' },
    { id: 'm-4', title: 'یادداشت‌ها و وبلاگ', link: '#blog-section' },
    { id: 'm-5', title: 'درباره مصطفی شیری', link: '#about-section' },
  ],
  socials: [
    { id: 's-1', platform: 'Instagram', label: 'اینستاگرام رسمی', url: 'https://instagram.com' },
    { id: 's-2', platform: 'Telegram', label: 'کانال تلگرام', url: 'https://t.me' },
    { id: 's-3', platform: 'YouTube', label: 'یوتیوب رسمی', url: 'https://youtube.com' },
    { id: 's-4', platform: 'Spotify', label: 'اسپاتیفای', url: 'https://spotify.com' },
  ],
  template: {
    activePresetId: 'obsidian-gold',
    bgMain: '#050505',
    bgCard: '#080808',
    bgSurface: '#0d0b08',
    colorGold: '#d6b36c',
    colorBorder: '#29231a',
    gridColumns: 2,
    enable3DTilt: true,
    enableCursorGlow: true,
    enableHeroParticles: true,
    desktopBannerUrl: '/src/assets/images/hero_singer_studio_banner_1794140914800.jpg',
    mobileBannerUrl: '/src/assets/images/hero_singer_studio_banner_1794140914800.jpg',
    showCustomTemplateBlock: true,
    customRozblogTemplate: `<div class="rozblog-custom-banner">
  <h4>[artist-name] — [artist-role]</h4>
  <p>مجموع آثار منتشرشده در آرشیو رسمی: <strong>[tracks-count] قطعه استودیویی</strong> و <strong>[videos-count] ویدیو</strong> • استودیو: [studio-name]</p>
</div>`,
  },
  customBlocks: [
    {
      id: 'blk-1',
      title: 'اطلاعیه کنسرت و انتشار آلبوم جدید',
      position: 'top',
      enabled: true,
      htmlContent:
        'نسخه مسترینگ استودیویی تک‌آهنگ «شب‌های بارانی تهران» هم‌اکنون با قابلیت تنظیم اکولایزر ۵ بانده در دسترس است.',
    },
  ],
};

/**
 * Pure helper: creates a URL-safe slug from Persian or Latin text
 */
export function createSlug(input: string): string {
  const cleaned = (input || '')
    .trim()
    .toLowerCase()
    .replace(/[^\u0600-\u06FFa-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return cleaned || `item-${Date.now()}`;
}

/**
 * Pure helper: clamps equalizer band gain strictly within [-12, +12] dB
 */
export function clampEqGain(gainDb: number): number {
  if (Number.isNaN(gainDb)) return 0;
  return Math.max(-12, Math.min(12, Math.round(gainDb * 2) / 2));
}

/**
 * Pure helper: formats seconds into MM:SS with zero padding
 */
export function formatTimecode(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const totalSecs = Math.floor(seconds);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Pure helper: Rozblog Template Tag Compiler
 * Replaces Rozblog-style tags like [artist-name], [tracks-count], [latest-track], etc.
 */
export function compileRozblogTemplate(templateHtml: string, siteData: SiteData): string {
  if (!templateHtml) return '';
  const latestTrack = siteData.tracks[0]?.title || '—';
  const replacements: Record<string, string> = {
    '[site-title]': `${siteData.profile.nameFa} | وب‌سایت رسمی`,
    '[artist-name]': siteData.profile.nameFa,
    '[artist-name-en]': siteData.profile.nameEn,
    '[artist-role]': siteData.profile.roleTitle,
    '[studio-name]': siteData.profile.studioName,
    '[tracks-count]': String(siteData.tracks.length),
    '[videos-count]': String(siteData.videos.length),
    '[blog-count]': String(siteData.blog.length),
    '[latest-track]': latestTrack,
  };

  let output = templateHtml;
  for (const [tag, val] of Object.entries(replacements)) {
    output = output.split(tag).join(val);
  }
  return output;
}

/**
 * Pure helper: Filter tracks by category and search query
 */
export function filterTracks(
  tracks: TrackItem[],
  category: 'all' | TrackCategory,
  searchQuery = ''
): TrackItem[] {
  const q = searchQuery.trim().toLowerCase();
  return tracks.filter((t) => {
    const matchesCat = category === 'all' || t.category === category;
    if (!matchesCat) return false;
    if (!q) return true;
    return (
      t.title.toLowerCase().includes(q) ||
      t.subtitle.toLowerCase().includes(q) ||
      t.lyrics.toLowerCase().includes(q)
    );
  });
}

/**
 * Pure helper: Validates uploaded file size against limit (in bytes)
 */
export function validateUploadSize(fileSizeBytes: number, maxMb: number): { valid: boolean; error?: string } {
  const maxBytes = maxMb * 1024 * 1024;
  if (fileSizeBytes <= 0) {
    return { valid: false, error: 'فایل انتخاب‌شده خالی است.' };
  }
  if (fileSizeBytes > maxBytes) {
    return {
      valid: false,
      error: `حجم فایل بیش از حد مجاز (${maxMb} مگابایت) است. لطفاً از لینک مستقیم استفاده کنید.`,
    };
  }
  return { valid: true };
}
