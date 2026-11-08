/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * سرویس داده‌های پادکست، نغمه‌های رساله و قطعات صوتی پیوستار آکوستیک
 * ارتباط مستقیم با پایگاه داده KV و مدیریت اختصاصی
 * مؤلف: ایمان برزجان | استودیو اینامیکس (EnamiX)
 */

export interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  audioUrl: string;
  durationSeconds: number;
  durationFormatted: string;
  fileSizeMb?: number;
  chapterId?: string;
  chapterTitle?: string;
  speaker: string;
  recordedDate: string;
  isPublished: boolean;
  stationRegion?: 'iran_plateau' | 'alans_steppes' | 'mesopotamia' | 'danube_basin';
  createdAt?: string;
  updatedAt?: string;
}

export const FALLBACK_PODCASTS: PodcastEpisode[] = [
  {
    id: 'pod_iran_plateau_origin',
    title: 'نغمه‌های کهن فلات ایران: سنتور، نی و مبانی هندسه ردیف',
    description: 'تحلیل صوتی و پژوهشی ایستگاه مبدأ فلات ایران، با ارتعاشات سنتور استاد حبیب سماعی و نوای نی کسایی، سازگاری واخوان‌ها و تثبیت درجات شور.',
    audioUrl: 'https://cdn.freesound.org/previews/562/562852_5674468-lq.mp3',
    durationSeconds: 195,
    durationFormatted: '۰۳:۱۵',
    fileSizeMb: 3.8,
    chapterId: 'ch1',
    chapterTitle: 'فصل اول: جهان صوتی ایرانی-دانوبی و پیوستار آکوستیک',
    speaker: 'ایمان برزجان',
    recordedDate: '۱۵ مهر ۱۴۰۵',
    isPublished: true,
    stationRegion: 'iran_plateau',
    createdAt: '2026-10-06T10:00:00Z',
    updatedAt: '2026-10-06T10:00:00Z'
  },
  {
    id: 'pod_alans_steppes_hora',
    title: 'مسیر سکاها و آلان‌ها: هورای باستانی و تبادلات کمانچه قفقاز',
    description: 'واکاوی ریتم‌های دایره‌ای، طنین آرشه‌های موی دم اسب و گذار سازهای زهی مالشی از استپ‌های شمالی به بالکان.',
    audioUrl: 'https://cdn.freesound.org/previews/450/450634_5121236-lq.mp3',
    durationSeconds: 240,
    durationFormatted: '۰۴:۰۰',
    fileSizeMb: 4.6,
    chapterId: 'ch2',
    chapterTitle: 'فصل دوم: انطباق تطبیقی دستگاه‌ها و گام‌های ماژور/مینور',
    speaker: 'ایمان برزجان',
    recordedDate: '۲۲ مهر ۱۴۰۵',
    isPublished: true,
    stationRegion: 'alans_steppes',
    createdAt: '2026-10-13T10:00:00Z',
    updatedAt: '2026-10-13T10:00:00Z'
  },
  {
    id: 'pod_mesopotamia_kaval',
    title: 'میان‌راهی بین‌النهرین و آناتولی: کاوال چوپانی و تسامبال زهی',
    description: 'چگونه فلوت بدون دهنی کاوال و سنتور مسافرتی تسامبال در قهوه‌خانه‌های استانبول و دجله و فرات هویت مشترک پیدا کردند.',
    audioUrl: 'https://cdn.freesound.org/previews/612/612610_11861866-lq.mp3',
    durationSeconds: 210,
    durationFormatted: '۰۳:۳۰',
    fileSizeMb: 4.1,
    chapterId: 'ch3',
    chapterTitle: 'فصل سوم: سیستم فواصل پنج‌گانه هرمز فرهت',
    speaker: 'ایمان برزجان',
    recordedDate: '۳۰ مهر ۱۴۰۵',
    isPublished: true,
    stationRegion: 'mesopotamia',
    createdAt: '2026-10-21T10:00:00Z',
    updatedAt: '2026-10-21T10:00:00Z'
  },
  {
    id: 'pod_danube_lautari',
    title: 'مقصد دانوب و حوضه کارپات: رقص لنگ لوتاری‌های رومانی',
    description: 'بررسی رقص‌های لنگ و آکساک ۷/۸ و ۱۱/۸ تاراف‌ها و راماهای حاشیه دانوب و پیوند آکوستیک با اوزان عروضی کهن ایران.',
    audioUrl: 'https://cdn.freesound.org/previews/518/518305_2402876-lq.mp3',
    durationSeconds: 285,
    durationFormatted: '۰۴:۴۵',
    fileSizeMb: 5.5,
    chapterId: 'ch4',
    chapterTitle: 'فصل چهارم: فیزیک صوتی و تشدید هارمونیک‌ها',
    speaker: 'ایمان برزجان',
    recordedDate: '۸ آبان ۱۴۰۵',
    isPublished: true,
    stationRegion: 'danube_basin',
    createdAt: '2026-10-29T10:00:00Z',
    updatedAt: '2026-10-29T10:00:00Z'
  }
];

const LOCAL_STORAGE_KEY = 'pardehnegar_podcasts_cache';

export async function fetchPodcasts(): Promise<PodcastEpisode[]> {
  try {
    const res = await fetch('/api/podcasts');
    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.podcasts) && data.podcasts.length > 0) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data.podcasts));
        }
        return data.podcasts;
      }
    }
  } catch (err) {
    console.warn('[podcastData] API fetch failed, falling back:', err);
  }

  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        // ignore
      }
    }
  }

  return FALLBACK_PODCASTS;
}

export async function createPodcastEpisode(data: Partial<PodcastEpisode>, adminPass: string): Promise<PodcastEpisode> {
  const res = await fetch('/api/podcasts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': adminPass,
    },
    body: JSON.stringify(data),
  });

  const resData = await res.json();
  if (!res.ok || !resData.success) {
    throw new Error(resData.message || 'خطا در ثبت قطعه صوتی جدید.');
  }

  return resData.podcast;
}

export async function updatePodcastEpisode(id: string, updates: Partial<PodcastEpisode>, adminPass: string): Promise<PodcastEpisode> {
  const res = await fetch(`/api/podcasts/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': adminPass,
    },
    body: JSON.stringify(updates),
  });

  const resData = await res.json();
  if (!res.ok || !resData.success) {
    throw new Error(resData.message || 'خطا در ویرایش قطعه صوتی.');
  }

  return resData.podcast;
}

export async function deletePodcastEpisode(id: string, adminPass: string): Promise<boolean> {
  const res = await fetch(`/api/podcasts/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': adminPass,
    },
  });

  const resData = await res.json();
  if (!res.ok || !resData.success) {
    throw new Error(resData.message || 'خطا در حذف قطعه صوتی.');
  }

  return true;
}

export async function resetPodcasts(adminPass: string): Promise<PodcastEpisode[]> {
  const res = await fetch('/api/podcasts/reset', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': adminPass,
    },
  });

  const resData = await res.json();
  if (!res.ok || !resData.success) {
    throw new Error(resData.message || 'خطا در بازنشانی فهرست صوتی.');
  }

  return resData.podcasts;
}
