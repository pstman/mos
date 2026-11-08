import React, { useState } from 'react';
import {
  ArrowRight,
  Play,
  Pause,
  Sliders,
  Download,
  Share2,
  Check,
  Disc3,
  Music2,
} from 'lucide-react';
import { TrackItem } from '../../utils/shiriData';
import { TiltCard3D } from './TiltCard3D';
import fallbackCover from '../../assets/images/album_cover_golden_night_1794140915037.jpg';

interface TrackDetailViewProps {
  track: TrackItem;
  isPlayingThis: boolean;
  enable3DTilt: boolean;
  enableCursorGlow: boolean;
  onPlayToggle: () => void;
  onOpenEqualizer: () => void;
  onBack: () => void;
}

/**
 * Dedicated Deep-Linked Track Page (#track/:slug)
 * with 3D Interactive Cover Art, Studio Credits, Equalizer Trigger, and Full Lyrics.
 */
export const TrackDetailView: React.FC<TrackDetailViewProps> = ({
  track,
  isPlayingThis,
  enable3DTilt,
  enableCursorGlow,
  onPlayToggle,
  onOpenEqualizer,
  onBack,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#track/${track.slug}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${track.title} — مصطفی شیری`,
          text: `${track.title} (${track.subtitle}) | وب‌سایت رسمی مصطفی شیری`,
          url: shareUrl,
        });
        return;
      } catch {
        // fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      {/* Back Button */}
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--color-border)] text-[var(--color-gold)] hover:bg-[var(--color-gold)] hover:text-[#050505] font-semibold text-sm transition-all cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>بازگشت به آرشیو آثار</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--color-border)] text-[var(--text-main)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] text-xs md:text-sm transition-all cursor-pointer"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-[var(--color-gold)]" />}
          <span>{copied ? 'لینک مستقیم اثر کپی شد' : 'اشتراک‌گذاری لینک مستقیم'}</span>
        </button>
      </div>

      {/* Main Studio Detail Card */}
      <div className="rounded-[26px] bg-[var(--bg-card)] border border-[var(--color-border)] p-6 sm:p-10 shadow-[var(--shadow-card)]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* 3D Interactive Cover Art */}
          <div className="md:col-span-5">
            <TiltCard3D
              enable3D={enable3DTilt}
              enableGlow={enableCursorGlow}
              maxTiltDeg={12}
              onClick={onPlayToggle}
              className="aspect-square w-full max-w-[320px] mx-auto cursor-pointer"
            >
              <img
                src={track.image || fallbackCover}
                alt={track.title}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = fallbackCover;
                }}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end justify-between p-4">
                <span className="font-mono-num text-xs text-[var(--color-gold)] bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-md border border-[var(--color-gold)]/30">
                  {track.duration}
                </span>
                <div className="w-11 h-11 rounded-full bg-[var(--color-gold)] text-[#050505] flex items-center justify-center shadow-lg">
                  {isPlayingThis ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </div>
              </div>
            </TiltCard3D>
          </div>

          {/* Track Metadata & Studio Controls */}
          <div className="md:col-span-7 flex flex-col justify-center text-right">
            <div className="flex items-center gap-2 text-xs text-[var(--color-gold)] mb-2">
              <Disc3 className="w-4 h-4" />
              <span>
                {track.category === 'collaboration' ? 'همکاری مشترک' : 'تک‌آهنگ رسمی'} · انتشار: {track.releaseDate}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-[var(--text-main)] mb-2">
              {track.title}
            </h1>

            <p className="text-sm sm:text-base text-[var(--text-muted)] mb-5">
              {track.subtitle}
            </p>

            {/* Technical Studio Credits Line (Zero-Pill inline text) */}
            <div className="py-3.5 px-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)] text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed mb-6">
              <div>
                <span className="text-[var(--color-gold)] font-semibold">خواننده و آهنگساز:</span> مصطفی شیری ·{' '}
                <span className="text-[var(--color-gold)] font-semibold">تنظیم:</span> {track.arrangement}
              </div>
              <div className="mt-1">
                <span className="text-[var(--color-gold)] font-semibold">میکس و مسترینگ:</span> {track.mixMaster}
                {track.musicalKey ? ` · گام: ${track.musicalKey}` : ''}
                {track.bpm ? ` · تمپو: ${track.bpm} BPM` : ''}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onPlayToggle}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[var(--color-gold)] text-[#050505] font-bold text-sm hover:bg-[var(--color-gold-hover)] shadow-[0_8px_25px_rgba(214,179,108,0.3)] transition-all cursor-pointer"
              >
                {isPlayingThis ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" />
                    <span>توقف پخش استودیویی</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>پخش در پلیر استودیویی</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onOpenEqualizer}
                className="inline-flex items-center gap-2 px-4 py-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-gold)]/50 text-[var(--color-gold)] hover:bg-[var(--color-gold)]/15 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
              >
                <Sliders className="w-4 h-4" />
                <span>تنظیم اکولایزر ۵ بانده</span>
              </button>

              <a
                href={track.audio}
                download={`${track.slug}.mp3`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-3.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--color-border)] text-[var(--text-main)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] text-xs sm:text-sm transition-all"
              >
                <Download className="w-4 h-4 text-[var(--color-gold)]" />
                <span>دانلود مستقیم فایل صوتی</span>
              </a>
            </div>
          </div>
        </div>

        {/* Lyrics Box matching Reference HTML `.lyrics-box` */}
        {track.lyrics && (
          <div className="mt-10 pt-8 border-t border-[var(--color-border)]">
            <div className="flex items-center justify-center gap-2 text-sm font-bold text-[var(--color-gold)] mb-4">
              <Music2 className="w-4 h-4" />
              <span>متن ترانه «{track.title}»</span>
            </div>
            <div className="max-w-2xl mx-auto rounded-2xl bg-[var(--bg-surface)] border border-[var(--color-border)] p-6 sm:p-8 text-center whitespace-pre-line leading-9 text-base sm:text-lg text-[var(--text-main)]">
              {track.lyrics}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
