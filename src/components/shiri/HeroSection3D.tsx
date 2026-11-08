import React, { useEffect, useRef, useState } from 'react';
import { Play, Sliders, Disc3, Image as ImageIcon, Check } from 'lucide-react';
import { ArtistProfile, TemplateConfig, TrackItem } from '../../utils/shiriData';
import fallbackHeroImg from '../../assets/images/hero_singer_studio_banner_1794140914800.jpg';

interface HeroSection3DProps {
  profile: ArtistProfile;
  template: TemplateConfig;
  latestTrack?: TrackItem;
  isPlaying: boolean;
  isVisualEditMode?: boolean;
  onPlayLatest: () => void;
  onOpenEqualizer: () => void;
  onUpdateProfileField?: (field: keyof ArtistProfile, value: string) => void;
  onUpdateTemplateField?: (field: keyof TemplateConfig, value: any) => void;
}

/**
 * 4D Interactive Hero Banner using Mostafa Shiri's Authentic Desktop & Mobile Banners
 * (https://rozup.ir/view/4381092/Desktop_Banner.jpg & https://rozup.ir/view/4381032/Banner%20Mob%20Ver.png)
 * + Live Visual In-Place Editing support.
 */
export const HeroSection3D: React.FC<HeroSection3DProps> = ({
  profile,
  template,
  latestTrack,
  isPlaying,
  isVisualEditMode = false,
  onPlayLatest,
  onOpenEqualizer,
  onUpdateProfileField,
  onUpdateTemplateField,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouseOffset, setMouseOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [desktopSrc, setDesktopSrc] = useState<string>(
    template.desktopBannerUrl || 'https://rozup.ir/view/4381092/Desktop_Banner.jpg'
  );
  const [mobileSrc, setMobileSrc] = useState<string>(
    template.mobileBannerUrl || 'https://rozup.ir/view/4381032/Banner%20Mob%20Ver.png'
  );
  const [showBannerEditor, setShowBannerEditor] = useState<boolean>(false);

  useEffect(() => {
    setDesktopSrc(template.desktopBannerUrl || 'https://rozup.ir/view/4381092/Desktop_Banner.jpg');
    setMobileSrc(template.mobileBannerUrl || 'https://rozup.ir/view/4381032/Banner%20Mob%20Ver.png');
  }, [template.desktopBannerUrl, template.mobileBannerUrl]);

  // 4D Acoustic Particle & Soundwave Field Canvas
  useEffect(() => {
    if (!template.enableHeroParticles) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let width = (canvas.width = canvas.offsetWidth || 1200);
    let height = (canvas.height = canvas.offsetHeight || 420);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || 1200;
      height = canvas.height = canvas.offsetHeight || 420;
    };
    window.addEventListener('resize', handleResize);

    const particles = Array.from({ length: 34 }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 1 + Math.random() * 2.1,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -0.15 - Math.random() * 0.3,
      alpha: 0.14 + Math.random() * 0.4,
      phase: i * 0.4,
    }));

    let tick = 0;
    const render = () => {
      tick += isPlaying ? 0.045 : 0.018;
      ctx.clearRect(0, 0, width, height);

      // Subtle 4D Acoustic Sine Ribbon near the bottom horizon
      ctx.save();
      ctx.beginPath();
      const baseY = height * 0.82;
      for (let x = 0; x <= width; x += 12) {
        const wave1 = Math.sin(x * 0.006 + tick) * (isPlaying ? 16 : 6);
        const wave2 = Math.cos(x * 0.013 - tick * 1.3) * (isPlaying ? 9 : 3.5);
        const y = baseY + wave1 + wave2;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(214, 179, 108, 0.22)';
      ctx.lineWidth = 1.4;
      ctx.stroke();
      ctx.restore();

      // Floating Golden Dust Particles
      for (const p of particles) {
        p.x += p.vx + mouseOffset.x * 0.015;
        p.y += p.vy * (isPlaying ? 1.8 : 1);
        if (p.y < -10) p.y = height + 10;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const pulse = 0.65 + 0.35 * Math.sin(tick * 2 + p.phase);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(214, 179, 108, ${(p.alpha * pulse).toFixed(3)})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [template.enableHeroParticles, isPlaying, mouseOffset.x]);

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 14;
    setMouseOffset({ x: nx, y: ny });
  };

  return (
    <section
      id="home"
      ref={containerRef}
      onMouseMove={handleHeroMouseMove}
      onMouseLeave={() => setMouseOffset({ x: 0, y: 0 })}
      className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-3 pb-1 select-none"
    >
      {/* Hero Frame matching `.hero-art` from Mostafa Shiri Reference HTML */}
      <div className="relative w-full min-h-[210px] sm:min-h-[235px] md:min-h-[260px] rounded-[20px] overflow-hidden border border-[var(--color-border)] bg-[var(--bg-card)] flex items-end p-5 sm:p-7 md:px-12 isolate shadow-[var(--shadow-card)]">
        {/* Authentic Picture Element with Mobile & Desktop Banner from Reference HTML */}
        <picture className="absolute inset-0 -z-20 block w-full h-full pointer-events-none">
          <source media="(max-width: 650px)" srcSet={mobileSrc} />
          <img
            src={desktopSrc}
            alt={profile.nameFa}
            onError={() => {
              if (desktopSrc !== fallbackHeroImg) {
                setDesktopSrc(fallbackHeroImg);
              }
            }}
            style={{
              transform: `scale(1.03) translate3d(${(mouseOffset.x * -0.35).toFixed(1)}px, ${(mouseOffset.y * -0.35).toFixed(1)}px, 0)`,
              transition: 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
              filter: 'var(--banner-filter)',
            }}
            className="w-full h-full object-cover object-center block"
          />
        </picture>

        {/* Reference Gradient & Golden Bottom Glow */}
        <div
          className="absolute inset-0 -z-10 pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, rgba(0,0,0,0.62), rgba(0,0,0,0.24) 60%, rgba(0,0,0,0.52)), linear-gradient(to top, rgba(5,5,5,0.88) 0%, transparent 55%)',
          }}
        />
        <div
          className="absolute left-[8%] right-[8%] -bottom-16 h-28 z-0 pointer-events-none blur-[22px]"
          style={{
            background:
              'radial-gradient(ellipse at center, rgba(225,177,70,0.48), rgba(194,145,49,0.18) 38%, transparent 72%)',
          }}
        />

        {/* Giant Subtle Watermark Monogram (`MS`) matching `.hero-monogram` */}
        <div
          dir="ltr"
          className="absolute right-[8%] top-2 z-0 font-cormorant text-[120px] sm:text-[180px] md:text-[230px] leading-none text-[#e4cc9d]/10 pointer-events-none select-none"
        >
          {profile.monogram || 'MS'}
        </div>

        {/* 4D Acoustic Particle & Soundwave Canvas */}
        {template.enableHeroParticles && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
          />
        )}

        {/* Visual Edit Mode: Quick Banner Changer Button */}
        {isVisualEditMode && (
          <div className="absolute top-4 left-4 z-30">
            <button
              type="button"
              onClick={() => setShowBannerEditor(!showBannerEditor)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/80 border border-dashed border-[var(--color-gold)] text-[var(--color-gold)] text-xs font-bold shadow-lg cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>تغییر تصویر بنر دسکتاپ / موبایل</span>
            </button>

            {showBannerEditor && (
              <div className="mt-2 w-80 sm:w-96 p-4 rounded-2xl bg-[var(--bg-card)]/95 backdrop-blur-xl border border-[var(--color-gold)] shadow-2xl space-y-2.5 text-right">
                <span className="block text-xs font-bold text-[var(--color-gold)]">
                  لینک مستقیم بنر دسکتاپ و موبایل:
                </span>
                <div>
                  <label className="block text-[10px] text-[var(--text-muted)] mb-1">
                    بنر دسکتاپ (Desktop Banner URL):
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={template.desktopBannerUrl}
                    onChange={(e) =>
                      onUpdateTemplateField?.('desktopBannerUrl', e.target.value)
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--color-border)] text-xs font-mono-num text-[var(--text-main)]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[var(--text-muted)] mb-1">
                    بنر موبایل (Mobile Banner URL):
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={template.mobileBannerUrl}
                    onChange={(e) =>
                      onUpdateTemplateField?.('mobileBannerUrl', e.target.value)
                    }
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--color-border)] text-xs font-mono-num text-[var(--text-main)]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowBannerEditor(false)}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-[var(--color-gold)] text-[#050505] text-xs font-bold cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>بستن</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Foreground Hero Title & Interactive Actions matching `.hero-title` */}
        <div
          style={{
            transform: `translate3d(${(mouseOffset.x * 0.25).toFixed(1)}px, ${(mouseOffset.y * 0.25).toFixed(1)}px, 0)`,
            transition: 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
          className="relative z-20 w-full flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div className="text-right drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]">
            {/* Eyebrow (`OFFICIAL ARTIST WEBSITE`) */}
            {isVisualEditMode ? (
              <input
                type="text"
                dir="ltr"
                value={profile.eyebrowText || 'OFFICIAL ARTIST WEBSITE'}
                onChange={(e) => onUpdateProfileField?.('eyebrowText', e.target.value)}
                className="font-cormorant text-[11px] tracking-[3px] uppercase text-[var(--color-gold)] bg-black/60 border border-dashed border-[var(--color-gold)] rounded px-2 py-0.5 mb-1 outline-none"
              />
            ) : (
              <small
                dir="ltr"
                className="font-cormorant text-[11px] sm:text-xs tracking-[3px] uppercase text-[var(--color-gold)] inline-block"
              >
                {profile.eyebrowText || 'OFFICIAL ARTIST WEBSITE'}
              </small>
            )}

            {/* Main Artist Heading (`مصطفی شیری`) */}
            {isVisualEditMode ? (
              <div className="my-1.5">
                <input
                  type="text"
                  value={profile.nameFa}
                  onChange={(e) => onUpdateProfileField?.('nameFa', e.target.value)}
                  className="text-3xl sm:text-5xl font-bold text-white bg-black/60 border border-dashed border-[var(--color-gold)] rounded-xl px-3 py-1 outline-none w-full max-w-xs"
                />
              </div>
            ) : (
              <h1 className="text-3xl sm:text-5xl md:text-[54px] font-bold text-white my-1.5 leading-tight">
                {profile.nameFa.split(' ')[0]}{' '}
                <span className="text-[var(--color-gold-hover)]">
                  {profile.nameFa.split(' ').slice(1).join(' ') || 'شیری'}
                </span>
              </h1>
            )}

            {/* Role Subtitle (`خواننده · آهنگساز · تنظیم‌کننده`) */}
            {isVisualEditMode ? (
              <input
                type="text"
                value={profile.roleTitle}
                onChange={(e) => onUpdateProfileField?.('roleTitle', e.target.value)}
                className="text-xs sm:text-sm text-[#f0e6d2] bg-black/60 border border-dashed border-[var(--color-gold)] rounded-lg px-2.5 py-1 outline-none w-full max-w-sm"
              />
            ) : (
              <p className="text-xs sm:text-sm text-[#f0e6d2] m-0">{profile.roleTitle}</p>
            )}
          </div>

          {/* Studio Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {latestTrack && (
              <div className="flex items-center gap-1">
                {isVisualEditMode ? (
                  <input
                    type="text"
                    value={template.heroCtaPlayLabel}
                    onChange={(e) =>
                      onUpdateTemplateField?.('heroCtaPlayLabel', e.target.value)
                    }
                    className="px-3 py-2 rounded-xl bg-[var(--color-gold)] text-[#050505] font-bold text-xs border-2 border-dashed border-white outline-none"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={onPlayLatest}
                    className="group inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl bg-[var(--color-gold)] text-[#050505] font-bold text-xs sm:text-sm shadow-[0_8px_24px_rgba(214,179,108,0.32)] hover:bg-[var(--color-gold-hover)] hover:-translate-y-0.5 transition-all cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>
                      {isPlaying
                        ? 'در حال پخش در استودیو'
                        : `${template.heroCtaPlayLabel || 'پخش آنلاین'} «${latestTrack.title}»`}
                    </span>
                  </button>
                )}
              </div>
            )}

            {isVisualEditMode ? (
              <input
                type="text"
                value={template.heroCtaEqLabel}
                onChange={(e) => onUpdateTemplateField?.('heroCtaEqLabel', e.target.value)}
                className="px-3 py-2 rounded-xl bg-black/75 text-[var(--color-gold)] font-semibold text-xs border border-dashed border-[var(--color-gold)] outline-none"
              />
            ) : (
              <button
                type="button"
                onClick={onOpenEqualizer}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-black/70 backdrop-blur-md border border-[var(--color-gold)]/50 text-[#f7f7f7] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] text-xs font-semibold transition-all cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-[var(--color-gold)]" />
                <span>{template.heroCtaEqLabel || 'اکولایزر ۵ بانده استودیویی'}</span>
              </button>
            )}

            <a
              href="#singles"
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-black/55 backdrop-blur-sm border border-white/15 text-white/90 hover:text-[var(--color-gold)] hover:border-[var(--color-gold)]/45 text-xs transition-all"
            >
              <Disc3 className="w-3.5 h-3.5 text-[var(--color-gold)]" />
              <span>آثار</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
