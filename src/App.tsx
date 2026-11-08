import React, { useEffect, useMemo, useState } from 'react';
import {
  Play,
  Pause,
  Sliders,
  Sun,
  Moon,
  Settings,
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
} from 'lucide-react';
import {
  SiteData,
  TrackItem,
  TrackCategory,
  DEFAULT_SITE_DATA,
  STORAGE_KEYS,
  filterTracks,
  compileRozblogTemplate,
} from './utils/shiriData';
import { TiltCard3D } from './components/shiri/TiltCard3D';
import { HeroSection3D } from './components/shiri/HeroSection3D';
import { StudioAudioPlayer } from './components/shiri/StudioAudioPlayer';
import { StudioVideoPlayer } from './components/shiri/StudioVideoPlayer';
import { TrackDetailView } from './components/shiri/TrackDetailView';
import { RozblogAdminPanel } from './components/shiri/RozblogAdminPanel';
import fallbackCover from './assets/images/album_cover_golden_night_1794140915037.jpg';

export function App() {
  // Site Data State (Loaded from LocalStorage cache + synced with /api/shiri/data or Cloudflare Worker)
  const [siteData, setSiteData] = useState<SiteData>(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEYS.STORAGE_DATA_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.tracks) && parsed.profile) {
          return { ...DEFAULT_SITE_DATA, ...parsed };
        }
      }
    } catch {
      // ignore corrupted cache
    }
    return DEFAULT_SITE_DATA;
  });

  // Theme Mode ('dark' | 'light')
  const [themeMode, setThemeMode] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME_KEY);
    return saved === 'light' ? 'light' : 'dark';
  });

  // Active Route from URL Hash (#home, #track/:slug, #post/:slug, #admin)
  const [hashRoute, setHashRoute] = useState<string>(() => window.location.hash || '#home');

  // Music Filter & Search State
  const [selectedCategory, setSelectedCategory] = useState<'all' | TrackCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Studio Audio Player State
  const [currentTrack, setCurrentTrack] = useState<TrackItem | null>(
    () => siteData.tracks[0] || null
  );
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [forceOpenEq, setForceOpenEq] = useState<boolean>(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Sync URL hash changes
  useEffect(() => {
    const onHashChange = () => {
      setHashRoute(window.location.hash || '#home');
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  // Apply Theme Mode & Custom CSS Variables from Rozblog Template Studio
  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }
    localStorage.setItem(STORAGE_KEYS.THEME_KEY, themeMode);

    // Apply live template colors when in dark/custom mode
    if (themeMode === 'dark' && siteData.template) {
      root.style.setProperty('--bg-main', siteData.template.bgMain || '#050505');
      root.style.setProperty('--bg-card', siteData.template.bgCard || '#080808');
      root.style.setProperty('--bg-surface', siteData.template.bgSurface || '#0d0b08');
      root.style.setProperty('--color-gold', siteData.template.colorGold || '#d6b36c');
      root.style.setProperty('--color-border', siteData.template.colorBorder || '#29231a');
    } else {
      root.style.removeProperty('--bg-main');
      root.style.removeProperty('--bg-card');
      root.style.removeProperty('--bg-surface');
      root.style.removeProperty('--color-gold');
      root.style.removeProperty('--color-border');
    }
  }, [themeMode, siteData.template]);

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
              setSiteData((prev) => ({ ...prev, ...remote }));
              localStorage.setItem(
                STORAGE_KEYS.STORAGE_DATA_KEY,
                JSON.stringify({ ...DEFAULT_SITE_DATA, ...remote })
              );
              return;
            }
          }
        }

        const apiRes = await fetch('/api/shiri/data');
        if (apiRes.ok) {
          const payload = await apiRes.json();
          if (payload?.data && Array.isArray(payload.data.tracks)) {
            setSiteData((prev) => ({ ...prev, ...payload.data }));
            localStorage.setItem(
              STORAGE_KEYS.STORAGE_DATA_KEY,
              JSON.stringify({ ...DEFAULT_SITE_DATA, ...payload.data })
            );
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

  // Filtered Tracks
  const filteredTracks = useMemo(
    () => filterTracks(siteData.tracks, selectedCategory, searchQuery),
    [siteData.tracks, selectedCategory, searchQuery]
  );

  // Compiled Rozblog Custom Template HTML
  const compiledTemplateHtml = useMemo(
    () => compileRozblogTemplate(siteData.template.customRozblogTemplate, siteData),
    [siteData]
  );

  // Route Parsing
  const activeTrackFromHash = useMemo(() => {
    if (!hashRoute.startsWith('#track/')) return null;
    const slug = decodeURIComponent(hashRoute.replace('#track/', '').trim());
    return siteData.tracks.find((t) => t.slug === slug || t.id === slug) || null;
  }, [hashRoute, siteData.tracks]);

  const activePostFromHash = useMemo(() => {
    if (!hashRoute.startsWith('#post/')) return null;
    const slug = decodeURIComponent(hashRoute.replace('#post/', '').trim());
    return siteData.blog.find((p) => p.slug === slug || p.id === slug) || null;
  }, [hashRoute, siteData.blog]);

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
          title: `${siteData.profile.nameFa} | وب‌سایت رسمی`,
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

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-main)] pb-28">
      {/* Top Custom Rozblog Announcement Bars (if enabled) */}
      {siteData.customBlocks
        .filter((b) => b.enabled && b.position === 'top')
        .map((blk) => (
          <div
            key={blk.id}
            className="bg-[var(--bg-surface)] border-b border-[var(--color-gold)]/25 px-4 py-2 text-center text-xs text-[var(--color-gold)] flex items-center justify-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>{blk.htmlContent}</span>
          </div>
        ))}

      {/* 3-Zone Sticky Header matching Reference HTML & Frontend Design Contract */}
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
            {siteData.profile.monogram || 'MS'}
          </div>
          <div className="flex flex-col">
            <span
              dir="ltr"
              className="font-cinzel text-sm sm:text-base font-bold tracking-[3px] text-[var(--color-gold)]"
            >
              {siteData.profile.nameEn}
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">
              {siteData.profile.nameFa} · وب‌سایت رسمی
            </span>
          </div>
        </a>

        {/* Zone 2: Single-Line Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          {siteData.menu.slice(0, 5).map((item) => (
            <a
              key={item.id}
              href={item.link}
              className="text-sm font-medium text-[var(--text-main)] hover:text-[var(--color-gold)] whitespace-nowrap transition-colors"
            >
              {item.title}
            </a>
          ))}
        </nav>

        {/* Zone 3: Theme Toggle & Primary Studio/Admin CTA */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
            aria-label="تغییر تم روشن یا تاریک"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-[#050505] transition-all cursor-pointer"
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

          <button
            type="button"
            onClick={() => {
              window.location.hash = isAdminView ? '#home' : '#admin';
            }}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              isAdminView
                ? 'bg-[var(--color-gold)] text-[#050505] border-[var(--color-gold)]'
                : 'bg-[var(--bg-surface)] text-[var(--text-main)] border-[var(--color-gold)]/50 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-[var(--color-gold)]" />
            <span>{isAdminView ? 'بازگشت به سایت' : 'پنل مدیریت رزبلاگ'}</span>
          </button>
        </div>
      </header>

      {/* VIEW 1: ROZBLOG ADMIN PANEL (#admin) */}
      {isAdminView ? (
        <main className="flex-1">
          <RozblogAdminPanel
            siteData={siteData}
            onUpdateSiteData={handleUpdateSiteData}
            onCloseAdmin={() => {
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
            enable3DTilt={siteData.template.enable3DTilt}
            enableCursorGlow={siteData.template.enableCursorGlow}
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
                  ? 'لینک یادداشت کپی شد'
                  : 'اشتراک‌گذاری لینک مستقیم'}
              </span>
            </button>
          </div>

          <article className="rounded-[26px] bg-[var(--bg-card)] border border-[var(--color-border)] overflow-hidden shadow-[var(--shadow-card)]">
            <div className="aspect-[21/9] w-full overflow-hidden bg-black">
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
                <div className="mb-6 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-gold)]/35 flex items-center justify-between gap-4">
                  <span className="text-xs font-bold text-[var(--color-gold)]">
                    فایل صوتی پیوست این یادداشت:
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
          {/* 4D Interactive Hero Section */}
          <HeroSection3D
            profile={siteData.profile}
            template={siteData.template}
            latestTrack={siteData.tracks[0]}
            isPlaying={isPlaying}
            onPlayLatest={() => {
              if (siteData.tracks[0]) {
                handlePlayTrack(siteData.tracks[0]);
              }
            }}
            onOpenEqualizer={() => {
              if (!currentTrack && siteData.tracks[0]) {
                setCurrentTrack(siteData.tracks[0]);
              }
              setForceOpenEq(true);
            }}
          />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 space-y-20">
            {/* SECTION 1: MUSIC & SINGLES GALLERY (#tracks-section) */}
            <section id="tracks-section" className="scroll-mt-24">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 text-xs text-[var(--color-gold)] tracking-widest uppercase mb-1.5">
                  <Music2 className="w-4 h-4" />
                  <span>DISCOGRAPHY & STUDIO SINGLES</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[var(--color-gold)]">
                  آرشیو آثار صوتی و تک‌آهنگ‌ها
                </h2>
                <div
                  className="w-36 h-[1px] mx-auto mt-3"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent, var(--color-line), transparent)',
                  }}
                />
              </div>

              {/* Interactive Category Filter Tabs + Search Input */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <div className="flex flex-wrap items-center gap-2">
                  {[
                    { id: 'all', label: 'همه آثار' },
                    { id: 'single', label: 'تک‌آهنگ‌ها' },
                    { id: 'collaboration', label: 'همکاری‌ها' },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSelectedCategory(tab.id as 'all' | TrackCategory)}
                      className={`px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer border ${
                        selectedCategory === tab.id
                          ? 'bg-[var(--color-gold)] text-[#050505] border-[var(--color-gold)] shadow-[0_4px_15px_rgba(214,179,108,0.3)]'
                          : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--color-border)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Search Input */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 text-[var(--text-muted)] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="جستجو در نام اثر یا ترانه..."
                    className="w-full pr-10 pl-3.5 py-2 rounded-full bg-[var(--bg-card)] border border-[var(--color-border)] focus:border-[var(--color-gold)] text-xs text-[var(--text-main)] outline-none"
                  />
                </div>
              </div>

              {/* 3D Interactive Music Cards Grid */}
              <div
                className={`grid grid-cols-1 ${
                  siteData.template.gridColumns === 3
                    ? 'md:grid-cols-2 lg:grid-cols-3'
                    : 'md:grid-cols-2'
                } gap-7`}
              >
                {filteredTracks.map((track) => {
                  const isThisPlaying = currentTrack?.id === track.id && isPlaying;
                  return (
                    <TiltCard3D
                      key={track.id}
                      enable3D={siteData.template.enable3DTilt}
                      enableGlow={siteData.template.enableCursorGlow}
                      className="flex flex-col h-full p-5"
                    >
                      {/* 1:1 Album Art Container with Hover Zoom & Click Shockwave */}
                      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-black mb-4 border border-[var(--color-border)]">
                        <img
                          src={track.image || fallbackCover}
                          alt={track.title}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = fallbackCover;
                          }}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />

                        {/* Subtle Dark Gradient & Play Trigger */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent flex items-end justify-between p-4">
                          <span className="font-mono-num text-xs text-[var(--color-gold)] bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-md border border-[var(--color-gold)]/30">
                            {track.duration}
                          </span>

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePlayTrack(track);
                            }}
                            aria-label={`پخش ${track.title}`}
                            className="w-12 h-12 rounded-full bg-[var(--color-gold)] text-[#050505] flex items-center justify-center shadow-[0_0_25px_rgba(214,179,108,0.55)] hover:scale-110 transition-transform cursor-pointer"
                          >
                            {isThisPlaying ? (
                              <Pause className="w-5 h-5 fill-current" />
                            ) : (
                              <Play className="w-5 h-5 fill-current ml-0.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Metadata & Actions */}
                      <div className="flex-1 flex flex-col justify-between text-right">
                        <div>
                          {/* Zero-Pill Inline Metadata */}
                          <p className="text-xs text-[var(--color-gold)] mb-1">
                            {track.category === 'collaboration' ? 'همکاری مشترک' : 'تک‌آهنگ رسمی'} ·{' '}
                            {track.releaseDate} · تنظیم: {track.arrangement}
                          </p>
                          <h3 className="text-xl font-bold text-[var(--text-main)] mb-1.5">
                            {track.title}
                          </h3>
                          <p className="text-xs sm:text-sm text-[var(--text-muted)] mb-4">
                            {track.subtitle}
                          </p>
                        </div>

                        <div className="pt-3.5 border-t border-[var(--color-border)] flex items-center justify-between gap-2">
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
                                  <span>پخش استودیویی</span>
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
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold text-[var(--text-main)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors"
                          >
                            <span>صفحه اختصاصی و ترانه</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </TiltCard3D>
                  );
                })}
              </div>
            </section>

            {/* SECTION 2: STUDIO MUSIC VIDEOS & LIVE REELS (#videos-section) */}
            <section id="videos-section" className="scroll-mt-24">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 text-xs text-[var(--color-gold)] tracking-widest uppercase mb-1.5">
                  <Video className="w-4 h-4" />
                  <span>OFFICIAL MUSIC VIDEOS & LIVE SESSIONS</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[var(--color-gold)]">
                  موزیک‌ویدیوها و اجراهای زنده استودیویی
                </h2>
                <div
                  className="w-36 h-[1px] mx-auto mt-3"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent, var(--color-line), transparent)',
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                {siteData.videos.map((video) => (
                  <StudioVideoPlayer key={video.id} video={video} />
                ))}
              </div>
            </section>

            {/* SECTION 3: ARTIST BLOG & STUDIO NOTES (#blog-section) */}
            <section id="blog-section" className="scroll-mt-24">
              <div className="text-center mb-8">
                <div className="inline-flex items-center gap-2 text-xs text-[var(--color-gold)] tracking-widest uppercase mb-1.5">
                  <BookOpen className="w-4 h-4" />
                  <span>STUDIO JOURNAL & ARTIST NOTES</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-[var(--color-gold)]">
                  یادداشت‌های استودیویی و وبلاگ
                </h2>
                <div
                  className="w-36 h-[1px] mx-auto mt-3"
                  style={{
                    background:
                      'linear-gradient(90deg, transparent, var(--color-line), transparent)',
                  }}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                {siteData.blog.map((post) => (
                  <TiltCard3D
                    key={post.id}
                    enable3D={siteData.template.enable3DTilt}
                    enableGlow={siteData.template.enableCursorGlow}
                    className="flex flex-col h-full p-5"
                  >
                    <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-black mb-4 border border-[var(--color-border)]">
                      <img
                        src={post.coverImage || fallbackCover}
                        alt={post.title}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = fallbackCover;
                        }}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <p className="text-xs text-[var(--color-gold)] mb-1.5">
                          {post.category} · {post.date} · {post.readingTime}
                        </p>
                        <h3 className="text-lg font-bold text-[var(--text-main)] mb-2 leading-snug">
                          {post.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-4">
                          {post.excerpt}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[var(--color-border)] flex items-center justify-between">
                        <a
                          href={`#post/${post.slug}`}
                          className="text-xs font-bold text-[var(--color-gold)] hover:underline"
                        >
                          مطالعه کامل یادداشت ←
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
            </section>

            {/* SECTION 4: ABOUT MOSTAFA SHIRI & ROZBLOG DYNAMIC TEMPLATE BLOCK (#about-section) */}
            <section id="about-section" className="scroll-mt-24">
              <TiltCard3D
                enable3D={siteData.template.enable3DTilt}
                enableGlow={siteData.template.enableCursorGlow}
                maxTiltDeg={4}
                className="p-6 sm:p-10"
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  <div className="lg:col-span-8 space-y-4">
                    <div className="inline-flex items-center gap-2 text-xs text-[var(--color-gold)]">
                      <UserCheck className="w-4 h-4" />
                      <span>BIOGRAPHY & STUDIO PHILOSOPHY</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-[var(--text-main)]">
                      درباره {siteData.profile.nameFa} ({siteData.profile.nameEn})
                    </h2>
                    <p className="text-sm sm:text-base text-[var(--text-main)]/90 leading-8">
                      {siteData.profile.fullBio}
                    </p>

                    {/* Dynamic Rozblog Compiled Template Block */}
                    {siteData.template.showCustomTemplateBlock && compiledTemplateHtml && (
                      <div
                        className="mt-4 p-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-gold)]/35 text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: compiledTemplateHtml }}
                      />
                    )}
                  </div>

                  <div className="lg:col-span-4 rounded-2xl bg-[var(--bg-surface)] border border-[var(--color-border)] p-6 space-y-4">
                    <h3 className="text-sm font-bold text-[var(--color-gold)] border-b border-[var(--color-border)] pb-2.5">
                      مشخصات استودیو و ارتباط مستقیم
                    </h3>
                    <div className="space-y-2 text-xs text-[var(--text-muted)]">
                      <p>
                        <strong className="text-[var(--text-main)]">استودیو تولید:</strong>{' '}
                        {siteData.profile.studioName}
                      </p>
                      <p>
                        <strong className="text-[var(--text-main)]">موقعیت:</strong>{' '}
                        {siteData.profile.location}
                      </p>
                      <p>
                        <strong className="text-[var(--text-main)]">ایمیل رسمی:</strong>{' '}
                        <span className="font-mono-num">{siteData.profile.contactEmail}</span>
                      </p>
                    </div>

                    <div className="pt-2 flex flex-wrap gap-2">
                      {siteData.socials.map((soc) => (
                        <a
                          key={soc.id}
                          href={soc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-[var(--bg-card)] border border-[var(--color-border)] hover:border-[var(--color-gold)] text-xs text-[var(--color-gold)] transition-colors"
                        >
                          {soc.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </TiltCard3D>
            </section>
          </div>
        </main>
      )}

      {/* Footer matching Reference HTML */}
      <footer className="mt-16 border-t border-[var(--color-border)] bg-[var(--bg-card)] py-10 px-4 text-center text-xs text-[var(--text-muted)]">
        <div className="max-w-4xl mx-auto space-y-2">
          <p className="font-bold text-[var(--color-gold)] text-sm">
            © ۱۴۰۵ تمامی حقوق آثار صوتی، ترانه‌ها و تنظیم‌ها متعلق به «{siteData.profile.nameFa}» است.
          </p>
          <p>
            مجهز به پلیر استودیویی، اکولایزر ۵ بانده Web Audio DSP و سامانه مدیریت محتوای اختصاصی رزبلاگ
          </p>
        </div>
      </footer>

      {/* Persistent Studio Audio Player & 5-Band Equalizer Dock */}
      <StudioAudioPlayer
        currentTrack={currentTrack}
        tracks={siteData.tracks}
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
