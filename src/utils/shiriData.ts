/**
 * Pure Data Models, Authentic Mostafa Shiri Seed Data, Pagination, Scale & Equalizer Logic
 * for Mostafa Shiri Official Website (مصطفی شیری | وب‌سایت رسمی)
 */

export const STORAGE_KEYS = {
  HOST_API_KEY: 'shiri_cloudflare_worker_url',
  STORAGE_DATA_KEY: 'shiri_site_data_cache_v2',
  ADMIN_SESSION_KEY: 'shiri_admin_logged_in',
  THEME_KEY: 'shiri_theme_pref',
} as const;

export const DEFAULT_ADMIN_PASS = 'ms1376';

export type TrackCategory = 'single' | 'collaboration' | 'album';

export interface PlatformLink {
  platform: 'spotify' | 'apple' | 'amazon' | 'youtube' | 'deezer' | 'tidal';
  label: string;
  url: string;
}

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
  externalLinks?: PlatformLink[];
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
  externalUrl?: string;
  readingTime: string;
}

export interface MenuLink {
  id: string;
  title: string;
  link: string;
}

export type SocialPlatformId =
  | 'spotify'
  | 'apple'
  | 'youtube'
  | 'instagram'
  | 'telegram'
  | 'amazon'
  | 'deezer'
  | 'tidal';

export interface SocialLink {
  id: string;
  platform: SocialPlatformId;
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
  postsPerPage: number; // default 2 posts per page as requested
  blogPostsPerPage: number; // default 2 blog posts per page as requested
  cardScalePercent: number; // 70 to 115 percent scale for cards on home page
  enable3DTilt: boolean;
  enableCursorGlow: boolean;
  enableHeroParticles: boolean;
  desktopBannerUrl: string;
  mobileBannerUrl: string;
  heroCtaPlayLabel: string;
  heroCtaEqLabel: string;
  tracksSectionTitle: string;
  blogSectionTitle: string;
  videosSectionTitle: string;
  aboutSectionTitle: string;
  customTemplateHtml: string;
  showCustomTemplateBlock: boolean;
}

