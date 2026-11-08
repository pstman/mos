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
  Wand2,
  Share2,
} from 'lucide-react';
import {
  SiteData,
  TrackItem,
  TrackCategory,
  VideoItem,
  BlogPostItem,
  SocialPlatformId,
  THEME_PRESETS,
  DEFAULT_SITE_DATA,
  DEFAULT_ADMIN_PASS,
  STORAGE_KEYS,
  createSlug,
  validateUploadSize,
  clampCardScale,
} from '../../utils/shiriData';
import { PlatformSvgIcon } from './SocialIconsBar';

interface AdminPanelProps {
  siteData: SiteData;
  onUpdateSiteData: (newData: SiteData, statusMessage?: string) => Promise<void>;
  onCloseAdmin: () => void;
  onEnterVisualEditor: () => void;
}

type AdminTab = 'dashboard' | 'tracks' | 'videos' | 'blog' | 'socials' | 'template' | 'cloud';

/**
 * Comprehensive Studio & Website Management Panel (پنل مدیریت)
 * with Live Visual Editor launcher, Pagination & Scale controls, and Social Media manager.
 */
export const AdminPanel: React.FC<AdminPanelProps> = ({
  siteData,
  onUpdateSiteData,
  onCloseAdmin,
  onEnterVisualEditor,
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
  const [trackDuration, setTrackDuration] = useState('03:20');
  const [trackReleaseDate, setTrackReleaseDate] = useState('۱۴۰۴');
  const [trackArrangement, setTrackArrangement] = useState('مصطفی شیری');
  const [trackMixMaster, setTrackMixMaster] = useState('مصطفی شیری');
  const [trackLyrics, setTrackLyrics] = useState('');

  // Video Editor Form State
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoSubtitle, setVideoSubtitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoPoster, setVideoPoster] = useState('');
  const [videoQuality, setVideoQuality] = useState('4K MASTER');
  const [videoDirector, setVideoDirector] = useState('مصطفی شیری');
  const [videoDescription, setVideoDescription] = useState('');

  // Blog Post Editor Form State
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState('معرفی و اخبار');
  const [postExcerpt, setPostExcerpt] = useState('');
  const [postContent, setPostContent] = useState('');
  const [postCover, setPostCover] = useState('');
  const [postAudioUrl, setPostAudioUrl] = useState('');

  // Social Media Form State
  const [newSocialPlatform, setNewSocialPlatform] = useState<SocialPlatformId>('spotify');
  const [newSocialLabel, setNewSocialLabel] = useState('');
  const [newSocialUrl, setNewSocialUrl] = useState('');

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
    setAuthError('رمز عبور وارد شده صحیح نیست.');
  };

  const handleLogout = () => {
    sessionStorage.removeItem(STORAGE_KEYS.ADMIN_SESSION_KEY);
    setIsAuthenticated(false);
    setPasswordInput('');
  };

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
        showNotice(`فایل «${file.name}» بارگذاری و آماده ذخیره شد.`);
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
    setTrackDuration('03:20');
    setTrackReleaseDate('۱۴۰۴');
    setTrackArrangement('مصطفی شیری');
    setTrackMixMaster('مصطفی شیری');
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
      image: trackImage.trim() || 'https://rozup.ir/view/4356486/1000181462.jpg',
      audio:
        trackAudio.trim() ||
        'https://irsv.upmusics.com/dlw/Mostafa%20Shiri%20-%20To%20Delami%20To%20(320).mp3',
      duration: trackDuration.trim() || '03:20',
      releaseDate: trackReleaseDate.trim() || '۱۴۰۴',
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
    setVideoQuality('4K MASTER');
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
      posterUrl: videoPoster.trim() || 'https://rozup.ir/view/4356486/1000181462.jpg',
      duration: '02:30',
      releaseDate: '۱۴۰۴',
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
    setPostCategory('معرفی و اخبار');
    setPostExcerpt('');
    setPostContent('');
    setPostCover('');
    setPostAudioUrl('');
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) {
      showNotice('عنوان و متن اصلی مطلب الزامی است.', 'error');
      return;
    }
    const newPost: BlogPostItem = {
      id: editingPostId || `post-${Date.now()}`,
      title: postTitle.trim(),
      slug: createSlug(postTitle),
      category: postCategory.trim() || 'یادداشت هنری',
      date: '۱۴۰۴',
      readingTime: '۳ دقیقه مطالعه',
      excerpt: postExcerpt.trim() || postContent.trim().slice(0, 140) + '...',
      content: postContent.trim(),
      coverImage: postCover.trim() || 'https://rozup.ir/view/4358537/1000182979.jpg',
      audioUrl: postAudioUrl.trim() || undefined,
    };

    const nextBlog = editingPostId
      ? siteData.blog.map((p) => (p.id === editingPostId ? newPost : p))
      : [newPost, ...siteData.blog];

    await onUpdateSiteData({ ...siteData, blog: nextBlog });
    showNotice(editingPostId ? 'مطلب ویرایش شد.' : 'مطلب جدید منتشر شد.');
    resetPostForm();
  };

  const handleDeletePost = async (id: string) => {
    const nextBlog = siteData.blog.filter((p) => p.id !== id);
    await onUpdateSiteData({ ...siteData, blog: nextBlog });
    showNotice('مطلب حذف شد.');
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
            ورود به پنل مدیریت
          </h2>
          <p className="text-xs text-[var(--text-muted)] mb-6 leading-relaxed">
            جهت دسترسی به مدیریت آثار، تنظیمات نمایش و ویرایشگر زنده روی سایت، رمز عبور خود را وارد نمایید
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="رمز عبور"
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
              ورود
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
              پنل مدیریت · وب‌سایت رسمی مصطفی شیری
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              مدیریت تک‌آهنگ‌ها، شبکه‌های اجتماعی، اندازه و تعداد پست‌ها و ویرایشگر زنده دیداری
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Launch Live Visual On-Page Editor */}
          <button
            type="button"
            onClick={onEnterVisualEditor}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#d6b36c] to-[#dfc48e] text-[#050505] font-black text-xs shadow-[0_0_25px_rgba(214,179,108,0.45)] hover:scale-105 transition-all cursor-pointer"
          >
            <Wand2 className="w-4 h-4" />
            <span>ویرایش زنده و دیداری روی خود سایت (Live Visual Editor)</span>
          </button>

          <button
            type="button"
            onClick={onCloseAdmin}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[var(--color-border)] text-[var(--text-main)] hover:border-[var(--color-gold)] text-xs font-bold cursor-pointer"
          >
            <Eye className="w-4 h-4 text-[var(--color-gold)]" />
            <span>مشاهده سایت</span>
          </button>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 text-xs font-semibold cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>خروج و قفل پنل</span>
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

      {/* Main Sidebar + Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Right Navigation Sidebar */}
        <aside className="lg:col-span-3 space-y-2">
          {[
            { id: 'dashboard', label: 'پیشخوان و آمار سایت', icon: LayoutDashboard },
            { id: 'tracks', label: `مدیریت آثار صوتی (${siteData.tracks.length})`, icon: Music },
            { id: 'blog', label: `مطالب و پست‌ها (${siteData.blog.length})`, icon: FileText },
            { id: 'socials', label: `شبکه‌های اجتماعی (${siteData.socials.length})`, icon: Share2 },
            { id: 'videos', label: `موزیک‌ویدیوها (${siteData.videos.length})`, icon: Video },
            { id: 'template', label: 'اندازه پست‌ها، صفحه‌بندی و قالب', icon: Palette },
            { id: 'cloud', label: 'بیوگرافی، کلودفلر و پشتیبان', icon: Cloud },
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
                پیشخوان مدیریت وب‌سایت رسمی مصطفی شیری
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)]">
                  <span className="text-xs text-[var(--text-muted)]">تک‌آهنگ‌ها و آثار</span>
                  <p className="font-mono-num text-2xl font-black text-[var(--color-gold)] mt-1">
                    {siteData.tracks.length}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)]">
                  <span className="text-xs text-[var(--text-muted)]">مطالب و پست‌ها</span>
                  <p className="font-mono-num text-2xl font-black text-[var(--color-gold)] mt-1">
                    {siteData.blog.length}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)]">
                  <span className="text-xs text-[var(--text-muted)]">پست در هر صفحه</span>
                  <p className="font-mono-num text-2xl font-black text-[var(--color-gold)] mt-1">
                    {siteData.template.postsPerPage || 2}
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)]">
                  <span className="text-xs text-[var(--text-muted)]">مقیاس اندازه پست‌ها</span>
                  <p className="font-mono-num text-2xl font-black text-[var(--color-gold)] mt-1">
                    {siteData.template.cardScalePercent || 92}%
                  </p>
                </div>
              </div>

              {/* Quick Scale & Posts-Per-Page Controls right on Dashboard */}
              <div className="rounded-2xl bg-[var(--bg-surface)] border border-[var(--color-gold)]/35 p-5 space-y-4">
                <h4 className="text-sm font-bold text-[var(--color-gold)]">
                  تنظیم سریع تعداد پست در هر صفحه و درصد اندازه کارت‌ها در صفحه اصلی
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                      تعداد آهنگ در هر صفحه اصلی:
                    </label>
                    <select
                      value={siteData.template.postsPerPage || 2}
                      onChange={(e) => {
                        onUpdateSiteData({
                          ...siteData,
                          template: {
                            ...siteData.template,
                            postsPerPage: Number(e.target.value),
                          },
                        });
                        showNotice(`تعداد آهنگ در هر صفحه به ${e.target.value} تغییر یافت.`);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--color-border)] text-xs font-bold text-[var(--text-main)]"
                    >
                      <option value={2}>۲ اثر در هر صفحه (پیشنهادی)</option>
                      <option value={4}>۴ اثر در هر صفحه</option>
                      <option value={6}>۶ اثر در هر صفحه</option>
                      <option value={99}>نمایش همه در یک صفحه</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                      تعداد پست وبلاگ در هر صفحه:
                    </label>
                    <select
                      value={siteData.template.blogPostsPerPage || 2}
                      onChange={(e) => {
                        onUpdateSiteData({
                          ...siteData,
                          template: {
                            ...siteData.template,
                            blogPostsPerPage: Number(e.target.value),
                          },
                        });
                        showNotice(`تعداد پست در هر صفحه به ${e.target.value} تغییر یافت.`);
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--color-border)] text-xs font-bold text-[var(--text-main)]"
                    >
                      <option value={2}>۲ پست در هر صفحه (پیشنهادی)</option>
                      <option value={4}>۴ پست در هر صفحه</option>
                      <option value={6}>۶ پست در هر صفحه</option>
                      <option value={99}>نمایش همه پست‌ها</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-[var(--text-muted)]">درصد اندازه پست‌ها:</span>
                      <span className="font-mono-num font-bold text-[var(--color-gold)]">
                        {siteData.template.cardScalePercent || 92}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={70}
                      max={115}
                      step={2}
                      value={siteData.template.cardScalePercent || 92}
                      onChange={(e) =>
                        onUpdateSiteData({
                          ...siteData,
                          template: {
                            ...siteData.template,
                            cardScalePercent: clampCardScale(Number(e.target.value)),
                          },
                        })
                      }
                      className="w-full shiri-slider my-2"
                    />
                  </div>
                </div>
              </div>

              {/* Visual Live Editor Banner */}
              <div className="rounded-2xl bg-gradient-to-r from-[var(--color-gold)]/15 via-[var(--bg-surface)] to-[var(--bg-surface)] border border-[var(--color-gold)]/45 p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-[var(--color-gold)] flex items-center gap-2">
                    <Wand2 className="w-4 h-4" />
                    <span>ویرایشگر زنده و دیداری روی خود سایت (Live Visual Mode)</span>
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    بدون نیاز به فرم‌های پیچیده، مستقیماً روی صفحه اصلی سایت کلیک کنید و نوشته‌ها، دکمه‌ها، عکس‌ها و اندازه پست‌ها را همان‌جا تغییر دهید و ذخیره (Apply) کنید.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onEnterVisualEditor}
                  className="px-5 py-3 rounded-xl bg-[var(--color-gold)] text-[#050505] font-black text-xs hover:bg-[var(--color-gold-hover)] cursor-pointer"
                >
                  ورود به ویرایشگر زنده روی سایت ←
                </button>
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
                        عنوان اثر *
                      </label>
                      <input
                        type="text"
                        value={trackTitle}
                        onChange={(e) => setTrackTitle(e.target.value)}
                        placeholder="مثلاً: بیا کنارم"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)] text-sm text-[var(--text-main)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                        توضیح کوتاه *
                      </label>
                      <input
                        type="text"
                        value={trackSubtitle}
                        onChange={(e) => setTrackSubtitle(e.target.value)}
                        placeholder="مثلاً: ترانه، آهنگ و تنظیم: مصطفی شیری"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)] text-sm text-[var(--text-main)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                        بخش *
                      </label>
                      <select
                        value={trackCategory}
                        onChange={(e) => setTrackCategory(e.target.value as TrackCategory)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)] text-sm text-[var(--text-main)]"
                      >
                        <option value="single">تک‌آهنگ‌ها</option>
                        <option value="collaboration">همکاری‌ها</option>
                        <option value="album">آلبوم</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                        نامک انگلیسی (Slug) *
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={trackSlug}
                        onChange={(e) => setTrackSlug(e.target.value)}
                        placeholder="bia-kenaram"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)] text-sm text-[var(--text-main)] font-mono-num"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                        مدت زمان و سال انتشار
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          dir="ltr"
                          value={trackDuration}
                          onChange={(e) => setTrackDuration(e.target.value)}
                          placeholder="03:28"
                          className="px-3 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)] text-xs font-mono-num"
                        />
                        <input
                          type="text"
                          value={trackReleaseDate}
                          onChange={(e) => setTrackReleaseDate(e.target.value)}
                          placeholder="۱۴۰۴"
                          className="px-3 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)] text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Cover Image URL + Upload */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-[var(--bg-surface)]/60 border border-[var(--color-border)]">
                    <div>
                      <label className="block text-xs text-[var(--color-gold)] font-semibold mb-1.5">
                        لینک مستقیم عکس کاور (یا انتخاب فایل زیر ۱.۵ مگابایت)
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={trackImage}
                        onChange={(e) => setTrackImage(e.target.value)}
                        placeholder="https://rozup.ir/view/..."
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
                        لینک مستقیم فایل MP3 (یا انتخاب فایل زیر ۲ مگابایت)
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

                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                      متن ترانه
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
                      <span>{editingTrackId ? 'ذخیره تغییرات اثر' : 'ثبت و انتشار اثر'}</span>
                    </button>
                    {editingTrackId && (
                      <button
                        type="button"
                        onClick={resetTrackForm}
                        className="px-4 py-3 rounded-xl border border-[var(--color-border)] text-xs text-[var(--text-muted)] cursor-pointer"
                      >
                        انصراف
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Existing Tracks List */}
              <div>
                <h4 className="text-sm font-bold text-[var(--text-main)] mb-3">
                  لیست آثار منتشرشده ({siteData.tracks.length})
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

          {/* TAB 3: BLOG POSTS MANAGER */}
          {activeTab === 'blog' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-[var(--color-gold)] border-b border-[var(--color-border)] pb-3 mb-4">
                  مدیریت مطالب، پست‌ها و فعالیت‌های هنری
                </h3>
                <form onSubmit={handleSavePost} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                        عنوان مطلب یا پست *
                      </label>
                      <input
                        type="text"
                        value={postTitle}
                        onChange={(e) => setPostTitle(e.target.value)}
                        placeholder="عنوان مطلب..."
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
                        placeholder="معرفی رسمی / پکیج استودیویی"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)] text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                        لینک تصویر شاخص پست
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={postCover}
                        onChange={(e) => setPostCover(e.target.value)}
                        placeholder="https://rozup.ir/view/..."
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
                        placeholder="https://...mp3"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)] text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                      خلاصه مطلب (نمایش در کارت صفحه اصلی)
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
                      متن کامل مطلب *
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
                    <span>انتشار پست در سایت</span>
                  </button>
                </form>
              </div>

              <div className="space-y-2.5">
                {siteData.blog.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)]"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={p.coverImage}
                        alt={p.title}
                        className="w-12 h-12 rounded-lg object-cover shrink-0 border border-[var(--color-border)]"
                      />
                      <div className="min-w-0">
                        <h5 className="text-sm font-bold text-[var(--text-main)] truncate">
                          {p.title}
                        </h5>
                        <p className="text-xs text-[var(--text-muted)]">
                          {p.category} · {p.date}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeletePost(p.id)}
                      className="p-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SOCIAL MEDIA LINKS MANAGER */}
          {activeTab === 'socials' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-[var(--color-gold)] border-b border-[var(--color-border)] pb-3">
                تنظیمات دقیق شبکه‌های اجتماعی و پلتفرم‌های جهانی مصطفی شیری
              </h3>

              {/* Add New Social Platform */}
              <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)] space-y-3">
                <h4 className="text-xs font-bold text-[var(--color-gold)]">
                  افزودن آیکون شبکه اجتماعی یا پلتفرم جدید
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select
                    value={newSocialPlatform}
                    onChange={(e) => setNewSocialPlatform(e.target.value as SocialPlatformId)}
                    className="px-3 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--color-border)] text-xs text-[var(--text-main)]"
                  >
                    <option value="spotify">Spotify (اسپاتیفای)</option>
                    <option value="apple">Apple Music (اپل موزیک)</option>
                    <option value="youtube">YouTube (یوتیوب)</option>
                    <option value="instagram">Instagram (اینستاگرام)</option>
                    <option value="telegram">Telegram (تلگرام)</option>
                    <option value="amazon">Amazon Music (آمازون موزیک)</option>
                    <option value="deezer">Deezer (دیزر)</option>
                    <option value="tidal">Tidal (تایدال)</option>
                  </select>

                  <input
                    type="text"
                    value={newSocialLabel}
                    onChange={(e) => setNewSocialLabel(e.target.value)}
                    placeholder="عنوان (مثلاً Spotify)"
                    className="px-3 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--color-border)] text-xs"
                  />

                  <input
                    type="url"
                    dir="ltr"
                    value={newSocialUrl}
                    onChange={(e) => setNewSocialUrl(e.target.value)}
                    placeholder="https://..."
                    className="px-3 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--color-border)] text-xs font-mono-num"
                  />
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (!newSocialUrl.trim()) {
                      showNotice('لطفاً لینک شبکه اجتماعی را وارد کنید.', 'error');
                      return;
                    }
                    await onUpdateSiteData({
                      ...siteData,
                      socials: [
                        ...siteData.socials,
                        {
                          id: `soc-${Date.now()}`,
                          platform: newSocialPlatform,
                          label: newSocialLabel.trim() || newSocialPlatform.toUpperCase(),
                          url: newSocialUrl.trim(),
                        },
                      ],
                    });
                    setNewSocialLabel('');
                    setNewSocialUrl('');
                    showNotice('شبکه اجتماعی جدید اضافه شد.');
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--color-gold)] text-[#050505] font-bold text-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>افزودن به ردیف شبکه‌های اجتماعی</span>
                </button>
              </div>

              {/* Editable List of Current Socials */}
              <div className="space-y-2.5">
                {siteData.socials.map((soc, idx) => (
                  <div
                    key={soc.id}
                    className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 p-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)]"
                  >
                    <div className="flex items-center gap-3 min-w-[160px]">
                      <div className="w-10 h-10 rounded-full bg-[var(--bg-card)] border border-[var(--color-gold)]/40 flex items-center justify-center text-[var(--color-gold)] shrink-0">
                        <PlatformSvgIcon platform={soc.platform} className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        value={soc.label}
                        onChange={(e) => {
                          const next = [...siteData.socials];
                          next[idx] = { ...soc, label: e.target.value };
                          onUpdateSiteData({ ...siteData, socials: next });
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--color-border)] text-xs font-bold text-[var(--text-main)] w-32"
                      />
                    </div>

                    <input
                      type="url"
                      dir="ltr"
                      value={soc.url}
                      onChange={(e) => {
                        const next = [...siteData.socials];
                        next[idx] = { ...soc, url: e.target.value };
                        onUpdateSiteData({ ...siteData, socials: next });
                      }}
                      className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--color-border)] text-xs font-mono-num text-[var(--color-gold)]"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        onUpdateSiteData({
                          ...siteData,
                          socials: siteData.socials.filter((s) => s.id !== soc.id),
                        })
                      }
                      className="p-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: VIDEOS MANAGER */}
          {activeTab === 'videos' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-[var(--color-gold)] border-b border-[var(--color-border)] pb-3 mb-4">
                  مدیریت موزیک‌ویدیوها و تیزرها (پلیر اختصاصی ویدیو)
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
                        placeholder="مثلاً: موزیک‌ویدیو تو دلمی تو"
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
                        placeholder="مثلاً: اجرای استودیویی"
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
                        placeholder="https://rozup.ir/view/..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)] text-xs font-mono-num"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-gold)] text-[#050505] font-bold text-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>افزودن ویدیو</span>
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

          {/* TAB 6: PAGINATION, SCALE & TEMPLATE STUDIO */}
          {activeTab === 'template' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-lg font-bold text-[var(--color-gold)] border-b border-[var(--color-border)] pb-3 mb-4">
                  تنظیمات اندازه پست‌ها، تعداد نمایش در هر صفحه و قالب سایت
                </h3>

                {/* 1. Pagination & Card Scale Percentage */}
                <div className="p-5 rounded-2xl bg-[var(--bg-surface)] border border-[var(--color-gold)]/45 space-y-4 mb-6">
                  <h4 className="text-xs sm:text-sm font-bold text-[var(--color-gold)]">
                    ۱. کنترل تعداد پست در هر صفحه و درصد کوچک/بزرگ شدن کارت‌ها (جهت دیده شدن در صفحه اول):
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                        تعداد آهنگ در هر صفحه:
                      </label>
                      <select
                        value={siteData.template.postsPerPage || 2}
                        onChange={(e) =>
                          onUpdateSiteData({
                            ...siteData,
                            template: {
                              ...siteData.template,
                              postsPerPage: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--color-border)] text-xs font-bold text-[var(--text-main)]"
                      >
                        <option value={2}>۲ پست در هر صفحه</option>
                        <option value={4}>۴ پست در هر صفحه</option>
                        <option value={6}>۶ پست در هر صفحه</option>
                        <option value={99}>نمایش همه</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                        تعداد مطلب وبلاگ در هر صفحه:
                      </label>
                      <select
                        value={siteData.template.blogPostsPerPage || 2}
                        onChange={(e) =>
                          onUpdateSiteData({
                            ...siteData,
                            template: {
                              ...siteData.template,
                              blogPostsPerPage: Number(e.target.value),
                            },
                          })
                        }
                        className="w-full px-3 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--color-border)] text-xs font-bold text-[var(--text-main)]"
                      >
                        <option value={2}>۲ مطلب در هر صفحه</option>
                        <option value={4}>۴ مطلب در هر صفحه</option>
                        <option value={6}>۶ مطلب در هر صفحه</option>
                        <option value={99}>نمایش همه</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-[var(--text-muted)]">درصد مقیاس اندازه پست‌ها:</span>
                        <span className="font-mono-num font-bold text-[var(--color-gold)]">
                          {siteData.template.cardScalePercent || 92}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={70}
                        max={115}
                        step={2}
                        value={siteData.template.cardScalePercent || 92}
                        onChange={(e) =>
                          onUpdateSiteData({
                            ...siteData,
                            template: {
                              ...siteData.template,
                              cardScalePercent: clampCardScale(Number(e.target.value)),
                            },
                          })
                        }
                        className="w-full shiri-slider my-2"
                      />
                      <div className="flex justify-between text-[10px] text-[var(--text-muted)]">
                        <span>۷۰٪ (فشرده)</span>
                        <span>۹۲٪ (استاندارد)</span>
                        <span>۱۱۵٪ (بزرگ)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Ready Presets */}
                <label className="block text-xs font-bold text-[var(--text-muted)] mb-2.5">
                  ۲. انتخاب پوسته آماده استودیویی:
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
                        showNotice(`پوسته «${preset.name}» اعمال شد.`);
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

                {/* 3. Custom Color Pickers */}
                <label className="block text-xs font-bold text-[var(--text-muted)] mb-2.5">
                  ۳. شخصی‌سازی رنگ‌ها و چیدمان ستون‌ها:
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
                      چیدمان ستون‌ها
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

                {/* 4. 3D & 4D Micro-Interactions Toggles */}
                <label className="block text-xs font-bold text-[var(--text-muted)] mb-2.5">
                  ۴. تنظیمات افکت‌های سه‌بعدی و چهاربعدی تعاملی:
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

                {/* 5. Custom HTML Template Code Editor */}
                <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--color-border)] space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-[var(--color-gold)]">
                      <Code2 className="w-4 h-4" />
                      <span>ویرایشگر کد قالب و تگ‌های پویای سایت</span>
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
                      <span>نمایش بلوک در بخش درباره من</span>
                    </label>
                  </div>

                  <textarea
                    rows={4}
                    dir="ltr"
                    value={siteData.template.customTemplateHtml}
                    onChange={(e) =>
                      onUpdateSiteData({
                        ...siteData,
                        template: {
                          ...siteData.template,
                          customTemplateHtml: e.target.value,
                        },
                      })
                    }
                    className="w-full p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--color-border)] font-mono-num text-xs text-[var(--text-main)]"
                  />
                </div>

                {/* 6. Menu Links Builder */}
                <div className="p-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--color-border)] space-y-4">
                  <h4 className="text-xs font-bold text-[var(--color-gold)]">
                    ۵. مدیریت لینک‌های منوی بالای سایت
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="text"
                      value={newMenuTitle}
                      onChange={(e) => setNewMenuTitle(e.target.value)}
                      placeholder="عنوان منو"
                      className="flex-1 min-w-[140px] px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--color-border)] text-xs"
                    />
                    <input
                      type="text"
                      dir="ltr"
                      value={newMenuLink}
                      onChange={(e) => setNewMenuLink(e.target.value)}
                      placeholder="#singles"
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
                    ۶. مدیریت نوار اطلاع‌رسانی بالای سایت
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={newBlockTitle}
                      onChange={(e) => setNewBlockTitle(e.target.value)}
                      placeholder="عنوان اطلاعیه..."
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
                      showNotice('بلوک اطلاعیه اضافه شد.');
                    }}
                    className="px-4 py-2 rounded-lg bg-[var(--color-gold)] text-[#050505] font-bold text-xs cursor-pointer"
                  >
                    + ایجاد اطلاعیه
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: ARTIST PROFILE, CLOUDFLARE KV & BACKUP */}
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

                {/* Cloudflare Worker URL Connector */}
                <div className="p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)] space-y-3 mb-6">
                  <h4 className="text-xs font-bold text-[var(--color-gold)]">
                    اتصال به دیتابیس ابری کلودفلر (Cloudflare Worker)
                  </h4>
                  <p className="text-xs text-[var(--text-muted)]">
                    آدرس Worker کلودفلر خود را وارد کنید تا تمام تغییرات روی دیتابیس ابری ذخیره شوند:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <input
                      type="url"
                      dir="ltr"
                      value={workerUrl}
                      onChange={(e) => setWorkerUrl(e.target.value)}
                      placeholder="https://shiri-api.YOUR-NAME.workers.dev"
                      className="flex-1 px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--color-border)] text-xs font-mono-num"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        localStorage.setItem(STORAGE_KEYS.HOST_API_KEY, workerUrl.trim());
                        showNotice('آدرس Cloudflare Worker ثبت شد.');
                      }}
                      className="px-4 py-2 rounded-lg bg-[var(--color-gold)] text-[#050505] font-bold text-xs cursor-pointer"
                    >
                      ثبت آدرس ورکر
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
                      showNotice('اطلاعات سایت به داده‌های اصلی مصطفی شیری بازنشانی شد.');
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/40 text-red-400 text-xs font-bold cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>بازنشانی به اطلاعات پیش‌فرض</span>
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
