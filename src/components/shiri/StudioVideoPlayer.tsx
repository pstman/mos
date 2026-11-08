import React, { useRef, useState } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Sparkles,
  Film,
} from 'lucide-react';
import { VideoItem, formatTimecode } from '../../utils/shiriData';
import fallbackPoster from '../../assets/images/hero_singer_studio_banner_1794140914800.jpg';

interface StudioVideoPlayerProps {
  video: VideoItem;
}

/**
 * Custom Luxury Video Player with Direct MP4/WebM Support,
 * Custom Volume Fader, Scrubber, Playback Speed, and 4D Ambient Golden Backlight.
 */
export const StudioVideoPlayer: React.FC<StudioVideoPlayerProps> = ({ video }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [ambientGlow, setAmbientGlow] = useState(true);
  const [speed, setSpeed] = useState(1);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    } else {
      v.pause();
      setIsPlaying(false);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setCurrentTime(val);
    if (videoRef.current) {
      videoRef.current.currentTime = val;
    }
  };

  const cycleSpeed = () => {
    const next = speed === 1 ? 1.25 : speed === 1.25 ? 1.5 : speed === 1.5 ? 0.75 : 1;
    setSpeed(next);
    if (videoRef.current) {
      videoRef.current.playbackRate = next;
    }
  };

  const handleFullscreen = () => {
    const el = wrapperRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    } else if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    }
  };

  return (
    <div
      ref={wrapperRef}
      className={`relative rounded-[22px] bg-[var(--bg-card)] border border-[var(--color-border)] hover:border-[var(--color-gold)] transition-all duration-300 overflow-hidden ${
        ambientGlow && isPlaying
          ? 'shadow-[0_0_55px_rgba(214,179,108,0.26)]'
          : 'shadow-[var(--shadow-card)]'
      }`}
    >
      {/* Video Frame */}
      <div className="relative aspect-video w-full bg-black overflow-hidden group">
        <video
          ref={videoRef}
          src={video.videoUrl}
          poster={video.posterUrl || fallbackPoster}
          playsInline
          preload="metadata"
          onClick={togglePlay}
          onTimeUpdate={() => {
            if (videoRef.current) setCurrentTime(videoRef.current.currentTime);
          }}
          onLoadedMetadata={() => {
            if (videoRef.current && Number.isFinite(videoRef.current.duration)) {
              setDuration(videoRef.current.duration);
            }
          }}
          onEnded={() => setIsPlaying(false)}
          className="w-full h-full object-cover cursor-pointer"
        />

        {/* Center Play Overlay when paused */}
        {!isPlaying && (
          <button
            type="button"
            onClick={togglePlay}
            aria-label={`پخش ویدیو ${video.title}`}
            className="absolute inset-0 flex items-center justify-center bg-black/45 group-hover:bg-black/35 transition-colors cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-[var(--color-gold)]/95 text-[#050505] flex items-center justify-center shadow-[0_0_35px_rgba(214,179,108,0.65)] transition-transform duration-300 group-hover:scale-110">
              <Play className="w-7 h-7 fill-current ml-1" />
            </div>
          </button>
        )}

        {/* Top Quality Tag */}
        <div className="pointer-events-none absolute top-3 left-3 px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-[var(--color-gold)]/40 font-mono-num text-[11px] text-[var(--color-gold)]">
          {video.quality}
        </div>
      </div>

      {/* Custom Studio Video Control Bar */}
      <div className="bg-[var(--bg-surface)] border-t border-[var(--color-border)] px-4 py-3 flex flex-col gap-2.5">
        {/* Scrubber */}
        <div className="flex items-center gap-2.5" dir="ltr">
          <span className="font-mono-num text-[11px] text-[var(--color-gold)] w-10 text-right">
            {formatTimecode(currentTime)}
          </span>
          <input
            type="range"
            min={0}
            max={duration > 0 ? duration : 15}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 shiri-slider"
          />
          <span className="font-mono-num text-[11px] text-[var(--text-muted)] w-10">
            {duration > 0 ? formatTimecode(duration) : video.duration}
          </span>
        </div>

        {/* Bottom Buttons & Volume */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2" dir="ltr">
            <button
              type="button"
              onClick={togglePlay}
              className="px-3 py-1.5 rounded-lg bg-[var(--color-gold)] text-[#050505] font-bold text-xs flex items-center gap-1.5 hover:bg-[var(--color-gold-hover)] cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
              <span>{isPlaying ? 'PAUSE' : 'PLAY'}</span>
            </button>

            {/* Volume Control */}
            <div className="flex items-center gap-1.5 bg-[var(--bg-card)] px-2.5 py-1 rounded-lg border border-[var(--color-border)]">
              <button
                type="button"
                onClick={toggleMute}
                className="text-[var(--color-gold)] cursor-pointer"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 shiri-slider"
              />
            </div>

            <button
              type="button"
              onClick={cycleSpeed}
              className="px-2 py-1 rounded-lg border border-[var(--color-border)] font-mono-num text-[11px] text-[var(--text-muted)] hover:text-[var(--color-gold)] cursor-pointer"
            >
              {speed}x
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setAmbientGlow(!ambientGlow)}
              title="نورپردازی محیطی ۴ بعدی"
              className={`px-2.5 py-1 rounded-lg border text-[11px] flex items-center gap-1 cursor-pointer ${
                ambientGlow
                  ? 'border-[var(--color-gold)]/60 text-[var(--color-gold)] bg-[var(--color-gold)]/10'
                  : 'border-[var(--color-border)] text-[var(--text-muted)]'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>نور صحنه</span>
            </button>

            <button
              type="button"
              onClick={handleFullscreen}
              title="تمام‌صفحه"
              className="p-1.5 rounded-lg border border-[var(--color-border)] text-[var(--text-muted)] hover:text-[var(--color-gold)] cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Video Description Metadata (Zero-Pill inline text) */}
      <div className="p-5">
        <div className="flex items-center gap-2 text-xs text-[var(--color-gold)] mb-1.5">
          <Film className="w-3.5 h-3.5" />
          <span>{video.subtitle} · کارگردان هنری: {video.director} · {video.releaseDate}</span>
        </div>
        <h3 className="text-lg font-bold text-[var(--text-main)] mb-2">{video.title}</h3>
        <p className="text-xs md:text-sm text-[var(--text-muted)] leading-relaxed">
          {video.description}
        </p>
      </div>
    </div>
  );
};
