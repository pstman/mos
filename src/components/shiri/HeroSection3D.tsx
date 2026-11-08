import React, { useEffect, useRef, useState } from 'react';
import { Play, Sliders, Disc3 } from 'lucide-react';
import { ArtistProfile, TemplateConfig, TrackItem } from '../../utils/shiriData';
import defaultHeroImg from '../../assets/images/hero_singer_studio_banner_1794140914800.jpg';

interface HeroSection3DProps {
  profile: ArtistProfile;
  template: TemplateConfig;
  latestTrack?: TrackItem;
  isPlaying: boolean;
  onPlayLatest: () => void;
  onOpenEqualizer: () => void;
}

/**
 * 4D Interactive Hero Banner matching the Mostafa Shiri reference layout
 * with cursor-reactive golden acoustic wave particles, parallax depth, and studio trigger.
 */
export const HeroSection3D: React.FC<HeroSection3DProps> = ({
  profile,
  template,
  latestTrack,
  isPlaying,
  onPlayLatest,
  onOpenEqualizer,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mouseOffset, setMouseOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [bannerSrc, setBannerSrc] = useState<string>(template.desktopBannerUrl || defaultHeroImg);

  useEffect(() => {
    setBannerSrc(template.desktopBannerUrl || defaultHeroImg);
  }, [template.desktopBannerUrl]);

  // 4D Acoustic Particle & Soundwave Field Canvas
  useEffect(() => {
    if (!template.enableHeroParticles) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let width = (canvas.width = canvas.offsetWidth || 1200);
    let height = (canvas.height = canvas.offsetHeight || 520);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth || 1200;
      height = canvas.height = canvas.offsetHeight || 520;
    };
    window.addEventListener('resize', handleResize);

    const particles = Array.from({ length: 38 }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 1 + Math.random() * 2.2,
      vx: (Math.random() - 0.5) * 0.35,
      vy: -0.15 - Math.random() * 0.35,
      alpha: 0.15 + Math.random() * 0.45,
      phase: i * 0.4,
    }));

    let tick = 0;
    const render = () => {
      tick += isPlaying ? 0.045 : 0.018;
      ctx.clearRect(0, 0, width, height);

      // Subtle 4D Acoustic Sine Ribbon near the bottom horizon
      ctx.save();
      ctx.beginPath();
      const baseY = height * 0.78;
      for (let x = 0; x <= width; x += 12) {
        const wave1 = Math.sin(x * 0.006 + tick) * (isPlaying ? 18 : 7);
        const wave2 = Math.cos(x * 0.013 - tick * 1.3) * (isPlaying ? 10 : 4);
        const y = baseY + wave1 + wave2;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(214, 179, 108, 0.22)';
      ctx.lineWidth = 1.5;
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
    const nx = ((e.clientX - rect.left) / rect.width - 0.5) * 24;
    const ny = ((e.clientY - rect.top) / rect.height - 0.5) * 16;
    setMouseOffset({ x: nx, y: ny });
  };

  return (
    <section
      id="home"
      ref={containerRef}
      onMouseMove={handleHeroMouseMove}
      onMouseLeave={() => setMouseOffset({ x: 0, y: 0 })}
      className="relative w-full overflow-hidden border-b border-[var(--color-border)] bg-[var(--bg-main)] select-none"
    >
      {/* Hero Banner Visual Container */}
      <div className="relative w-full min-h-[460px] md:min-h-[560px] lg:min-h-[620px] flex items-end justify-center overflow-hidden">
        {/* Parallax Studio Photography Background */}
        <img
          src={bannerSrc}
          alt={profile.nameFa}
          onError={() => {
            if (bannerSrc !== defaultHeroImg) {
              setBannerSrc(defaultHeroImg);
            }
          }}
          style={{
            transform: `scale(1.05) translate3d(${(mouseOffset.x * -0.45).toFixed(1)}px, ${(mouseOffset.y * -0.45).toFixed(1)}px, 0)`,
            transition: 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
            filter: 'var(--banner-filter)',
          }}
          className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none"
        />

        {/* Atmospheric Obsidian & Gold Radial Vignette Overlays */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(to top, var(--bg-main) 6%, rgba(5, 5, 5, 0.72) 48%, rgba(5, 5, 5, 0.35) 100%), radial-gradient(circle at 50% 30%, rgba(214, 179, 108, 0.16), transparent 65%)',
          }}
        />

        {/* 4D Acoustic Particle & Soundwave Canvas */}
        {template.enableHeroParticles && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-10"
          />
        )}

        {/* Centerpiece Overlay Content matching Reference HTML (`hero-overlay-content`) */}
        <div
          style={{
            transform: `translate3d(${(mouseOffset.x * 0.35).toFixed(1)}px, ${(mouseOffset.y * 0.35).toFixed(1)}px, 0)`,
            transition: 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)',
          }}
          className="relative z-20 w-full max-w-4xl mx-auto px-6 pt-24 pb-12 md:pb-16 text-center flex flex-col items-center"
        >
          {/* Golden Monogram Circle (`MS`) */}
          <div className="mb-4 w-16 h-16 md:w-20 md:h-20 rounded-full border border-[var(--color-gold)]/70 bg-black/65 backdrop-blur-md flex items-center justify-center shadow-[0_0_35px_rgba(214,179,108,0.28)] transition-transform duration-500 hover:scale-110">
            <span className="font-cinzel text-xl md:text-2xl font-bold tracking-widest text-[var(--color-gold)]">
              {profile.monogram || 'MS'}
            </span>
          </div>

          {/* Official Artist Subtitle */}
          <span
            dir="ltr"
            className="font-cinzel text-[11px] md:text-[13px] tracking-[5px] uppercase text-[var(--color-gold)] mb-2.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]"
          >
            OFFICIAL ARTIST WEBSITE
          </span>

          {/* Main Persian Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-3 drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]">
            {profile.nameFa}
          </h1>

          {/* Role Line (Zero-Pill inline separator) */}
          <p className="text-base md:text-xl font-medium text-[#e2d8c5] tracking-wide mb-5 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
            {profile.roleTitle}
          </p>

          {/* Signature Golden Line (`hero-gold-line`) */}
          <div
            className="w-40 md:w-56 h-[2px] mb-7"
            style={{
              background: 'linear-gradient(90deg, transparent, var(--color-gold), transparent)',
            }}
          />

          {/* Interactive Studio CTA Row */}
          <div className="flex flex-wrap items-center justify-center gap-3.5">
            {latestTrack && (
              <button
                type="button"
                onClick={onPlayLatest}
                className="group relative inline-flex items-center gap-3 px-6 py-3.5 rounded-xl bg-[var(--color-gold)] text-[#050505] font-bold text-sm md:text-base shadow-[0_10px_30px_rgba(214,179,108,0.3)] hover:bg-[var(--color-gold-hover)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current transition-transform group-hover:scale-110" />
                <span>
                  {isPlaying ? 'در حال پخش در استودیو' : `شنیدن «${latestTrack.title}»`}
                </span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenEqualizer}
              className="inline-flex items-center gap-2.5 px-5 py-3.5 rounded-xl bg-black/65 backdrop-blur-md border border-[var(--color-gold)]/45 text-[#f7f7f7] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] text-sm font-semibold transition-all duration-200 cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-[var(--color-gold)]" />
              <span>اکولایزر ۵ بانده و پلیر اختصاصی</span>
            </button>

            <a
              href="#tracks-section"
              className="inline-flex items-center gap-2 px-4 py-3.5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-white/85 hover:text-[var(--color-gold)] hover:border-[var(--color-gold)]/40 text-sm transition-all duration-200"
            >
              <Disc3 className="w-4 h-4 text-[var(--color-gold)]" />
              <span>آرشیو آثار ({profile.nameEn})</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
