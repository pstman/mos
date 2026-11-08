import React, { useEffect, useMemo, useState } from 'react';
import {
  Play,
  Pause,
  Sliders,
  Sun,
  Moon,
  Lock,
  Search,
  Share2,
  Check,
  ArrowRight,
  Music2,
  Video,
  BookOpen,
  UserCheck,
  Sparkles,
  ExternalLink,
  Eye,
  Save,
  X,
  Plus,
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
  Edit3,
  Layers,
} from 'lucide-react';
import {
  SiteData,
  TrackItem,
  BlogPostItem,
  TrackCategory,
  DEFAULT_SITE_DATA,
  STORAGE_KEYS,
  filterTracks,
  compileRozblogTemplate,
  paginateItems,
  clampCardScale,
} from './utils/shiriData';
import { TiltCard3D } from './components/shiri/TiltCard3D';
import { HeroSection3D } from './components/shiri/HeroSection3D';
import { SocialIconsBar } from './components/shiri/SocialIconsBar';
import { StudioAudioPlayer } from './components/shiri/StudioAudioPlayer';
import { StudioVideoPlayer } from './components/shiri/StudioVideoPlayer';
import { TrackDetailView } from './components/shiri/TrackDetailView';
import { RozblogAdminPanel } from './components/shiri/RozblogAdminPanel';
import fallbackCover from './assets/images/album_cover_golden_night_1794140915037.jpg';