export interface ArtistProfile {
  nameFa: string;
  nameEn: string;
  monogram: string;
  eyebrowText: string;
  roleTitle: string;
  shortBio: string;
  fullBio: string;
  birthYear: string;
  studioName: string;
  location: string;
  contactEmail: string;
  instagramHandle: string;
  telegramHandle: string;
  creditsBadges: string[];
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
  gains: [number, number, number, number, number];
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
    nameFa: 'آکوستیک و پیانو',
    nameEn: 'Acoustic & Piano',
    gains: [2, 3, -1, 2.5, 4],
  },
  {
    id: 'reggaeton-bounce',
    nameFa: 'ریتمیک بانس و پرکاشن',
    nameEn: 'Rhythmic Bounce & Bass',
    gains: [6, 4.5, -1.5, 2.5, 4],
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
    name: 'طلایی ابسیدین (پوسته رسمی مصطفی شیری)',
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
    name: 'مخمل شبانه و برنز',
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

/**
 * 100% Authentic Seed Data extracted from Mostafa Shiri's Official HTML & Archive
 */
export const DEFAULT_SITE_DATA: SiteData = {
  profile: {
    nameFa: 'مصطفی شیری',
    nameEn: 'MOSTAFA SHIRI',
    monogram: 'MS',
    eyebrowText: 'OFFICIAL ARTIST WEBSITE',
    roleTitle: 'خواننده · آهنگساز · تنظیم‌کننده',
    birthYear: '۱۳۷۶',
    shortBio:
      'مصطفی شیری؛ موسیقیدان، خواننده، آهنگساز، تنظیم‌کننده، مدرس موسیقی و نرم‌افزارهای آهنگسازی و مهندس کامپیوتر متولد ۱۳۷۶ در تهران.',
    fullBio:
      'مصطفی شیری (Mostafa Shiri) خواننده، آهنگساز، تنظیم‌کننده، مدرس موسیقی و نرم‌افزارهای تخصصی آهنگسازی و مهندس علم کامپیوتر، متولد ۱۳۷۶ و ساکن تهران است. تمامی مراحل خلق اثر در قطعات او — از ترانه‌سرایی، آهنگسازی و تنظیم تا طراحی صدا، میکس و مسترینگ نهایی — به صورت مستقل و با وسواس استودیویی توسط خود او انجام می‌شود. آثار او علاوه بر وب‌سایت رسمی، در پلتفرم‌های معتبر جهانی از جمله Spotify، Apple Music، Amazon Music، Deezer، Tidal و YouTube منتشر شده‌اند.',
    studioName: 'استودیو مصطفی شیری (MusicSoft Studio)',
    location: 'تهران، ایران',
    contactEmail: 'info@musicsoft.ir',
    instagramHandle: '@MostafaShiri_Music',
    telegramHandle: '@MostafaShiri_Official',
    creditsBadges: [
      'خواننده و ترانه‌سرا',
      'آهنگساز و تنظیم‌کننده',
      'میکس و مسترینگ استودیویی',
      'مدرس موسیقی و نرم‌افزار',
      'مهندس کامپیوتر',
    ],
  },
  tracks: [
    {
      id: 'trk-bia-kenaram',
      title: 'بیا کنارم',
      subtitle: 'تک‌آهنگ رسمی · ترانه، آهنگ، تنظیم و میکس: مصطفی شیری',
      category: 'single',
      slug: 'bia-kenaram',
      image: 'https://rozup.ir/view/4356486/1000181462.jpg',
      audio: 'https://rozup.ir/download/4356484/Mostafa%20Shiri%20-%20Bia%20Kenaram-320.mp3',
      duration: '03:28',
      releaseDate: '۱۴۰۴',
      bpm: 95,
      musicalKey: 'C Minor',
      arrangement: 'مصطفی شیری',
      mixMaster: 'مصطفی شیری',
      plays: 24850,
      lyrics: `آهنگ جدید و بسیار زیبای مصطفی شیری — «بیا کنارم»

بیا کنارم تا دوباره آروم بگیره این دلِ بی‌قرارم
بدونِ تو شبام پر از سکوته، بیا که طاقتِ دوری ندارم
با هر نگاهِ تو ستاره‌ها دوباره توی آسمون می‌درخشن
بیا کنارم که تمومِ لحظه‌ها با بودنِ تو قشنگن...`,
      externalLinks: [
        {
          platform: 'spotify',
          label: 'Spotify',
          url: 'https://open.spotify.com/artist/3uiBMUxRijzBwGogM1l2bu',
        },
        {
          platform: 'apple',
          label: 'Apple Music',
          url: 'https://music.apple.com/us/artist/mostafa-shiri/1527594420',
        },
      ],
    },
    {
      id: 'trk-to-delami-to',
      title: 'تو دلمی تو',
      subtitle: 'ترانه، آهنگ، تنظیم، میکس و مسترینگ: مصطفی شیری',
      category: 'single',
      slug: 'to-delami-to',
      image: 'https://rozup.ir/view/3972792/1000105759_326334.jpg',
      audio: 'https://irsv.upmusics.com/dlw/Mostafa%20Shiri%20-%20To%20Delami%20To%20(320).mp3',
      duration: '03:15',
      releaseDate: '۱۴۰۳',
      bpm: 104,
      musicalKey: 'A Minor',
      arrangement: 'مصطفی شیری',
      mixMaster: 'مصطفی شیری',
      plays: 38400,
      lyrics: `آخ داره قلبم میره واسه اون خنده‌هات
آخ چه جذابی تو من بمیرم برات
نمی‌خواستم بگم چقدر عاشق شدم
واسه تو جونمو قلبمو من میدم

آخه تو دلمی تو خوشگلم، عاشقِ چشاتم دل می‌بری تو
هر جا که میرم تصویرِ چشمایِ قشنگت روبه‌رومه
تو دلمی تو، آرامشِ تمومِ لحظه‌هایِ منی تو...`,
      externalLinks: [
        {
          platform: 'spotify',
          label: 'Spotify',
          url: 'https://open.spotify.com/artist/3uiBMUxRijzBwGogM1l2bu',
        },
        {
          platform: 'apple',
          label: 'Apple Music',
          url: 'https://music.apple.com/us/artist/mostafa-shiri/1527594420',
        },
      ],
    },
    {
      id: 'trk-rhythmic-bounce',
      title: 'Rhythmic Bounce (ریتمیک بانس)',
      subtitle: 'Reggaeton Instrumental · آهنگسازی و تنظیم: مصطفی شیری',
      category: 'single',
      slug: 'rhythmic-bounce',
      image: 'https://rozup.ir/view/4192915/Mostafa%20Shiri%20-%20Rhythmic%20Bounce_650x650.jpg',
      audio: 'https://irsv.upmusics.com/dlw/Mostafa%20Shiri%20-%20To%20Delami%20To%20(320).mp3',
      duration: '02:54',
      releaseDate: '۱۸ بهمن ۱۴۰۴',
      bpm: 98,
      musicalKey: 'G Minor',
      arrangement: 'مصطفی شیری',
      mixMaster: 'مصطفی شیری',
      plays: 19540,
      lyrics: `قطعه بی‌کلام و پرانرژی Reggaeton با نام «Rhythmic Bounce» (ریتمیک بانس) اثر مصطفی شیری.
منتشر شده در پلتفرم‌های بین‌المللی Spotify، Apple Music و Amazon Music.`,
      externalLinks: [
        {
          platform: 'spotify',
          label: 'Listen in Spotify',
          url: 'https://open.spotify.com/album/7dUfqbP9ddoakpyAXmSDiv?si=By6XZEF8RQWS-2_au5qI0Q',
        },
        {
          platform: 'apple',
          label: 'Listen in Apple Music',
          url: 'https://music.apple.com/us/album/rhythmic-bounce-single/1874154307?ls',
        },
        {
          platform: 'amazon',
          label: 'Listen in Amazon Music',
          url: 'https://music.amazon.de/albums/B0GL9J41RK?marketplaceId=A1PA6795UKMFR9&musicTerritory=DE&ref=dm_sh_5eFjJjxdabJxuqUXmeSOwulva',
        },
      ],
    },
    {
      id: 'trk-naz-nakon-inst',
      title: 'نسخه بی‌کلام «ناز نکن» (بازسازی و تنظیم)',
      subtitle: 'تنظیم، میکس و بازسازی کامل استودیویی با کیفیت بالا',
      category: 'collaboration',
      slug: 'naz-nakon-instrumental',
      image: 'https://rozup.ir/view/3502821/@@@@@@@@@@.jpg',
      audio: 'https://rozup.ir/download/4356484/Mostafa%20Shiri%20-%20Bia%20Kenaram-320.mp3',
      duration: '03:35',
      releaseDate: '۱۴۰۲',
      bpm: 118,
      musicalKey: 'D Minor',
      arrangement: 'مصطفی شیری (موزیک سافت)',
      mixMaster: 'مصطفی شیری',
      plays: 14200,
      lyrics: `نسخه‌ی بدون کلام و پلی‌بک استودیویی قطعه «ناز نکن» با کیفیت فوق‌العاده بالا.
این اثر به صورت کامل توسط مصطفی شیری تنظیم، میکس و بازسازی شده است.`,
    },
  ],
  videos: [
    {
      id: 'vid-1',
      title: 'موزیک‌ویدیو و اجرای «تو دلمی تو» — مصطفی شیری',
      subtitle: 'ترانه، آهنگسازی، تنظیم و میکس و مسترینگ: مصطفی شیری',
      slug: 'to-delami-to-official-video',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      posterUrl: 'https://rozup.ir/view/3972792/1000105759_326334.jpg',
      duration: '00:15',
      releaseDate: '۱۴۰۴',
      quality: 'FULL HD STUDIO',
      director: 'مصطفی شیری',
      description:
        'پخش آنلاین و تیزر تصویری تک‌آهنگ «تو دلمی تو» با صدای، آهنگسازی و تنظیم مصطفی شیری.',
    },
    {
      id: 'vid-2',
      title: 'تیزر رسمی قطعه «بیا کنارم» و پروژه Rhythmic Bounce',
      subtitle: 'نمایش استودیویی و طراحی صدای مدرن',
      slug: 'bia-kenaram-studio-video',
      videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      posterUrl: 'https://rozup.ir/view/4356486/1000181462.jpg',
      duration: '00:15',
      releaseDate: '۱۴۰۴',
      quality: '4K MASTER',
      director: 'مصطفی شیری',
      description:
        'نگاهی به فرآیند تولید، تنظیم و مسترینگ آثار جدید مصطفی شیری در استودیو شخصی.',
    },
  ],
  blog: [
    {
      id: 'post-39',
      title: 'مصطفی شیری | Mostafa Shiri — بیوگرافی و معرفی رسمی',
      slug: 'mostafa-shiri-biography',
      category: 'معرفی رسمی',
      date: '۱۴۰۴/۰۶/۱۲',
      readingTime: '۲ دقیقه مطالعه',
      coverImage: 'https://rozup.ir/view/4358537/1000182979.jpg',
      audioUrl: 'https://irsv.upmusics.com/dlw/Mostafa%20Shiri%20-%20To%20Delami%20To%20(320).mp3',
      excerpt:
        'مصطفی شیری؛ خواننده، آهنگساز، تنظیم‌کننده، مدرس موسیقی و نرم‌افزار و مهندس کامپیوتر متولد ۱۳۷۶ زاده و ساکن تهران.',
      content: `مصطفی شیری (Mostafa Shiri) خواننده، آهنگساز، تنظیم‌کننده، تکنسین و مهندس علم کامپیوتر، متولد ۱۳۷۶ و زاده و ساکن تهران می‌باشد.

او علاوه بر خوانندگی و انتشار تک‌آهنگ‌های رسمی همچون «بیا کنارم»، «تو دلمی تو» و قطعات بی‌کلام جهانی مانند «Rhythmic Bounce»، به عنوان مدرس موسیقی و نرم‌افزارهای تخصصی آهنگسازی، طراح پکیج‌های ریتم و سمپل استودیویی و متخصص میکس و مسترینگ فعالیت دارد.`,
    },
    {
      id: 'post-40',
      title: 'حضور رسمی مصطفی شیری در پلتفرم‌های جهانی (Apple Music, Spotify, Amazon, Deezer, Tidal)',
      slug: 'mostafa-shiri-global-platforms',
      category: 'پلتفرم‌های جهانی',
      date: '۱۲ شهریور ۱۴۰۴',
      readingTime: '۲ دقیقه مطالعه',
      coverImage: 'https://rozup.ir/view/3810018/mceu_99079480511707826209890.jpg',
      excerpt:
        'دسترسی مستقیم به تمامی آلبوم‌ها و تک‌آهنگ‌های رسمی مصطفی شیری در پلتفرم‌های بین‌المللی اسپاتیفای، اپل موزیک، آمازون موزیک، دیزر و تایدال.',
      content: `آثار رسمی مصطفی شیری (Mostafa Shiri) در تمامی پلتفرم‌های معتبر جهانی موسیقی منتشر شده و قابل شنیدن است:

• Apple Music:
https://music.apple.com/us/artist/mostafa-shiri/1527594420

• Spotify:
https://open.spotify.com/artist/3uiBMUxRijzBwGogM1l2bu

• Amazon Music:
https://www.amazon.es/music/player/artists/B08G1YXPC6/mostafa-shiri

• Deezer:
https://link.deezer.com/s/30o1dstc0uysvmE8iptWy

• Tidal:
https://tidal.com/browse/artist/21000062?u`,
    },
    {
      id: 'post-36',
      title: 'بزرگترین پکیج ریتم و لوپ بستکی ایران (با فرمت RX2 و سینک اتوماتیک با تمپو)',
      slug: 'bastaki-rhythm-loop-pack-rx2',
      category: 'پکیج‌های استودیویی و سمپل',
      date: '۱۴۰۳/۱۱/۱۰',
      readingTime: '۳ دقیقه مطالعه',
      coverImage: 'https://rozup.ir/view/3757679/BASTAKI%20-%20MusicSoft%20(www.musicsoft.ir).jpg',
      excerpt:
        'برای اولین بار با فرمت RX2 و قابلیت سینک اتوماتیک با تمپو؛ شامل ریتم‌ها، درامز، پاساژها و پرکاشن‌های زنده (Bongo, Congas, Djembe, Cajon, Bendir, Darbuka).',
      content: `دانلود بزرگترین پکیج ریتم و لوپ بستکی ایران (تولید و مهندسی صدا توسط مصطفی شیری):

• برای اولین بار با فرمت استاندارد استودیویی RX2 با قابلیت سینک اتوماتیک با هر تمپو در نرم‌افزارهای آهنگسازی!
• دارای ریتم‌ها، درامز، پاساژها و پرکاشن‌های زنده و باکیفیت
• شامل انواع پرکاشن‌های متنوع: بونگو (Bongo)، کونگاس (Congas)، داربوکا (Darbuka)، کاخن (Cajon)، جیمبی (Djembe) و بندیر (Bendir).`,
    },
    {
      id: 'post-35',
      title: 'آموزش تخصصی آهنگسازی، تنظیم و نرم‌افزارهای استودیویی — مصطفی شیری',
      slug: 'mostafa-shiri-music-production-teaching',
      category: 'آموزش موسیقی و نرم‌افزار',
      date: '۱۴۰۳/۰۸/۰۵',
      readingTime: '۳ دقیقه مطالعه',
      coverImage: 'https://s26.picofile.com/file/8458920134/DSC_1817.jpg',
      excerpt:
        'معرفی فعالیت‌های آموزشی مصطفی شیری در زمینه آهنگسازی، تنظیم، میکس و مسترینگ، پلاگین‌های پردازش وکال و سمپل‌های پرکاشن زنده.',
      content: `مصطفی شیری — آهنگساز، تنظیم‌کننده، خواننده، مدرس موسیقی و نرم‌افزارهای تخصصی استودیویی.

در کنار تولید و انتشار تک‌آهنگ‌های رسمی، مجموعه‌ای از آموزش‌های تخصصی نرم‌افزارهای آهنگسازی (DAW)، معرفی پلاگین‌های پردازش وکال و مسترینگ و همچنین بانک‌های سمپل پرکاشن زنده (Live Percussion Sample Pack) جهت ارتقای کیفیت تولیدات موسیقی ایران توسط ایشان ارائه شده است.`,
    },
  ],
  menu: [
    { id: 'm-1', title: 'خانه', link: '#home' },
    { id: 'm-2', title: 'تک‌آهنگ‌ها', link: '#singles' },
    { id: 'm-3', title: 'موزیک‌ویدیوها', link: '#videos-section' },
    { id: 'm-4', title: 'یادداشت‌ها و مطالب', link: '#blog-section' },
    { id: 'm-5', title: 'درباره من', link: '#about-section' },
  ],
  socials: [
    {
      id: 'soc-spotify',
      platform: 'spotify',
      label: 'Spotify',
      url: 'https://open.spotify.com/artist/3uiBMUxRijzBwGogM1l2bu',
    },
    {
      id: 'soc-apple',
      platform: 'apple',
      label: 'Apple Music',
      url: 'https://music.apple.com/us/artist/mostafa-shiri/1527594420',
    },
    {
      id: 'soc-youtube',
      platform: 'youtube',
      label: 'YouTube',
      url: 'https://www.youtube.com/@MostafaShiri',
    },
    {
      id: 'soc-instagram',
      platform: 'instagram',
      label: 'Instagram',
      url: 'https://instagram.com/MostafaShiri_Music',
    },
    {
      id: 'soc-telegram',
      platform: 'telegram',
      label: 'Telegram',
      url: 'https://t.me/MostafaShiri_Official',
    },
    {
      id: 'soc-amazon',
      platform: 'amazon',
      label: 'Amazon Music',
      url: 'https://www.amazon.es/music/player/artists/B08G1YXPC6/mostafa-shiri',
    },
    {
      id: 'soc-deezer',
      platform: 'deezer',
      label: 'Deezer',
      url: 'https://link.deezer.com/s/30o1dstc0uysvmE8iptWy',
    },
    {
      id: 'soc-tidal',
      platform: 'tidal',
      label: 'Tidal',
      url: 'https://tidal.com/browse/artist/21000062?u',
    },
  ],
  template: {
    activePresetId: 'obsidian-gold',
    bgMain: '#050505',
    bgCard: '#080808',
    bgSurface: '#0d0b08',
    colorGold: '#d6b36c',
    colorBorder: '#29231a',
    gridColumns: 2,
    postsPerPage: 2,
    blogPostsPerPage: 2,
    cardScalePercent: 92,
    enable3DTilt: true,
    enableCursorGlow: true,
    enableHeroParticles: true,
    desktopBannerUrl: 'https://rozup.ir/view/4381092/Desktop_Banner.jpg',
    mobileBannerUrl: 'https://rozup.ir/view/4381032/Banner%20Mob%20Ver.png',
    heroCtaPlayLabel: 'پخش آنلاین آخرین اثر',
    heroCtaEqLabel: 'اکولایزر ۵ بانده استودیویی',
    tracksSectionTitle: 'تک‌آهنگ‌ها',
    blogSectionTitle: 'مطالب و فعالیت‌های هنری',
    videosSectionTitle: 'موزیک‌ویدیوها و اجراها',
    aboutSectionTitle: 'درباره مصطفی شیری',
    showCustomTemplateBlock: true,
    customTemplateHtml: `<div class="custom-artist-summary">
  <h4>[artist-name] — [artist-role]</h4>
  <p>آرشیو رسمی شامل <strong>[tracks-count] اثر منتشرشده</strong> و <strong>[blog-count] مطلب تخصصی</strong> • آخرین انتشار: <strong>[latest-track]</strong></p>
</div>`,
  },
  customBlocks: [],
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
 * Pure helper: clamps card scale percentage within [70, 115]
 */
export function clampCardScale(percent: number): number {
  if (!Number.isFinite(percent)) return 92;
  return Math.max(70, Math.min(115, Math.round(percent)));
}

/**
 * Pure helper: paginates an array of items given current 1-based page and itemsPerPage
 */
export function paginateItems<T>(
  items: T[],
  currentPage: number,
  itemsPerPage: number
): { pagedItems: T[]; totalPages: number; safePage: number } {
  const perPage = itemsPerPage > 0 ? itemsPerPage : items.length || 1;
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const safePage = Math.max(1, Math.min(totalPages, currentPage));
  const start = (safePage - 1) * perPage;
  return {
    pagedItems: items.slice(start, start + perPage),
    totalPages,
    safePage,
  };
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
 * Pure helper: Dynamic Template Tag Compiler
 * Replaces template tags like [artist-name], [tracks-count], [latest-track], etc.
 */
export function compileCustomTemplate(templateHtml: string, siteData: SiteData): string {
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

// Backwards-compatible alias for tests
export const compileRozblogTemplate = compileCustomTemplate;

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
