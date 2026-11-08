import React, { useState } from 'react';
import {
  LayoutDashboard,
  Music,
  Video,
  FileText,
  Palette,
  Cloud,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  Save,
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  AlertCircle,
  Lock,
  Sparkles,
  Code2,
  Eye,
} from 'lucide-react';
import {
  SiteData,
  TrackItem,
  TrackCategory,
  VideoItem,
  BlogPostItem,
  THEME_PRESETS,
  DEFAULT_SITE_DATA,
  DEFAULT_ADMIN_PASS,
  STORAGE_KEYS,
  createSlug,
  validateUploadSize,
} from '../../utils/shiriData';

interface RozblogAdminPanelProps {
  siteData: SiteData;
  onUpdateSiteData: (newData: SiteData, statusMessage?: string) => Promise<void>;
  onCloseAdmin: () => void;
}

type AdminTab = 'dashboard' | 'tracks' | 'videos' | 'blog' | 'template' | 'cloud';

/**
 * Full Rozblog-Inspired CMS & Template Builder Panel for Mostafa Shiri Official Website.
 */
export const RozblogAdminPanel: React.FC<RozblogAdminPanelProps> = ({
  siteData,
  onUpdateSiteData,
  onCloseAdmin,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION_KEY) === 'true';
  });
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [authError, setAuthError] = useState<string>('');

  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Track Editor Form State
  const [editingTrackId, setEditingTrackId] = useState<string | null>(null);
  const [trackTitle, setTrackTitle] = useState('');
  const [trackSubtitle, setTrackSubtitle] = useState('');
  const [trackCategory, setTrackCategory] = useState<TrackCategory>('single');
  const [trackSlug, setTrackSlug] = useState('');
  const [trackImage, setTrackImage] = useState('');
  const [trackAudio, setTrackAudio] = useState('');
  const [trackDuration, setTrackDuration] = useState('03:30');
  const [trackReleaseDate, setTrackReleaseDate] = useState('۱۴۰۵/۰۱/۲۵');
  const [trackArrangement, setTrackArrangement] = useState('مصطفی شیری');
  const [trackMixMaster, setTrackMixMaster] = useState('استودیو شخصی مصطفی شیری');
  const [trackLyrics, setTrackLyrics] = useState('');

  // Video Editor Form State
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoSubtitle, setVideoSubtitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoPoster, setVideoPoster] = useState('');
  const [videoQuality, setVideoQuality] = useState('4K STUDIO MASTER');
  const [videoDirector, setVideoDirector] = useState('مصطفی شیری');
  const [videoDescription, setVideoDescription] = useState('');

  // Blog Post Editor Form State
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState('یادداشت استودیویی');
  const [postExcerpt, setPostExcerpt] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCover, setPostCover] = useState('');
  const [postAudioUrl, setPostAudioUrl] = useState('');

  // Menu Link Form State
  const [newMenuTitle, setNewMenuTitle] = useState('');
  const [newMenuLink, setNewMenuLink] = useState('');

  // Custom Block Form State
  const [newBlockTitle, setNewBlockTitle] = useState('');
  const [newBlockHtml, setNewBlockHtml] = useState('');

  // Cloudflare Worker URL State
  const [workerUrl, setWorkerUrl] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.HOST_API_KEY) || '';
  });

  const showNotice = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    const candidate = passwordInput.trim();
    if (candidate === DEFAULT_ADMIN_PASS) {
      sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION_KEY, 'true');
      setIsAuthenticated(true);
      return;
    }
    try {
      const res = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: candidate }),
      });
      if (res.ok) {
        sessionStorage.setItem(STORAGE_KEYS.ADMIN_SESSION_KEY, 'true');
        setIsAuthenticated(true);
        return;
      }
    } catch {
      // ignore network error
    }
    setAuthError('رمز عبور وارد شده اشتباه است! (رمز پیش‌فرض طبق فایل مرجع: ms1376)');
  };

  const handleLogout = () => {
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION_KEY);
    setIsAuthenticated(false);
    setPasswordInput('');
  };

  // Base64 File Upload Helper matching Reference HTML (<1.5MB Image, <2MB Audio)
  const handleFileUpload = (
    file: File | undefined,
    maxMb: number,
    onResult: (base64: string) => void
  ) => {
    if (!file) return;
    const check = validateUploadSize(file.size, maxMb);
    if (!check.valid) {
      showNotice(check.error || 'حجم فایل بیش از حد مجاز است.', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onResult(reader.result);
        showNotice(`فایل «${file.name}» با موفقیت بارگذاری و آماده ذخیره شد.`);
      }
    };
    reader.readAsDataURL(file);
  };

  // --- Track CRUD ---
  const resetTrackForm = () => {
    setEditingTrackId(null);
    setTrackTitle('');
    setTrackSubtitle('');
    setTrackCategory('single');
    setTrackSlug('');
    setTrackImage('');
    setTrackAudio('');
    setTrackDuration('03:30');
    setTrackReleaseDate('۱۴۰۵/۰۱/۲۵');
    setTrackArrangement('مصطفی شیری');
    setTrackMixMaster('استودیو شخصی مصطفی شیری');
    setTrackLyrics('');
  };

  const handleSaveTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackTitle.trim()) {
      showNotice('لطفاً عنوان قطعه موسیقی را وارد کنید.', 'error');
      return;
    }
    const finalSlug = trackSlug.trim() ? createSlug(trackSlug) : createSlug(trackTitle);
    const newItem: TrackItem = {
      id: editingTrackId || `trk-${Date.now()}`,
      title: trackTitle.trim(),
      subtitle: trackSubtitle.trim() || 'تک‌آهنگ رسمی · مصطفی شیری',
      category: trackCategory,
      slug: finalSlug,
      image: trackImage.trim() || '/src/assets/images/album_cover_golden_night_1794140915037.jpg',
      audio:
        trackAudio.trim() ||
        'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
      duration: trackDuration.trim() || '03:30',
      releaseDate: trackReleaseDate.trim() || '۱۴۰۵',
      arrangement: trackArrangement.trim() || 'مصطفی شیری',
      mixMaster: trackMixMaster.trim() || 'مصطفی شیری',
      lyrics: trackLyrics.trim(),
      plays: editingTrackId
        ? siteData.tracks.find((t) => t.id === editingTrackId)?.plays || 1200
        : 1000,
    };

    const nextTracks = editingTrackId
      ? siteData.tracks.map((t) => (t.id === editingTrackId ? newItem : t))
      : [newItem, ...siteData.tracks];

    await onUpdateSiteData(
      { ...siteData, tracks: nextTracks },
      editingTrackId ? 'قطعه موسیقی با موفقیت ویرایش شد.' : 'قطعه جدید با موفقیت منتشر شد.'
    );
    showNotice(editingTrackId ? 'قطعه موسیقی ویرایش شد.' : 'قطعه جدید به آرشیو اضافه شد.');
    resetTrackForm();
  };

  const startEditTrack = (t: TrackItem) => {
    setEditingTrackId(t.id);
    setTrackTitle(t.title);
    setTrackSubtitle(t.subtitle);
    setTrackCategory(t.category);
    setTrackSlug(t.slug);
    setTrackImage(t.image);
    setTrackAudio(t.audio);
    setTrackDuration(t.duration);
    setTrackReleaseDate(t.releaseDate);
    setTrackArrangement(t.arrangement);
    setTrackMixMaster(t.mixMaster);
    setTrackLyrics(t.lyrics);
  };

  const handleDeleteTrack = async (id: string) => {
    const nextTracks = siteData.tracks.filter((t) => t.id !== id);
    await onUpdateSiteData({ ...siteData, tracks: nextTracks }, 'قطعه از آرشیو حذف شد.');
    showNotice('قطعه مورد نظر حذف شد.');
  };

  // --- Video CRUD ---
  const resetVideoForm = () => {
    setEditingVideoId(null);
    setVideoTitle('');
    setVideoSubtitle('');
    setVideoUrl('');
    setVideoPoster('');
    setVideoQuality('4K STUDIO MASTER');
    setVideoDirector('مصطفی شیری');
    setVideoDescription('');
  };

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim() || !videoUrl.trim()) {
      showNotice('عنوان ویدیو و لینک مستقیم فایل (.mp4) الزامی است.', 'error');
      return;
    }
    const newVideo: VideoItem = {
      id: editingVideoId || `vid-${Date.now()}`,
      title: videoTitle.trim(),
      subtitle: videoSubtitle.trim() || 'اجرای رسمی استودیویی',
      slug: createSlug(videoTitle),
      videoUrl: videoUrl.trim(),
      posterUrl:
        videoPoster.trim() || '/src/assets/images/hero_singer_studio_banner_1794140914800.jpg',
      duration: '02:30',
      releaseDate: '۱۴۰۵/۰۱/۲۵',
      quality: videoQuality.trim() || '1080p HD',
      director: videoDirector.trim() || 'مصطفی شیری',
      description: videoDescription.trim(),
    };

    const nextVideos = editingVideoId
      ? siteData.videos.map((v) => (v.id === editingVideoId ? newVideo : v))
      : [newVideo, ...siteData.videos];

    await onUpdateSiteData({ ...siteData, videos: nextVideos });
    showNotice(editingVideoId ? 'موزیک‌ویدیو ویرایش شد.' : 'موزیک‌ویدیو جدید منتشر شد.');
    resetVideoForm();
  };

  const handleDeleteVideo = async (id: string) => {
    const nextVideos = siteData.videos.filter((v) => v.id !== id);
    await onUpdateSiteData({ ...siteData, videos: nextVideos });
    showNotice('ویدیو حذف شد.');
  };

  // --- Blog Post CRUD ---
  const resetPostForm = () => {
    setEditingPostId(null);
    setPostTitle('');
    setPostCategory('یادداشت استودیویی');
    setPostExcerpt('');
    setPostContent('');
    setPostCover('');
    setPostAudioUrl('');
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) {
      showNotice('عنوان و متن اصلی مطلب وبلاگ الزامی است.', 'error');
      return;
    }
    const newPost: BlogPostItem = {
      id: editingPostId || `post-${Date.now()}`,
      title: postTitle.trim(),
      slug: createSlug(postTitle),
      category: postCategory.trim() || 'یادداشت هنری',
      date: '۱۴۰۵/۰۱/۲۵',
      readingTime: '۳ دقیقه مطالعه',
      excerpt: postExcerpt.trim() || postContent.trim().slice(0, 140) + '...',
      content: postContent.trim(),
      coverImage:
        postCover.trim() || '/src/assets/images/hero_singer_studio_banner_1794140914800.jpg',
      audioUrl: postAudioUrl.trim() || undefined,
    };

    const nextBlog = editingPostId
      ? siteData.blog.map((p) => (p.id === editingPostId ? newPost : p))
      : [newPost, ...siteData.blog];

    await onUpdateSiteData({ ...siteData, blog: nextBlog });
    showNotice(editingPostId ? 'مطلب وبلاگ ویرایش شد.' : 'مطلب جدید در وبلاگ منتشر شد.');
    resetPostForm();
  };

  const handleDeletePost = async (id: string) => {
    const nextBlog = siteData.blog.filter((p) => p.id !== id);
    await onUpdateSiteData({ ...siteData, blog: nextBlog });
    showNotice('مطلب وبلاگ حذف شد.');
  };

  // --- Password Gate Screen ---
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-16 px-4">
        <div className="rounded-3xl bg-[var(--bg-card)] border border-[var(--color-gold)]/50 p-8 shadow-2xl text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[var(--color-gold)]/15 border border-[var(--color-gold)]/40 flex items-center justify-center text-[var(--color-gold)]">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-[var(--text-main)] mb-2">
            ورود به پنل مدیریت رزبلاگ
          </h2>
          <p className="text-xs text-[var(--text-muted)] mb-6 leading-relaxed">
            سامانه مدیریت یکپارچه آثار صوتی، موزیک‌ویدیوها، وبلاگ و ویرایشگر زنده قالب اختصاصی مصطفی شیری
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="رمز عبور مدیریت (پیش‌فرض: ms1376)"
              dir="ltr"
              className="w-full px-4 py-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)] focus:border-[var(--color-gold)] text-center text-[var(--text-main)] outline-none font-mono-num"
            />
            {authError && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg py-2 px-3">
                {authError}
              </p>
            )}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[var(--color-gold)] text-[#050505] font-bold text-sm hover:bg-[var(--color-gold-hover)] transition-colors cursor-pointer"
            >
              ورود به میز کار مدیریت
            </button>
          </form>

          <button
            type="button"
            onClick={onCloseAdmin}
            className="mt-5 text-xs text-[var(--text-muted)] hover:text-[var(--color-gold)] cursor-pointer"
          >
            بازگشت به صفحه اصلی سایت
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Top Admin Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--color-gold)]/45 p-5 mb-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-[var(--color-gold)] text-[#050505] flex items-center justify-center font-cinzel font-black text-lg">
            MS
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-black text-[var(--text-main)]">
              پنل مدیریت جامع رزبلاگ · وب‌سایت رسمی مصطفی شیری
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              مدیریت تک‌آهنگ‌ها، موزیک‌ویدیوها، مطالب وبلاگ، ویرایشگر قالب و اتصال ابری کلودفلر
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onCloseAdmin}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[var(--color-gold)] text-[#050505] font-bold text-xs hover:bg-[var(--color-gold-hover)] cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>مشاهده زنده سایت</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs font-semibold cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>خروج</span>
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`mb-6 flex items-center gap-2.5 px-4 py-3.5 rounded-xl border text-sm font-semibold ${
            toast.type === 'success'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
              : 'bg-red-500/15 border-red-500/40 text-red-300'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Main Rozblog Sidebar + Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Rozblog Style Right Navigation Sidebar */}
        <aside className="lg:col-span-3 space-y-2">
          {[
            { id: 'dashboard', label: 'پیشخوان و آمار سایت', icon: LayoutDashboard },
            { id: 'tracks', label: `مدیریت آثار صوتی (${siteData.tracks.length})`, icon: Music },
            { id: 'videos', label: `مدیریت موزیک‌ویدیوها (${siteData.videos.length})`, icon: Video },
            { id: 'blog', label: `مطالب و یادداشت‌ها (${siteData.blog.length})`, icon: FileText },
            { id: 'template', label: 'قالب‌ساز و ویرایشگر پوسته', icon: Palette },
            { id: 'cloud', label: 'پروفایل، کلودفلر و پشتیبان', icon: Cloud },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id as AdminTab)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-right text-sm font-bold transition-all cursor-pointer border ${
                  active
                    ? 'bg-[var(--color-gold)] text-[#050505] border-[var(--color-gold)] shadow-lg'
                    : 'bg-[var(--bg-card)] text-[var(--text-main)] border-[var(--color-border)] hover:border-[var(--color-gold)]/50'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Active Module Workspace */}
        <div className="lg:col-span-9 rounded-2xl bg-[var(--bg-card)] border border-[var(--color-border)] p-6">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-[var(--color-gold)] border-b border-[var(--color-border)] pb-3">
                پیشخوان مدیریت و وضعیت سامانه رزبلاگ
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)]">
                  <span className="text-xs text-[var(--text-muted)]">تک‌آهنگ‌ها و آثار</span>
                  <p className="font-mono-num text-2xl font-black text-[var(--color-gold)] mt-1">
                    {siteData.tracks.length}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)]">
                  <span className="text-xs text-[var(--text-muted)]">موزیک‌ویدیوها</span>
                  <p className="font-mono-num text-2xl font-black text-[var(--color-gold)] mt-1">
                    {siteData.videos.length}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)]">
                  <span className="text-xs text-[var(--text-muted)]">یادداشت‌های وبلاگ</span>
                  <p className="font-mono-num text-2xl font-black text-[var(--color-gold)] mt-1">
                    {siteData.blog.length}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)]">
                  <span className="text-xs text-[var(--text-muted)]">مجموع پخش استودیویی</span>
                  <p className="font-mono-num text-2xl font-black text-[var(--color-gold)] mt-1">
                    {siteData.tracks.reduce((acc, t) => acc + (t.plays || 0), 0).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)] p-5 space-y-3">
                <h4 className="text-sm font-bold text-[var(--text-main)]">
                  دسترسی سریع به ماژول‌های کلیدی رزبلاگ
                </h4>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('tracks')}
                    className="px-4 py-2.5 rounded-xl bg-[var(--color-gold)] text-[#050505] font-bold text-xs cursor-pointer"
                  >
                    + انتشار تک‌آهنگ جدید
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('videos')}
                    className="px-4 py-2.5 rounded-xl border border-[var(--color-gold)]/50 text-[var(--color-gold)] font-bold text-xs cursor-pointer"
                  >
                    + افزودن موزیک‌ویدیو
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('template')}
                    className="px-4 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--text-main)] hover:border-[var(--color-gold)] font-bold text-xs cursor-pointer"
                  >
                    ویرایشگر پوسته و قالب رزبلاگ
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TRACKS MANAGER */}
          {activeTab === 'tracks' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-[var(--color-gold)] border-b border-[var(--color-border)] pb-3 mb-4">
                  {editingTrackId ? 'ویرایش قطعه موسیقی' : 'افزودن تک‌آهنگ یا اثر جدید'}
                </h3>

                <form onSubmit={handleSaveTrack} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                        نام اثر (الزامی)
                      </label>
                      <input
                        type="text"
                        value={trackTitle}
                        onChange={(e) => setTrackTitle(e.target.value)}
                        placeholder="مثلاً: شب‌های بارانی تهران"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)] text-sm text-[var(--text-main)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                        زیرعنوان / توضیح کوتاه
                      </label>
                      <input
                        type="text"
                        value={trackSubtitle}
                        onChange={(e) => setTrackSubtitle(e.target.value)}
                        placeholder="مثلاً: تک‌آهنگ رسمی · تنظیم پیانو و زهی"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)] text-sm text-[var(--text-main)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                        دسته‌بندی اثر
                      </label>
                      <select
                        value={trackCategory}
                        onChange={(e) => setTrackCategory(e.target.value as TrackCategory)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)] text-sm text-[var(--text-main)]"
                      >
                        <option value="single">تک‌آهنگ (Single)</option>
                        <option value="collaboration">همکاری مشترک (Collaboration)</option>
                        <option value="album">آلبوم (Album Track)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                        نامک لینک اختصاصی (Slug)
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={trackSlug}
                        onChange={(e) => setTrackSlug(e.target.value)}
                        placeholder="shabhaye-barani"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)] text-sm text-[var(--text-main)] font-mono-num"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                        مدت زمان و تاریخ انتشار
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          dir="ltr"
                          value={trackDuration}
                          onChange={(e) => setTrackDuration(e.target.value)}
                          placeholder="03:45"
                          className="px-3 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)] text-xs font-mono-num"
                        />
                        <input
                          type="text"
                          value={trackReleaseDate}
                          onChange={(e) => setTrackReleaseDate(e.target.value)}
                          placeholder="۱۴۰۵/۰۱/۲۰"
                          className="px-3 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)] text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cover Image URL + Upload */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[var(--bg-surface)]/60 border border-[var(--color-border)]">
                    <div>
                      <label className="block text-xs text-[var(--color-gold)] font-semibold mb-1.5">
                        تصویر کاver (لینک مستقیم یا آپلود فایل تا ۱.۵ مگابایت)
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={trackImage}
                        onChange={(e) => setTrackImage(e.target.value)}
                        placeholder="https://...jpg"
                        className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--color-border)] text-xs mb-2"
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleFileUpload(e.target.files?.[0], 1.5, (b64) => setTrackImage(b64))
                        }
                        className="text-xs text-[var(--text-muted)] file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[var(--color-gold)] file:text-[#050505] file:font-bold file:cursor-pointer"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-[var(--color-gold)] font-semibold mb-1.5">
                        فایل صوتی MP3/M4A (لینک مستقیم یا آپلود فایل تا ۲ مگابایت)
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={trackAudio}
                        onChange={(e) => setTrackAudio(e.target.value)}
                        placeholder="https://...mp3"
                        className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--color-border)] text-xs mb-2"
                      />
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={(e) =>
                          handleFileUpload(e.target.files?.[0], 2, (b64) => setTrackAudio(b64))
                        }
                        className="text-xs text-[var(--text-muted)] file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[var(--color-gold)] file:text-[#050505] file:font-bold file:cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Credits */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                        تنظیم‌کننده
                      </label>
                      <input
                        type="text"
                        value={trackArrangement}
                        onChange={(e) => setTrackArrangement(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                        میکس و مسترینگ
                      </label>
                      <input
                        type="text"
                        value={trackMixMaster}
                        onChange={(e) => setTrackMixMaster(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)] text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                      متن کامل ترانه (Lyrics)
                    </label>
                    <textarea
                      rows={4}
                      value={trackLyrics}
                      onChange={(e) => setTrackLyrics(e.target.value)}
                      placeholder="متن ترانه را وارد کنید..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)] text-sm"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-gold)] text-[#050505] font-bold text-sm hover:bg-[var(--color-gold-hover)] cursor-pointer"
                    >
                      <Save className="w-4 h-4" />
                      <span>{editingTrackId ? 'ذخیره تغییرات اثر' : 'انتشار اثر در سایت'}</span>
                    </button>
                    {editingTrackId && (
                      <button
                        type="button"
                        onClick={resetTrackForm}
                        className="px-4 py-3 rounded-xl border border-[var(--color-border)] text-xs text-[var(--text-muted)] cursor-pointer"
                      >
                        انصراف از ویرایش
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Existing Tracks List */}
              <div>
                <h4 className="text-sm font-bold text-[var(--text-main)] mb-3">
                  فهرست آثار منتشرشده ({siteData.tracks.length})
                </h4>
                <div className="space-y-2.5">
                  {siteData.tracks.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)]"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={t.image}
                          alt={t.title}
                          className="w-12 h-12 rounded-lg object-cover border border-[var(--color-gold)]/40 shrink-0"
                        />
                        <div className="min-w-0">
                          <h5 className="text-sm font-bold text-[var(--text-main)] truncate">
                            {t.title}
                          </h5>
                          <p className="text-xs text-[var(--text-muted)] truncate">
                            {t.subtitle} · {t.releaseDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEditTrack(t)}
                          className="p-2 rounded-lg border border-[var(--color-border)] text-[var(--color-gold)] hover:bg-[var(--color-gold)]/10 cursor-pointer"
                          title="ویرایش"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTrack(t.id)}
                          className="p-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VIDEOS MANAGER */}
          {activeTab === 'videos' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-[var(--color-gold)] border-b border-[var(--color-border)] pb-3 mb-4">
                  مدیریت موزیک‌ویدیوها و اجراهای زنده (پلیر اختصاصی ویدیو)
                </h3>
                <form onSubmit={handleSaveVideo} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                        عنوان موزیک‌ویدیو
                      </label>
                      <input
                        type="text"
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        placeholder="مثلاً: اجرای استودیویی قطعه افق تنهایی"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                        زیرعنوان ویدیو
                      </label>
                      <input
                        type="text"
                        value={videoSubtitle}
                        onChange={(e) => setVideoSubtitle(e.target.value)}
                        placeholder="مثلاً: ضبط زنده در استودیو شخصی"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)] text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[var(--color-gold)] font-semibold mb-1.5">
                        لینک مستقیم فایل ویدیو (.mp4 / .webm)
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        placeholder="https://.../video.mp4"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)] text-xs font-mono-num"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                        لینک تصویر کاور ویدیو (Poster)
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={videoPoster}
                        onChange={(e) => setVideoPoster(e.target.value)}
                        placeholder="https://.../poster.jpg"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)] text-xs font-mono-num"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                        کیفیت پخش (نشان پلیر)
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={videoQuality}
                        onChange={(e) => setVideoQuality(e.target.value)}
                        placeholder="4K STUDIO MASTER"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)] text-xs font-mono-num"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                        کارگردان هنری / تهیه‌کننده
                      </label>
                      <input
                        type="text"
                        value={videoDirector}
                        onChange={(e) => setVideoDirector(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)] text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                      توضیحات تکمیلی ویدیو
                    </label>
                    <textarea
                      rows={3}
                      value={videoDescription}
                      onChange={(e) => setVideoDescription(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)] text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-gold)] text-[#050505] font-bold text-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>افزودن ویدیو به پلیر اختصاصی سایت</span>
                  </button>
                </form>
              </div>

              <div className="space-y-2.5">
                {siteData.videos.map((v) => (
                  <div
                    key={v.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)]"
                  >
                    <div>
                      <h5 className="text-sm font-bold text-[var(--text-main)]">{v.title}</h5>
                      <p className="text-xs text-[var(--text-muted)]">
                        {v.subtitle} · {v.quality}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteVideo(v.id)}
                      className="p-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: BLOG POSTS MANAGER */}
          {activeTab === 'blog' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-[var(--color-gold)] border-b border-[var(--color-border)] pb-3 mb-4">
                  مدیریت مطالب وبلاگ و یادداشت‌های استودیویی
                </h3>
                <form onSubmit={handleSavePost} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                        عنوان مطلب یا خبر
                      </label>
                      <input
                        type="text"
                        value={postTitle}
                        onChange={(e) => setPostTitle(e.target.value)}
                        placeholder="عنوان یادداشت..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)] text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                        دسته‌بندی موضوعی
                      </label>
                      <input
                        type="text"
                        value={postCategory}
                        onChange={(e) => setPostCategory(e.target.value)}
                        placeholder="یادداشت استودیویی / خبر انتشار"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)] text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                        لینک تصویر شاخص مطلب
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={postCover}
                        onChange={(e) => setPostCover(e.target.value)}
                        placeholder="https://.../cover.jpg"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                        لینک فایل صوتی پیوست (اختیاری)
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={postAudioUrl}
                        onChange={(e) => setPostAudioUrl(e.target.value)}
                        placeholder="https://.../voice-note.mp3"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)] text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                      خلاصه مطلب (Excerpt)
                    </label>
                    <input
                      type="text"
                      value={postExcerpt}
                      onChange={(e) => setPostExcerpt(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                      متن کامل یادداشت
                    </label>
                    <textarea
                      rows={5}
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)] text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-gold)] text-[#050505] font-bold text-sm cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>انتشار یادداشت در وبلاگ</span>
                  </button>
                </form>
              </div>

              <div className="space-y-2.5">
                {siteData.blog.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)]"
                  >
                    <div>
                      <h5 className="text-sm font-bold text-[var(--text-main)]">{p.title}</h5>
                      <p className="text-xs text-[var(--text-muted)]">
                        {p.category} · {p.date}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeletePost(p.id)}
                      className="p-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: ROZBLOG TEMPLATE & THEME STUDIO */}
          {activeTab === 'template' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-[var(--color-gold)] border-b border-[var(--color-border)] pb-3 mb-4">
                  قالب‌ساز و پوسته‌ساز زنده رزبلاگ (Theme & Template Builder)
                </h3>

                {/* Ready Presets */}
                <label className="block text-xs font-bold text-[var(--text-muted)] mb-2.5">
                  ۱. انتخاب پوسته آماده استودیویی:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {THEME_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={async () => {
                        await onUpdateSiteData({
                          ...siteData,
                          template: {
                            ...siteData.template,
                            activePresetId: preset.id,
                            bgMain: preset.bgMain,
                            bgCard: preset.bgCard,
                            bgSurface: preset.bgSurface,
                            colorGold: preset.colorGold,
                            colorBorder: preset.colorBorder,
                          },
                        });
                        showNotice(`پوسته «${preset.name}» به صورت زنده روی سایت اعمال شد.`);
                      }}
                      className={`flex items-center justify-between p-3.5 rounded-xl border text-right transition-all cursor-pointer ${
                        siteData.template.activePresetId === preset.id
                          ? 'border-[var(--color-gold)] bg-[var(--color-gold)]/10'
                          : 'border-[var(--color-border)] bg-[var(--bg-surface)] hover:border-[var(--color-gold)]/50'
                      }`}
                    >
                      <span className="text-xs font-bold text-[var(--text-main)]">
                        {preset.name}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-5 h-5 rounded-full border border-white/20"
                          style={{ background: preset.bgMain }}
                        />
                        <span
                          className="w-5 h-5 rounded-full border border-white/20"
                          style={{ background: preset.colorGold }}
                        />
                      </div>
                    </button>
                  ))}
                </div>

                {/* Custom Color Pickers */}
                <label className="block text-xs font-bold text-[var(--text-muted)] mb-2.5">
                  ۲. شخصی‌سازی رنگ‌های قالب (اعمال آنی):
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)]">
                    <span className="block text-[11px] text-[var(--text-muted)] mb-1">
                      رنگ طلایی/اکسنت
                    </span>
                    <input
                      type="color"
                      value={siteData.template.colorGold}
                      onChange={(e) =>
                        onUpdateSiteData({
                          ...siteData,
                          template: {
                            ...siteData.template,
                            activePresetId: 'custom',
                            colorGold: e.target.value,
                          },
                        })
                      }
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)]">
                    <span className="block text-[11px] text-[var(--text-muted)] mb-1">
                      پس‌زمینه اصلی
                    </span>
                    <input
                      type="color"
                      value={siteData.template.bgMain}
                      onChange={(e) =>
                        onUpdateSiteData({
                          ...siteData,
                          template: {
                            ...siteData.template,
                            activePresetId: 'custom',
                            bgMain: e.target.value,
                          },
                        })
                      }
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)]">
                    <span className="block text-[11px] text-[var(--text-muted)] mb-1">
                      پس‌زمینه کارت‌ها
                    </span>
                    <input
                      type="color"
                      value={siteData.template.bgCard}
                      onChange={(e) =>
                        onUpdateSiteData({
                          ...siteData,
                          template: {
                            ...siteData.template,
                            activePresetId: 'custom',
                            bgCard: e.target.value,
                          },
                        })
                      }
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                  <div className="p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)]">
                    <span className="block text-[11px] text-[var(--text-muted)] mb-1">
                      چیدمان گرید آثار
                    </span>
                    <select
                      value={siteData.template.gridColumns}
                      onChange={(e) =>
                        onUpdateSiteData({
                          ...siteData,
                          template: {
                            ...siteData.template,
                            gridColumns: Number(e.target.value) as 2 | 3,
                          },
                        })
                      }
                      className="w-full py-1.5 rounded bg-[var(--bg-card)] text-xs text-[var(--text-main)]"
                    >
                      <option value={2}>۲ ستونه (مرجع)</option>
                      <option value={3}>۳ ستونه (گالری)</option>
                    </select>
                  </div>
                </div>

                {/* 3D & 4D Micro-Interactions Toggles */}
                <label className="block text-xs font-bold text-[var(--text-muted)] mb-2.5">
                  ۳. تنظیمات افکت‌های سه‌بعدی و چهاربعدی تعاملی:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                  {[
                    {
                      key: 'enable3DTilt' as const,
                      label: 'چرخش سه‌بعدی کارت‌ها (3D Tilt)',
                    },
                    {
                      key: 'enableCursorGlow' as const,
                      label: 'بازتاب نور طلایی موس و موج کلیک',
                    },
                    {
                      key: 'enableHeroParticles' as const,
                      label: 'ذرات ۴ بعدی موج صوتی هدر',
                    },
                  ].map((fx) => (
                    <label
                      key={fx.key}
                      className="flex items-center gap-2.5 p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)] cursor-pointer text-xs font-semibold"
                    >
                      <input
                        type="checkbox"
                        checked={siteData.template[fx.key]}
                        onChange={(e) =>
                          onUpdateSiteData({
                            ...siteData,
                            template: {
                              ...siteData.template,
                              [fx.key]: e.target.checked,
                            },
                          })
                        }
                        className="accent-[var(--color-gold)] w-4 h-4"
                      />
                      <Sparkles className="w-3.5 h-3.5 text-[var(--color-gold)]" />
                      <span>{fx.label}</span>
                    </label>
                  ))}
                </div>

                {/* Rozblog Template Code & Tag Editor */}
                <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--color-border)] space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-gold)]">
                      <Code2 className="w-4 h-4" />
                      <span>ویرایشگر کد قالب و تگ‌های پویای رزبلاگ</span>
                    </div>
                    <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={siteData.template.showCustomTemplateBlock}
                        onChange={(e) =>
                          onUpdateSiteData({
                            ...siteData,
                            template: {
                              ...siteData.template,
                              showCustomTemplateBlock: e.target.checked,
                            },
                          })
                        }
                        className="accent-[var(--color-gold)]"
                      />
                      <span>نمایش بلوک قالب در صفحه اصلی</span>
                    </label>
                  </div>

                  <p className="text-[11px] text-[var(--text-muted)]">
                    تگ‌های قابل استفاده در کد قالب: <code>[artist-name]</code> ،{' '}
                    <code>[artist-role]</code> ، <code>[tracks-count]</code> ،{' '}
                    <code>[videos-count]</code> ، <code>[latest-track]</code> ،{' '}
                    <code>[studio-name]</code>
                  </p>

                  <textarea
                    rows={4}
                    dir="ltr"
                    value={siteData.template.customRozblogTemplate}
                    onChange={(e) =>
                      onUpdateSiteData({
                        ...siteData,
                        template: {
                          ...siteData.template,
                          customRozblogTemplate: e.target.value,
                        },
                      })
                    }
                    className="w-full p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--color-border)] font-mono-num text-xs text-[var(--text-main)]"
                  />
                </div>

                {/* Menu Links Builder */}
                <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--color-border)] space-y-4">
                  <h4 className="text-xs font-bold text-[var(--color-gold)]">
                    ۴. مدیریت لینک‌های منوی بالای سایت
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="text"
                      value={newMenuTitle}
                      onChange={(e) => setNewMenuTitle(e.target.value)}
                      placeholder="عنوان منو (مثلاً: گالری)"
                      className="flex-1 min-w-[140px] px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--color-border)] text-xs"
                    />
                    <input
                      type="text"
                      dir="ltr"
                      value={newMenuLink}
                      onChange={(e) => setNewMenuLink(e.target.value)}
                      placeholder="#tracks-section"
                      className="flex-1 min-w-[140px] px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--color-border)] text-xs font-mono-num"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        if (!newMenuTitle.trim() || !newMenuLink.trim()) return;
                        const nextMenu = [
                          ...siteData.menu,
                          {
                            id: `m-${Date.now()}`,
                            title: newMenuTitle.trim(),
                            link: newMenuLink.trim(),
                          },
                        ];
                        await onUpdateSiteData({ ...siteData, menu: nextMenu });
                        setNewMenuTitle('');
                        setNewMenuLink('');
                        showNotice('آیتم جدید به منوی هدر اضافه شد.');
                      }}
                      className="px-4 py-2 rounded-lg bg-[var(--color-gold)] text-[#050505] font-bold text-xs cursor-pointer"
                    >
                      + افزودن به منو
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {siteData.menu.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--color-border)] text-xs"
                      >
                        <span>
                          {m.title} (<code className="text-[var(--color-gold)]">{m.link}</code>)
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateSiteData({
                              ...siteData,
                              menu: siteData.menu.filter((x) => x.id !== m.id),
                            })
                          }
                          className="text-red-400 hover:underline cursor-pointer"
                        >
                          حذف
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom Blocks Manager */}
                <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--color-border)] space-y-3 mt-6">
                  <h4 className="text-xs font-bold text-[var(--color-gold)]">
                    ۵. مدیریت بلوک‌های اطلاع‌رسانی و تبلیغاتی رزبلاگ
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newBlockTitle}
                      onChange={(e) => setNewBlockTitle(e.target.value)}
                      placeholder="عنوان بلوک اطلاعیه..."
                      className="px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--color-border)] text-xs"
                    />
                    <input
                      type="text"
                      value={newBlockHtml}
                      onChange={(e) => setNewBlockHtml(e.target.value)}
                      placeholder="متن اطلاعیه بالای سایت..."
                      className="px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--color-border)] text-xs"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!newBlockTitle.trim() || !newBlockHtml.trim()) return;
                      await onUpdateSiteData({
                        ...siteData,
                        customBlocks: [
                          ...siteData.customBlocks,
                          {
                            id: `blk-${Date.now()}`,
                            title: newBlockTitle.trim(),
                            position: 'top',
                            enabled: true,
                            htmlContent: newBlockHtml.trim(),
                          },
                        ],
                      });
                      setNewBlockTitle('');
                      setNewBlockHtml('');
                      showNotice('بلوک جدید اضافه شد.');
                    }}
                    className="px-4 py-2 rounded-lg bg-[var(--color-gold)] text-[#050505] font-bold text-xs cursor-pointer"
                  >
                    + ایجاد بلوک جدید
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: ARTIST PROFILE, CLOUDFLARE KV & BACKUP */}
          {activeTab === 'cloud' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-[var(--color-gold)] border-b border-[var(--color-border)] pb-3 mb-4">
                  بیوگرافی هنرمند، اتصال کلودفلر Worker و پشتیبان‌گیری
                </h3>

                {/* Artist Bio Editor */}
                <div className="space-y-3 mb-6 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)]">
                  <h4 className="text-xs font-bold text-[var(--color-gold)]">
                    مشخصات و بیوگرافی رسمی مصطفی شیری
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={siteData.profile.nameFa}
                      onChange={(e) =>
                        onUpdateSiteData({
                          ...siteData,
                          profile: { ...siteData.profile, nameFa: e.target.value },
                        })
                      }
                      placeholder="نام فارسی"
                      className="px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--color-border)] text-xs"
                    />
                    <input
                      type="text"
                      value={siteData.profile.roleTitle}
                      onChange={(e) =>
                        onUpdateSiteData({
                          ...siteData,
                          profile: { ...siteData.profile, roleTitle: e.target.value },
                        })
                      }
                      placeholder="عنوان هنری"
                      className="px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--color-border)] text-xs"
                    />
                  </div>
                  <textarea
                    rows={3}
                    value={siteData.profile.fullBio}
                    onChange={(e) =>
                      onUpdateSiteData({
                        ...siteData,
                        profile: { ...siteData.profile, fullBio: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--color-border)] text-xs"
                  />
                </div>

                {/* Cloudflare Worker URL Connector matching Reference HTML */}
                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)] space-y-3 mb-6">
                  <h4 className="text-xs font-bold text-[var(--color-gold)]">
                    اتصال به دیتابیس ابری کلودفلر (Cloudflare Worker KV)
                  </h4>
                  <p className="text-xs text-[var(--text-muted)]">
                    علاوه بر ذخیره‌سازی خودکار روی سرور داخلی سایت، در صورت داشتن آدرس Cloudflare Worker شخصی می‌توانید آن را وارد کنید:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="url"
                      dir="ltr"
                      value={workerUrl}
                      onChange={(e) => setWorkerUrl(e.target.value)}
                      placeholder="https://my-site-db.username.workers.dev"
                      className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--color-border)] text-xs font-mono-num"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.setItem(STORAGE_KEYS.HOST_API_KEY, workerUrl.trim());
                        showNotice('آدرس Cloudflare Worker ذخیره شد.');
                      }}
                      className="px-4 py-2 rounded-lg bg-[var(--color-gold)] text-[#050505] font-bold text-xs cursor-pointer"
                    >
                      ثبت و اتصال ابری
                    </button>
                  </div>
                </div>

                {/* JSON Backup Export / Import / Reset */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const blob = new Blob([JSON.stringify(siteData, null, 2)], {
                        type: 'application/json',
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = 'mostafa-shiri-site-backup.json';
                      a.click();
                      URL.revokeObjectURL(url);
                      showNotice('فایل پشتیبان JSON دانلود شد.');
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-gold)]/50 text-[var(--color-gold)] text-xs font-bold cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>دانلود فایل پشتیبان (JSON)</span>
                  </button>

                  <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)] text-[var(--text-main)] text-xs font-bold cursor-pointer">
                    <Upload className="w-4 h-4 text-[var(--color-gold)]" />
                    <span>بازگردانی از فایل پشتیبان</span>
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        const reader = new FileReader();
                        reader.onload = async () => {
                          try {
                            const parsed = JSON.parse(String(reader.result));
                            if (parsed && Array.isArray(parsed.tracks)) {
                              await onUpdateSiteData(parsed);
                              showNotice('اطلاعات سایت از فایل پشتیبان بازیابی شد.');
                            }
                          } catch {
                            showNotice('فایل JSON معتبر نیست.', 'error');
                          }
                        };
                        reader.readAsText(file);
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={async () => {
                      await onUpdateSiteData(DEFAULT_SITE_DATA);
                      showNotice('اطلاعات سایت به حالت پیش‌فرض استودیویی بازنشانی شد.');
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/40 text-red-400 text-xs font-bold cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>بازنشانی به داده‌های پیش‌فرض</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