export function App() {
  // Site Data State (Loaded from LocalStorage v2 cache + synced with /api/shiri/data)
  const [siteData, setSiteData] = useState<SiteData>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.STORAGE_DATA_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.tracks) && parsed.profile) {
          return {
            ...DEFAULT_SITE_DATA,
            ...parsed,
            profile: { ...DEFAULT_SITE_DATA.profile, ...(parsed.profile || {}) },
            template: { ...DEFAULT_SITE_DATA.template, ...(parsed.template || {}) },
          };
        }
      }
    } catch {
      // ignore corrupted cache
    }
    return DEFAULT_SITE_DATA;
  });

  // Live Visual On-Page Editor State (Accessible after Admin Login)
  const [isVisualEditMode, setIsVisualEditMode] = useState<boolean>(false);
  const [draftSiteData, setDraftSiteData] = useState<SiteData>(siteData);
  const [applySuccessToast, setApplySuccessToast] = useState<boolean>(false);

  // Active data shown on the page (either live draft when in Visual Edit Mode, or saved siteData)
  const activeSiteData = isVisualEditMode ? draftSiteData : siteData;

  // Theme Mode ('dark' | 'light')
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME_KEY);
    return saved === 'light' ? 'light' : 'dark';
  });

  // Active Route from URL Hash (#home, #track/:slug, #post/:slug, #admin)
  const [hashRoute, setHashRoute] = useState<string>(() => window.location.hash || '#home');

  // Music Filter, Search & Pagination State
  const [selectedCategory, setSelectedCategory] = useState<'all' | TrackCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tracksPage, setTracksPage] = useState<number>(1);
  const [blogPage, setBlogPage] = useState<number>(1);

  // Studio Audio Player State
  const [currentTrack, setCurrentTrack] = useState<TrackItem | null>(
    () => siteData.tracks[0] || null
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [forceOpenEq, setForceOpenEq] = useState<boolean>(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Keep draftSiteData synced when entering visual mode or when siteData updates externally
  useEffect(() => {
    if (!isVisualEditMode) {
      setDraftSiteData(siteData);
    }
  }, [siteData, isVisualEditMode]);

  // Sync URL hash changes
  useEffect(() => {
    const onHashChange = () => {
      setHashRoute(window.location.hash || '#home');
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Apply Theme Mode & Custom CSS Variables from Template Studio
  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }
    localStorage.setItem(STORAGE_KEYS.THEME_KEY, themeMode);

    if (themeMode === 'dark' && activeSiteData.template) {
      root.style.setProperty('--bg-main', activeSiteData.template.bgMain || '#050505');
      root.style.setProperty('--bg-card', activeSiteData.template.bgCard || '#080808');
      root.style.setProperty('--bg-surface', activeSiteData.template.bgSurface || '#0d0b08');
      root.style.setProperty('--color-gold', activeSiteData.template.colorGold || '#d6b36c');
      root.style.setProperty('--color-border', activeSiteData.template.colorBorder || '#29231a');
    } else {
      root.style.removeProperty('--bg-main');
      root.style.removeProperty('--bg-card');
      root.style.removeProperty('--bg-surface');
      root.style.removeProperty('--color-gold');
      root.style.removeProperty('--color-border');
    }
  }, [themeMode, activeSiteData.template]);

  // Fetch persisted siteData from built-in /api/shiri/data or custom Cloudflare Worker on mount
  useEffect(() => {
    const loadRemoteData = async () => {
      const customWorker = localStorage.getItem(STORAGE_KEYS.HOST_API_KEY);
      try {
        if (customWorker && customWorker.startsWith('http')) {
          const res = await fetch(customWorker);
          if (res.ok) {
            const remote = await res.json();
            if (remote && Array.isArray(remote.tracks)) {
              const merged: SiteData = {
                ...DEFAULT_SITE_DATA,
                ...remote,
                profile: { ...DEFAULT_SITE_DATA.profile, ...(remote.profile || {}) },
                template: { ...DEFAULT_SITE_DATA.template, ...(remote.template || {}) },
              };
              setSiteData(merged);
              localStorage.setItem(STORAGE_KEYS.STORAGE_DATA_KEY, JSON.stringify(merged));
              return;
            }
          }
        }

        const apiRes = await fetch('/api/shiri/data');
        if (apiRes.ok) {
          const payload = await apiRes.json();
          if (payload?.data && Array.isArray(payload.data.tracks)) {
            const merged: SiteData = {
              ...DEFAULT_SITE_DATA,
              ...payload.data,
              profile: { ...DEFAULT_SITE_DATA.profile, ...(payload.data.profile || {}) },
              template: { ...DEFAULT_SITE_DATA.template, ...(payload.data.template || {}) },
            };
            setSiteData(merged);
            localStorage.setItem(STORAGE_KEYS.STORAGE_DATA_KEY, JSON.stringify(merged));
          }
        }
      } catch {
        // Fallback to local seed/cache silently
      }
    };
    loadRemoteData();
  }, []);

  // Save & Broadcast SiteData Updates (LocalStorage + Server KV + Optional Cloudflare Worker)
  const handleUpdateSiteData = async (newData: SiteData) => {
    setSiteData(newData);
    setDraftSiteData(newData);
    try {
      localStorage.setItem(STORAGE_KEYS.STORAGE_DATA_KEY, JSON.stringify(newData));
    } catch {
      // ignore quota error
    }

    // Sync to internal Express / KV endpoint
    try {
      await fetch('/api/shiri/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: newData }),
      });
    } catch {
      // ignore offline
    }

    // Sync to optional external Cloudflare Worker if configured
    const customWorker = localStorage.getItem(STORAGE_KEYS.HOST_API_KEY);
    if (customWorker && customWorker.startsWith('http')) {
      try {
        await fetch(customWorker, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newData),
        });
      } catch {
        // ignore
      }
    }
  };

  // Apply Live Visual Editor Changes
  const handleApplyVisualChanges = async () => {
    await handleUpdateSiteData(draftSiteData);
    setApplySuccessToast(true);
    setTimeout(() => setApplySuccessToast(false), 3000);
  };

  // Filtered Tracks
  const filteredTracks = useMemo(
    () => filterTracks(activeSiteData.tracks, selectedCategory, searchQuery),
    [activeSiteData.tracks, selectedCategory, searchQuery]
  );

  // Reset track pagination when category or search changes
  useEffect(() => {
    setTracksPage(1);
  }, [selectedCategory, searchQuery, activeSiteData.template.postsPerPage]);

  // Paginated Tracks (Default: 2 posts per page as requested)
  const paginatedTracksResult = useMemo(
    () =>
      paginateItems(
        filteredTracks,
        tracksPage,
        activeSiteData.template.postsPerPage ?? 2
      ),
    [filteredTracks, tracksPage, activeSiteData.template.postsPerPage]
  );

  // Paginated Blog Posts (Default: 2 posts per page)
  const paginatedBlogResult = useMemo(
    () =>
      paginateItems(
        activeSiteData.blog,
        blogPage,
        activeSiteData.template.blogPostsPerPage ?? 2
      ),
    [activeSiteData.blog, blogPage, activeSiteData.template.blogPostsPerPage]
  );

  // Card Scale Percentage (70% to 115%) for sizing posts on home screen before scrolling
  const cardScale = useMemo(
    () => clampCardScale(activeSiteData.template.cardScalePercent ?? 92),
    [activeSiteData.template.cardScalePercent]
  );

  // Compiled Custom Template HTML
  const compiledTemplateHtml = useMemo(
    () =>
      compileRozblogTemplate(
        activeSiteData.template.customTemplateHtml || '',
        activeSiteData
      ),
    [activeSiteData]
  );

  // Route Parsing
  const activeTrackFromHash = useMemo(() => {
    if (!hashRoute.startsWith('#track/')) return null;
    const slug = decodeURIComponent(hashRoute.replace('#track/', '').trim());
    return activeSiteData.tracks.find((t) => t.slug === slug || t.id === slug) || null;
  }, [hashRoute, activeSiteData.tracks]);

  const activePostFromHash = useMemo(() => {
    if (!hashRoute.startsWith('#post/')) return null;
    const slug = decodeURIComponent(hashRoute.replace('#post/', '').trim());
    return activeSiteData.blog.find((p) => p.slug === slug || p.id === slug) || null;
  }, [hashRoute, activeSiteData.blog]);

  const isAdminView = hashRoute === '#admin';

  const handlePlayTrack = (track: TrackItem) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const handleCopyDeepLink = async (hashPath: string, slugKey: string) => {
    const fullUrl = `${window.location.origin}${window.location.pathname}${hashPath}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${activeSiteData.profile.nameFa} | وب‌سایت رسمی`,
          url: fullUrl,
        });
        return;
      } catch {
        // fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopiedSlug(slugKey);
      setTimeout(() => setCopiedSlug(null), 2200);
    } catch {
      // ignore
    }
  };

  // Helper to update a single track inside draftSiteData during Live Visual Editing
  const handleUpdateDraftTrack = (trackId: string, patch: Partial<TrackItem>) => {
    setDraftSiteData((prev) => ({
      ...prev,
      tracks: prev.tracks.map((t) => (t.id === trackId ? { ...t, ...patch } : t)),
    }));
  };

  // Helper to update a single blog post inside draftSiteData during Live Visual Editing
  const handleUpdateDraftPost = (postId: string, patch: Partial<BlogPostItem>) => {
    setDraftSiteData((prev) => ({
      ...prev,
      blog: prev.blog.map((p) => (p.id === postId ? { ...p, ...patch } : p)),
    }));
  };

  // Helper to add a new track directly in Live Visual Editor
  const handleAddDraftTrackOnPage = () => {
    const newTrack: TrackItem = {
      id: `trk-${Date.now()}`,
      slug: `new-track-${Date.now()}`,
      title: 'تک‌آهنگ جدید مصطفی شیری',
      subtitle: 'خواننده، آهنگساز و تنظیم‌کننده: مصطفی شیری',
      category: 'single',
      releaseDate: '۱۴۰۵',
      duration: '03:20',
      arrangement: 'مصطفی شیری',
      mixMaster: 'مصطفی شیری',
      image: 'https://rozup.ir/view/4356486/1000181462.jpg',
      audio: 'https://rozup.ir/download/4356484/Mostafa%20Shiri%20-%20Bia%20Kenaram-320.mp3',
      lyrics: 'متن ترانه را در این بخش وارد نمایید...',
      plays: 1200,
    };
    setDraftSiteData((prev) => ({
      ...prev,
      tracks: [newTrack, ...prev.tracks],
    }));
    setTracksPage(1);
  };

  // Helper to add a new blog post directly in Live Visual Editor
  const handleAddDraftBlogPostOnPage = () => {
    const newPost: BlogPostItem = {
      id: `post-${Date.now()}`,
      slug: `post-${Date.now()}`,
      title: 'مطلب و خبر جدید در وب‌سایت رسمی مصطفی شیری',
      category: 'اخبار و فعالیت‌های هنری',
      date: '۱۴۰۵',
      readingTime: '۳ دقیقه مطالعه',
      coverImage: 'https://rozup.ir/view/4358537/1000182979.jpg',
      excerpt: 'خلاصه مطلب جدید را مستقیماً در این کادر ویرایش کنید...',
      content: 'متن کامل یادداشت یا خبر هنری را در این بخش وارد نمایید.',
    };
    setDraftSiteData((prev) => ({
      ...prev,
      blog: [newPost, ...prev.blog],
    }));
    setBlogPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-main)] pb-28">
      {/* LIVE VISUAL ON-PAGE EDITOR STUDIO BAR (Only visible when Admin activates Live Visual Mode) */}
      {isVisualEditMode && (
        <div className="sticky top-0 z-50 bg-[#0c0a07]/95 backdrop-blur-xl border-b-2 border-[var(--color-gold)] px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.85)]">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            {/* Left/Right status badge */}
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-gold)] text-[#050505] text-xs font-black">
                <Eye className="w-3.5 h-3.5" />
                <span>ویرایشگر زنده و دیداری سایت</span>
              </span>
              <span className="hidden lg:inline text-xs text-[var(--text-muted)]">
                روی هر متن، عکس، آیکون یا کارت در صفحه کلیک کنید و پس از تغییر دکمه «Apply» را بزنید.
              </span>
            </div>

            {/* Live Layout Controls: Card Scale % & Posts Per Page */}
            <div className="flex flex-wrap items-center gap-4 bg-black/70 border border-[var(--color-border)] rounded-xl px-3.5 py-1.5">
              {/* Card Scale Percentage Slider */}
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--color-gold)]" />
                <label className="text-[11px] text-[var(--text-muted)] whitespace-nowrap">
                  اندازه پست‌ها:
                </label>
                <input
                  type="range"
                  min={70}
                  max={115}
                  step={1}
                  value={draftSiteData.template.cardScalePercent ?? 92}
                  onChange={(e) =>
                    setDraftSiteData((prev) => ({
                      ...prev,
                      template: {
                        ...prev.template,
                        cardScalePercent: Number(e.target.value),
                      },
                    }))
                  }
                  className="w-24 accent-[var(--color-gold)] cursor-pointer"
                />
                <span className="font-mono-num text-xs font-bold text-[var(--color-gold)] w-10 text-left">
                  {draftSiteData.template.cardScalePercent ?? 92}%
                </span>
              </div>

              <div className="h-4 w-[1px] bg-[var(--color-border)] hidden sm:block" />

              {/* Posts Per Page Selector */}
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[var(--color-gold)]" />
                <span className="text-[11px] text-[var(--text-muted)] whitespace-nowrap">
                  پست در هر صفحه:
                </span>
                {[1, 2, 3, 4, 0].map((num) => {
                  const active = (draftSiteData.template.postsPerPage ?? 2) === num;
                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() =>
                        setDraftSiteData((prev) => ({
                          ...prev,
                          template: {
                            ...prev.template,
                            postsPerPage: num,
                            blogPostsPerPage: num,
                          },
                        }))
                      }
                      className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors cursor-pointer ${
                        active
                          ? 'bg-[var(--color-gold)] text-[#050505]'
                          : 'bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--color-gold)]'
                      }`}
                    >
                      {num === 0 ? 'همه' : `${num} پست`}
                    </button>
                  );
                })}
              </div>

              <div className="h-4 w-[1px] bg-[var(--color-border)] hidden sm:block" />

              {/* Accent Gold Color Picker */}
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-[var(--text-muted)]">رنگ طلایی:</span>
                <input
                  type="color"
                  value={draftSiteData.template.colorGold || '#d6b36c'}
                  onChange={(e) =>
                    setDraftSiteData((prev) => ({
                      ...prev,
                      template: {
                        ...prev.template,
                        colorGold: e.target.value,
                      },
                    }))
                  }
                  className="w-6 h-6 rounded cursor-pointer border border-white/20 bg-transparent"
                />
              </div>
            </div>

            {/* Action Buttons: Apply / Admin Panel / Exit */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleApplyVisualChanges}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-black font-black text-xs hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>
                  {applySuccessToast
                    ? 'اعمال شد ✓ (Applied)'
                    : 'اعمال و ذخیره تغییرات (Apply)'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.hash = '#admin';
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--color-border)] text-xs text-[var(--color-gold)] hover:border-[var(--color-gold)] cursor-pointer"
              >
                <span>پنل مدیریت کامل</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsVisualEditMode(false);
                }}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-red-500/15 border border-red-500/35 text-xs text-red-300 hover:bg-red-500/25 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>خروج</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Custom Announcement Bars (if enabled) */}
      {activeSiteData.customBlocks
        .filter((b) => b.enabled && b.position === 'top')
        .map((blk) => (
          <div
            key={blk.id}
            className="bg-[var(--bg-surface)] border-b border-[var(--color-gold)]/25 px-4 py-2 text-center text-xs text-[var(--color-gold)] flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            {isVisualEditMode ? (
              <input
                type="text"
                value={blk.htmlContent}
                onChange={(e) =>
                  setDraftSiteData((prev) => ({
                    ...prev,
                    customBlocks: prev.customBlocks.map((item) =>
                      item.id === blk.id ? { ...item, htmlContent: e.target.value } : item
                    ),
                  }))
                }
                className="w-full max-w-xl bg-black/70 border border-[var(--color-gold)]/50 rounded px-2 py-0.5 text-center text-xs text-[var(--color-gold)]"
              />
            ) : (
              <span>{blk.htmlContent}</span>
            )}
          </div>
        ))}

      {/* Clean Sticky Topbar (No Admin Button in Header — Admin is discreetly in the Footer) */}
      <header className="sticky top-0 z-30 h-20 bg-[var(--bg-header)] backdrop-blur-xl border-b border-[var(--color-border)] px-4 sm:px-8 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark & Golden Monogram */}
        <a
          href="#home"
          onClick={() => {
            window.location.hash = '#home';
          }}
          className="flex items-center gap-3 group"
        >
          <div className="w-10 h-10 rounded-full border border-[var(--color-gold)]/65 bg-black/50 flex items-center justify-center font-cinzel font-bold text-sm text-[var(--color-gold)] group-hover:scale-105 transition-transform">
            {activeSiteData.profile.monogram || 'MS'}
          </div>
          <div className="flex flex-col">
            <span
              dir="ltr"
              className="font-cinzel text-sm sm:text-base font-bold tracking-[3px] text-[var(--color-gold)]"
            >
              {activeSiteData.profile.nameEn}
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">
              {activeSiteData.profile.nameFa} · وب‌سایت رسمی
            </span>
          </div>
        </a>

        {/* Zone 2: Navigation Links (Editable in Live Visual Mode) */}
        <nav className="hidden md:flex items-center gap-6">
          {activeSiteData.menu.slice(0, 6).map((item) =>
            isVisualEditMode ? (
              <input
                key={item.id}
                type="text"
                value={item.title}
                onChange={(e) =>
                  setDraftSiteData((prev) => ({
                    ...prev,
                    menu: prev.menu.map((m) =>
                      m.id === item.id ? { ...m, title: e.target.value } : m
                    ),
                  }))
                }
                className="w-24 bg-black/70 border border-dashed border-[var(--color-gold)]/60 rounded px-2 py-1 text-xs text-center text-[var(--color-gold)]"
              />
            ) : (
              <a
                key={item.id}
                href={item.link}
                className="text-sm font-medium text-[var(--text-main)] hover:text-[var(--color-gold)] whitespace-nowrap transition-colors"
              >
                {item.title}
              </a>
            )
          )}
        </nav>

        {/* Zone 3: Theme Toggle Only (Clean public header) */}
        <div className="flex items-center gap-2.5">
          {isAdminView && (
            <button
              type="button"
              onClick={() => {
                window.location.hash = '#home';
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--color-gold)] text-[#050505] text-xs font-bold cursor-pointer"
            >
              <span>مشاهده سایت</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
            aria-label="تغییر تم روشن یا تاریک"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-[#050505] transition-all cursor-pointer"
          >
            {themeMode === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">پوسته روشن</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">پوسته تیره</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* VIEW 1: PASSWORD-PROTECTED ADMIN PANEL (#admin) */}
      {isAdminView ? (
        <main className="flex-1">
          <RozblogAdminPanel
            siteData={siteData}
            onUpdateSiteData={handleUpdateSiteData}
            onCloseAdmin={() => {
              window.location.hash = '#home';
            }}
            onEnterVisualEditor={() => {
              setDraftSiteData(siteData);
              setIsVisualEditMode(true);
              window.location.hash = '#home';
            }}
          />
        </main>
      ) : activeTrackFromHash ? (
        /* VIEW 2: DEDICATED TRACK DETAIL PAGE (#track/:slug) */
        <main className="flex-1">
          <TrackDetailView
            track={activeTrackFromHash}
            isPlayingThis={currentTrack?.id === activeTrackFromHash.id && isPlaying}
            enable3DTilt={activeSiteData.template.enable3DTilt}
            enableCursorGlow={activeSiteData.template.enableCursorGlow}
            onPlayToggle={() => handlePlayTrack(activeTrackFromHash)}
            onOpenEqualizer={() => {
              if (currentTrack?.id !== activeTrackFromHash.id) {
                setCurrentTrack(activeTrackFromHash);
              }
              setForceOpenEq(true);
            }}
            onBack={() => {
              window.location.hash = '#home';
            }}
          />
        </main>
      ) : activePostFromHash ? (
        /* VIEW 3: DEDICATED BLOG POST READER (#post/:slug) */
        <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <div className="mb-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                window.location.hash = '#home';
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--color-border)] text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-[#050505] font-semibold text-sm transition-all cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>بازگشت به صفحه اصلی</span>
            </button>

            <button
              type="button"
              onClick={() =>
                handleCopyDeepLink(`#post/${activePostFromHash.slug}`, activePostFromHash.slug)
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--color-border)] text-xs sm:text-sm text-[var(--text-main)] hover:border-[var(--color-gold)] cursor-pointer"
            >
              {copiedSlug === activePostFromHash.slug ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Share2 className="w-4 h-4 text-[var(--color-gold)]" />
              )}
              <span>
                {copiedSlug === activePostFromHash.slug
                  ? 'لینک مطلب کپی شد'
                  : 'اشتراک‌گذاری لینک مستقیم'}
              </span>
            </button>
          </div>

          <article className="rounded-[26px] bg-[var(--bg-card)] border border-[var(--color-border)] overflow-hidden shadow-[var(--shadow-card)]">
            <div className="aspect-[16/9] max-h-[460px] w-full overflow-hidden bg-black">
              <img
                src={activePostFromHash.coverImage || fallbackCover}
                alt={activePostFromHash.title}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = fallbackCover;
                }}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 sm:p-10">
              <div className="text-xs text-[var(--color-gold)] mb-2">
                {activePostFromHash.category} · {activePostFromHash.date} ·{' '}
                {activePostFromHash.readingTime}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[var(--text-main)] mb-6 leading-snug">
                {activePostFromHash.title}
              </h1>

              {activePostFromHash.audioUrl && (
                <div className="mb-6 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-gold)]/35 flex flex-wrap items-center justify-between gap-4">
                  <span className="text-xs font-bold text-[var(--color-gold)]">
                    پخش مستقیم فایل صوتی پیوست:
                  </span>
                  <audio
                    controls
                    src={activePostFromHash.audioUrl}
                    className="h-9 max-w-xs"
                  />
                </div>
              )}

              <div className="whitespace-pre-line text-base leading-9 text-[var(--text-main)]/90">
                {activePostFromHash.content}
              </div>
            </div>
          </article>
        </main>
      ) : (
        /* VIEW 4: MAIN ARTIST HOME EXPERIENCE */
        <main className="flex-1">
          {/* Official Responsive Hero Banner & Artist Card */}
          <HeroSection3D
            profile={activeSiteData.profile}
            template={activeSiteData.template}
            latestTrack={activeSiteData.tracks[0]}
            isPlaying={isPlaying}
            onPlayLatest={() => {
              if (activeSiteData.tracks[0]) {
                handlePlayTrack(activeSiteData.tracks[0]);
              }
            }}
            onOpenEqualizer={() => {
              if (!currentTrack && activeSiteData.tracks[0]) {
                setCurrentTrack(activeSiteData.tracks[0]);
              }
              setForceOpenEq(true);
            }}
            isVisualEditMode={isVisualEditMode}
            onUpdateProfileField={(field, value) =>
              setDraftSiteData((prev) => ({
                ...prev,
                profile: { ...prev.profile, [field]: value },
              }))
            }
            onUpdateTemplateField={(field, value) =>
              setDraftSiteData((prev) => ({
                ...prev,
                template: { ...prev.template, [field]: value },
              }))
            }
          />

          {/* Official Social Media & Global Streaming Platforms Bar */}
          <SocialIconsBar
            socials={activeSiteData.socials}
            isVisualEditMode={isVisualEditMode}
            onUpdateSocials={(nextSocials) =>
              setDraftSiteData((prev) => ({
                ...prev,
                socials: nextSocials,
              }))
            }
          />

          {/* Main Content Container with Dynamic Card Scale Percentage */}
          <div
            className="mx-auto px-4 sm:px-6 py-3 space-y-12 transition-all duration-300"
            style={{
              maxWidth: `${Math.round(1152 * (cardScale / 100))}px`,
            }}
          >
            {/* SECTION 1: SINGLES & STUDIO RELEASES (#singles / #tracks-section) */}
            <section id="singles" className="scroll-mt-24">
              {/* Compact Header + Filter Tabs Row so 2 posts are immediately visible on the first screen */}
              <div
                id="tracks-section"
                className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-[var(--color-border)]"
              >
                <div className="flex items-center gap-3">
                  <Music2 className="w-5 h-5 text-[var(--color-gold)]" />
                  {isVisualEditMode ? (
                    <input
                      type="text"
                      value={activeSiteData.template.tracksSectionTitle || 'تک‌آهنگ‌ها و آثار رسمی'}
                      onChange={(e) =>
                        setDraftSiteData((prev) => ({
                          ...prev,
                          template: {
                            ...prev.template,
                            tracksSectionTitle: e.target.value,
                          },
                        }))
                      }
                      className="text-lg sm:text-xl font-black text-[var(--color-gold)] bg-black/70 border border-dashed border-[var(--color-gold)] rounded-xl px-3 py-1"
                    />
                  ) : (
                    <h2 className="text-xl sm:text-2xl font-black text-[var(--color-gold)]">
                      {activeSiteData.template.tracksSectionTitle || 'تک‌آهنگ‌ها و آثار رسمی'}
                    </h2>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: 'all', label: 'همه آثار' },
                    { id: 'single', label: 'تک‌آهنگ‌ها' },
                    { id: 'collaboration', label: 'همکاری‌ها و بی‌کلام' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedCategory(tab.id as 'all' | TrackCategory)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer border ${
                        selectedCategory === tab.id
                          ? 'bg-[var(--color-gold)] text-[#050505] border-[var(--color-gold)] shadow-[0_4px_15px_rgba(214,179,108,0.3)]'
                          : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--color-border)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}

                  {isVisualEditMode && (
                    <button
                      type="button"
                      onClick={handleAddDraftTrackOnPage}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold hover:bg-emerald-500/30 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>افزودن آهنگ جدید</span>
                    </button>
                  )}

                  {/* Search Input */}
                  <div className="relative w-48 sm:w-56">
                    <Search className="w-3.5 h-3.5 text-[var(--text-muted)] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="جستجو در نام اثر..."
                      className="w-full pr-9 pl-3 py-1.5 rounded-full bg-[var(--bg-card)] border border-[var(--color-border)] focus:border-[var(--color-gold)] text-xs text-[var(--text-main)] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Paginated Music Cards Grid (2 Posts Per Page by default, scaled by cardScalePercent) */}
              <div
                className={`grid grid-cols-1 ${
                  activeSiteData.template.gridColumns === 3
                    ? 'md:grid-cols-2 lg:grid-cols-3'
                    : 'md:grid-cols-2'
                } gap-5`}
              >
                {paginatedTracksResult.pagedItems.map((track) => {
                  const isThisPlaying = currentTrack?.id === track.id && isPlaying;
                  return (
                    <TiltCard3D
                      key={track.id}
                      enable3D={activeSiteData.template.enable3DTilt && !isVisualEditMode}
                      enableGlow={activeSiteData.template.enableCursorGlow}
                      className="flex flex-col sm:flex-row items-center sm:items-stretch gap-4 h-full p-4"
                    >
                      {/* Uncropped 1:1 Square Album Cover Container scaled by cardScalePercent */}
                      <div
                        className="relative shrink-0 rounded-2xl overflow-hidden bg-black border border-[var(--color-border)]"
                        style={{
                          width: `${Math.round(168 * (cardScale / 100))}px`,
                          height: `${Math.round(168 * (cardScale / 100))}px`,
                        }}
                      >
                        <img
                          src={track.image || fallbackCover}
                          alt={track.title}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = fallbackCover;
                          }}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />

                        {/* Subtle Dark Gradient & Play Trigger */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex items-end justify-between p-2.5">
                          <span className="font-mono-num text-[11px] text-[var(--color-gold)] bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-md border border-[var(--color-gold)]/30">
                            {track.duration}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayTrack(track);
                            }}
                            aria-label={`پخش ${track.title}`}
                            className="w-9 h-9 rounded-full bg-[var(--color-gold)] text-[#050505] flex items-center justify-center shadow-[0_0_20px_rgba(214,179,108,0.55)] hover:scale-110 transition-transform cursor-pointer"
                          >
                            {isThisPlaying ? (
                              <Pause className="w-4 h-4 fill-current" />
                            ) : (
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Metadata & Actions (Or Live On-Page Editor Inputs) */}
                      <div className="flex-1 w-full flex flex-col justify-between text-right">
                        {isVisualEditMode ? (
                          <div className="space-y-2 mb-3 p-2.5 rounded-xl bg-black/65 border border-dashed border-[var(--color-gold)]/50">
                            <div className="flex items-center gap-1 text-[11px] text-[var(--color-gold)] font-bold">
                              <Edit3 className="w-3 h-3" />
                              <span>ویرایش زنده کارت آهنگ:</span>
                            </div>
                            <input
                              type="text"
                              value={track.title}
                              onChange={(e) =>
                                handleUpdateDraftTrack(track.id, { title: e.target.value })
                              }
                              placeholder="نام آهنگ"
                              className="w-full bg-black border border-[var(--color-border)] rounded-lg px-2.5 py-1 text-sm font-bold text-[var(--text-main)]"
                            />
                            <input
                              type="text"
                              value={track.subtitle}
                              onChange={(e) =>
                                handleUpdateDraftTrack(track.id, { subtitle: e.target.value })
                              }
                              placeholder="زیرعنوان / شناسنامه کوتاه"
                              className="w-full bg-black border border-[var(--color-border)] rounded-lg px-2.5 py-1 text-xs text-[var(--text-muted)]"
                            />
                            <input
                              type="url"
                              dir="ltr"
                              value={track.image}
                              onChange={(e) =>
                                handleUpdateDraftTrack(track.id, { image: e.target.value })
                              }
                              placeholder="لینک تصویر کاور (Image URL)"
                              className="w-full bg-black border border-[var(--color-border)] rounded-lg px-2.5 py-1 text-[11px] text-[var(--color-gold)] font-mono-num"
                            />
                            <input
                              type="url"
                              dir="ltr"
                              value={track.audio}
                              onChange={(e) =>
                                handleUpdateDraftTrack(track.id, { audio: e.target.value })
                              }
                              placeholder="لینک فایل صوتی MP3"
                              className="w-full bg-black border border-[var(--color-border)] rounded-lg px-2.5 py-1 text-[11px] text-emerald-300 font-mono-num"
                            />
                          </div>
                        ) : (
                          <div>
                            <p className="text-xs text-[var(--color-gold)] mb-1">
                              {track.category === 'collaboration' ? 'بی‌کلام / پروژه ویژه' : 'تک‌آهنگ رسمی'} ·{' '}
                              {track.releaseDate} · تنظیم: {track.arrangement}
                            </p>
                            <h3 className="text-lg sm:text-xl font-bold text-[var(--text-main)] mb-1">
                              {track.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-[var(--text-muted)] mb-3 line-clamp-2">
                              {track.subtitle}
                            </p>
                          </div>
                        )}

                        {/* External Streaming Quick Links if available (e.g., Rhythmic Bounce on Spotify/Apple/Amazon) */}
                        {track.externalLinks && track.externalLinks.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {track.externalLinks.map((ext, idx) => (
                              <a
                                key={idx}
                                href={ext.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--bg-surface)] border border-[var(--color-gold)]/35 text-[11px] text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-[#050505] transition-colors"
                              >
                                <span>{ext.label}</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            ))}
                          </div>
                        )}

                        <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handlePlayTrack(track);
                              }}
                              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[var(--color-gold)]/15 border border-[var(--color-gold)]/45 text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-[#050505] text-xs font-bold transition-colors cursor-pointer"
                            >
                              {isThisPlaying ? (
                                <>
                                  <Pause className="w-3.5 h-3.5 fill-current" />
                                  <span>توقف</span>
                                </>
                              ) : (
                                <>
                                  <Play className="w-3.5 h-3.5 fill-current" />
                                  <span>پخش مستقیم</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentTrack(track);
                                setForceOpenEq(true);
                              }}
                              title="اکولایزر ۵ بانده"
                              className="p-2 rounded-xl border border-[var(--color-border)] text-[var(--text-muted)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors cursor-pointer"
                            >
                              <Sliders className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <a
                            href={`#track/${track.slug}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--text-main)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors"
                          >
                            <span>صفحه اثر و دانلود</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </TiltCard3D>
                  );
                })}
              </div>

              {/* Pagination Bar for Tracks (Shows when totalPages > 1) */}
              {paginatedTracksResult.totalPages > 1 && (
                <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={paginatedTracksResult.safePage <= 1}
                    onClick={() =>
                      setTracksPage((p) => Math.max(1, p - 1))
                    }
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--color-border)] text-xs font-bold text-[var(--text-main)] hover:border-[var(--color-gold)] disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span>صفحه قبل</span>
                  </button>

                  {Array.from({ length: paginatedTracksResult.totalPages }, (_, idx) => idx + 1).map(
                    (pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setTracksPage(pageNum)}
                        className={`w-9 h-9 rounded-xl font-mono-num text-xs font-bold transition-all cursor-pointer border ${
                          paginatedTracksResult.safePage === pageNum
                            ? 'bg-[var(--color-gold)] text-[#050505] border-[var(--color-gold)] shadow-[0_0_15px_rgba(214,179,108,0.4)]'
                            : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--color-border)] hover:border-[var(--color-gold)]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    disabled={
                      paginatedTracksResult.safePage >= paginatedTracksResult.totalPages
                    }
                    onClick={() =>
                      setTracksPage((p) =>
                        Math.min(paginatedTracksResult.totalPages, p + 1)
                      )
                    }
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--color-border)] text-xs font-bold text-[var(--text-main)] hover:border-[var(--color-gold)] disabled:opacity-40 cursor-pointer"
                  >
                    <span>صفحه بعد</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              )}
            </section>

            {/* SECTION 2: ARTIST BLOG, PHOTOS & STUDIO ACTIVITIES (#blog-section) */}
            <section id="blog-section" className="scroll-mt-24">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 text-xs text-[var(--color-gold)] tracking-widest uppercase mb-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>OFFICIAL POSTS, PHOTOS & ACTIVITIES</span>
                </div>

                {isVisualEditMode ? (
                  <div className="max-w-md mx-auto">
                    <input
                      type="text"
                      value={
                        activeSiteData.template.blogSectionTitle ||
                        'پست‌ها، تصاویر و فعالیت‌های هنری مصطفی شیری'
                      }
                      onChange={(e) =>
                        setDraftSiteData((prev) => ({
                          ...prev,
                          template: {
                            ...prev.template,
                            blogSectionTitle: e.target.value,
                          },
                        }))
                      }
                      className="w-full text-center text-2xl font-black text-[var(--color-gold)] bg-black/70 border border-dashed border-[var(--color-gold)] rounded-xl px-3 py-1.5"
                    />
                  </div>
                ) : (
                  <h2 className="text-2xl sm:text-3xl font-black text-[var(--color-gold)]">
                    {activeSiteData.template.blogSectionTitle ||
                      'پست‌ها، تصاویر و فعالیت‌های هنری مصطفی شیری'}
                  </h2>
                )}

                <div
                  className="w-36 h-[1px] mx-auto mt-3"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent, var(--color-line), transparent)',
                  }}
                />

                {isVisualEditMode && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={handleAddDraftBlogPostOnPage}
                      className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-xs font-bold hover:bg-emerald-500/30 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>افزودن پست وبلاگ جدید</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Paginated Blog Posts (2 Posts Per Page by default) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paginatedBlogResult.pagedItems.map((post) => (
                  <TiltCard3D
                    key={post.id}
                    enable3D={activeSiteData.template.enable3DTilt && !isVisualEditMode}
                    enableGlow={activeSiteData.template.enableCursorGlow}
                    className="flex flex-col h-full p-4 sm:p-5"
                  >
                    <div
                      className="w-full rounded-xl overflow-hidden bg-black mb-3.5 border border-[var(--color-border)]"
                      style={{
                        aspectRatio: '16 / 10',
                        maxHeight: `${Math.round(260 * (cardScale / 100))}px`,
                      }}
                    >
                      <img
                        src={post.coverImage || fallbackCover}
                        alt={post.title}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = fallbackCover;
                        }}
                        className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      {isVisualEditMode ? (
                        <div className="space-y-2 mb-3 p-2.5 rounded-xl bg-black/65 border border-dashed border-[var(--color-gold)]/50">
                          <div className="flex items-center gap-1 text-[11px] text-[var(--color-gold)] font-bold">
                            <Edit3 className="w-3 h-3" />
                            <span>ویرایش زنده پست وبلاگ:</span>
                          </div>
                          <input
                            type="text"
                            value={post.title}
                            onChange={(e) =>
                              handleUpdateDraftPost(post.id, { title: e.target.value })
                            }
                            placeholder="عنوان پست"
                            className="w-full bg-black border border-[var(--color-border)] rounded-lg px-2.5 py-1 text-sm font-bold text-[var(--text-main)]"
                          />
                          <input
                            type="url"
                            dir="ltr"
                            value={post.coverImage}
                            onChange={(e) =>
                              handleUpdateDraftPost(post.id, { coverImage: e.target.value })
                            }
                            placeholder="لینک عکس پست (Image URL)"
                            className="w-full bg-black border border-[var(--color-border)] rounded-lg px-2.5 py-1 text-[11px] text-[var(--color-gold)] font-mono-num"
                          />
                          <textarea
                            rows={2}
                            value={post.excerpt}
                            onChange={(e) =>
                              handleUpdateDraftPost(post.id, { excerpt: e.target.value })
                            }
                            placeholder="خلاصه پست"
                            className="w-full bg-black border border-[var(--color-border)] rounded-lg px-2.5 py-1 text-xs text-[var(--text-muted)]"
                          />
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs text-[var(--color-gold)] mb-1.5">
                            {post.category} · {post.date} · {post.readingTime}
                          </p>
                          <h3 className="text-lg font-bold text-[var(--text-main)] mb-2 leading-snug">
                            {post.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-4 line-clamp-3">
                            {post.excerpt}
                          </p>
                        </div>
                      )}

                      <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
                        <a
                          href={`#post/${post.slug}`}
                          className="text-xs font-bold text-[var(--color-gold)] hover:underline"
                        >
                          مشاهده کامل مطلب و تصویر ←
                        </a>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyDeepLink(`#post/${post.slug}`, post.slug);
                          }}
                          className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--color-gold)] cursor-pointer"
                        >
                          {copiedSlug === post.slug ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>کپی شد</span>
                            </>
                          ) : (
                            <>
                              <Share2 className="w-3.5 h-3.5" />
                              <span>اشتراک‌گذاری</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </TiltCard3D>
                ))}
              </div>

              {/* Pagination Bar for Blog Posts */}
              {paginatedBlogResult.totalPages > 1 && (
                <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={paginatedBlogResult.safePage <= 1}
                    onClick={() => setBlogPage((p) => Math.max(1, p - 1))}
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--color-border)] text-xs font-bold text-[var(--text-main)] hover:border-[var(--color-gold)] disabled:opacity-40 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span>صفحه قبل</span>
                  </button>

                  {Array.from({ length: paginatedBlogResult.totalPages }, (_, idx) => idx + 1).map(
                    (pageNum) => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => setBlogPage(pageNum)}
                        className={`w-9 h-9 rounded-xl font-mono-num text-xs font-bold transition-all cursor-pointer border ${
                          paginatedBlogResult.safePage === pageNum
                            ? 'bg-[var(--color-gold)] text-[#050505] border-[var(--color-gold)] shadow-[0_0_15px_rgba(214,179,108,0.4)]'
                            : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--color-border)] hover:border-[var(--color-gold)]'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    disabled={
                      paginatedBlogResult.safePage >= paginatedBlogResult.totalPages
                    }
                    onClick={() =>
                      setBlogPage((p) =>
                        Math.min(paginatedBlogResult.totalPages, p + 1)
                      )
                    }
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl bg-[var(--bg-card)] border border-[var(--color-border)] text-xs font-bold text-[var(--text-main)] hover:border-[var(--color-gold)] disabled:opacity-40 cursor-pointer"
                  >
                    <span>صفحه بعد</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              )}
            </section>

            {/* SECTION 3: STUDIO MUSIC VIDEOS & PERFORMANCES (#videos-section) */}
            <section id="videos-section" className="scroll-mt-24">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 text-xs text-[var(--color-gold)] tracking-widest uppercase mb-1.5">
                  <Video className="w-4 h-4" />
                  <span>OFFICIAL VIDEOS & STUDIO REELS</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[var(--color-gold)]">
                  {activeSiteData.template.videosSectionTitle ||
                    'موزیک‌ویدیوها و تیزرهای استودیویی'}
                </h2>
                <div
                  className="w-36 h-[1px] mx-auto mt-3"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent, var(--color-line), transparent)',
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeSiteData.videos.map((video) => (
                  <StudioVideoPlayer key={video.id} video={video} />
                ))}
              </div>
            </section>

            {/* SECTION 4: ABOUT MOSTAFA SHIRI (#about-section) */}
            <section id="about-section" className="scroll-mt-24">
              <TiltCard3D
                enable3D={activeSiteData.template.enable3DTilt && !isVisualEditMode}
                enableGlow={activeSiteData.template.enableCursorGlow}
                maxTiltDeg={4}
                className="p-6 sm:p-10"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-8 space-y-4">
                    <div className="inline-flex items-center gap-2 text-xs text-[var(--color-gold)]">
                      <UserCheck className="w-4 h-4" />
                      <span>BIOGRAPHY & OFFICIAL PROFILE</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-main)]">
                      {activeSiteData.template.aboutSectionTitle ||
                        `درباره ${activeSiteData.profile.nameFa} (${activeSiteData.profile.nameEn})`}
                    </h2>

                    {isVisualEditMode ? (
                      <textarea
                        rows={5}
                        value={activeSiteData.profile.fullBio}
                        onChange={(e) =>
                          setDraftSiteData((prev) => ({
                            ...prev,
                            profile: { ...prev.profile, fullBio: e.target.value },
                          }))
                        }
                        className="w-full rounded-xl bg-black/75 border border-dashed border-[var(--color-gold)] p-3 text-sm text-[var(--text-main)] leading-7"
                      />
                    ) : (
                      <p className="text-sm sm:text-base text-[var(--text-main)]/90 leading-8">
                        {activeSiteData.profile.fullBio}
                      </p>
                    )}

                    {/* Dynamic Compiled Template Block */}
                    {activeSiteData.template.showCustomTemplateBlock && compiledTemplateHtml && (
                      <div
                        className="mt-4 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-gold)]/35 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: compiledTemplateHtml }}
                      />
                    )}
                  </div>

                  <div className="lg:col-span-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--color-border)] p-5 space-y-4">
                    <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-black border border-[var(--color-border)]">
                      <img
                        src="https://rozup.ir/view/4358537/1000182979.jpg"
                        alt={activeSiteData.profile.nameFa}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = fallbackCover;
                        }}
                        className="w-full h-full object-cover object-top"
                      />
                    </div>

                    <h3 className="text-sm font-bold text-[var(--color-gold)] border-b border-[var(--color-border)] pb-2">
                      مشخصات هنری و ارتباط مستقیم
                    </h3>
                    <div className="space-y-2 text-xs text-[var(--text-muted)]">
                      <p>
                        <strong className="text-[var(--text-main)]">استودیو و لیبل:</strong>{' '}
                        {activeSiteData.profile.studioName}
                      </p>
                      <p>
                        <strong className="text-[var(--text-main)]">موقعیت:</strong>{' '}
                        {activeSiteData.profile.location}
                      </p>
                      <p>
                        <strong className="text-[var(--text-main)]">پلتفرم‌های رسمی:</strong>{' '}
                        Spotify, Apple Music, YouTube, Amazon Music, Deezer, Tidal
                      </p>
                    </div>
                  </div>
                </div>
              </TiltCard3D>
            </section>
          </div>
        </main>
      )}

      {/* Footer with Discreet, Low-Contrast Password-Protected Admin Link */}
      <footer className="mt-16 border-t border-[var(--color-border)] bg-[var(--bg-card)] py-10 px-4 text-center text-xs text-[var(--text-muted)]">
        <div className="max-w-4xl mx-auto space-y-3">
          <p className="font-bold text-[var(--color-gold)] text-sm">
            © ۱۴۰۵ وب‌سایت رسمی «{activeSiteData.profile.nameFa}» ({activeSiteData.profile.nameEn}) · تمامی حقوق محفوظ است.
          </p>
          <p className="text-[11px] text-[var(--text-muted)]/80">
            پخش آنلاین آثار رسمی و پلتفرم‌های جهانی استریم موسیقی
          </p>

          {/* Subtle, low-contrast Admin Panel trigger in Footer as requested */}
          <div className="pt-3 flex items-center justify-center gap-4">
            <a
              href="#admin"
              onClick={() => {
                window.location.hash = '#admin';
              }}
              className="inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)] opacity-35 hover:opacity-85 hover:text-[var(--color-gold)] transition-opacity"
            >
              <Lock className="w-3 h-3" />
              <span>پنل مدیریت</span>
            </a>

            {sessionStorage.getItem(STORAGE_KEYS.ADMIN_SESSION_KEY) === 'true' &&
              !isVisualEditMode && (
                <button
                  type="button"
                  onClick={() => {
                    setDraftSiteData(siteData);
                    setIsVisualEditMode(true);
                    window.location.hash = '#home';
                  }}
                  className="inline-flex items-center gap-1 text-[11px] text-[var(--color-gold)] opacity-55 hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Eye className="w-3 h-3" />
                  <span>ویرایش زنده صفحه</span>
                </button>
              )}
          </div>
        </div>
      </footer>

      {/* Persistent Studio Audio Player & 5-Band Equalizer Dock */}
      <StudioAudioPlayer
        currentTrack={currentTrack}
        tracks={activeSiteData.tracks}
        onSelectTrack={(trk) => {
          setCurrentTrack(trk);
          setIsPlaying(true);
        }}
        isPlaying={isPlaying}
        onPlayStateChange={setIsPlaying}
        forceOpenEq={forceOpenEq}
        onCloseEq={() => setForceOpenEq(false)}
      />
    </div>
  );
}

export default App;
