/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * پلیر ویدیویی چندمنظوره و سبک پرده‌نگار • استودیو اینامیکس
 * پشتیبانی کامل از لینک‌های مستقیم ویدیو (MP4, WebM, OGV, MOV) و ویدیوهای یوتیوب
 * کاملاً واکنش‌گرا با استایل کلاسیک-دانشگاهی
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  RotateCcw, 
  ExternalLink, 
  Video, 
  Youtube,
  Settings,
  Download
} from 'lucide-react';

interface MediaVideoPlayerProps {
  videoUrl: string;
  title?: string;
  posterUrl?: string;
  className?: string;
}

export const MediaVideoPlayer: React.FC<MediaVideoPlayerProps> = ({
  videoUrl,
  title = 'ویدیوی پژوهشی پیوست',
  posterUrl,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [hasError, setHasError] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const controlsTimeoutRef = useRef<number | null>(null);

  // Check if URL is YouTube
  const isYouTubeUrl = (url: string) => {
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // Convert YouTube link to embed link
  const getYouTubeEmbedUrl = (url: string) => {
    try {
      if (url.includes('embed/')) return url;
      if (url.includes('watch?v=')) {
        const id = url.split('watch?v=')[1]?.split('&')[0];
        return `https://www.youtube-nocookie.com/embed/${id}?rel=0`;
      }
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube-nocookie.com/embed/${id}?rel=0`;
      }
      if (url.includes('shorts/')) {
        const id = url.split('shorts/')[1]?.split('?')[0];
        return `https://www.youtube-nocookie.com/embed/${id}?rel=0`;
      }
    } catch {
      return null;
    }
    return null;
  };

  const isYT = isYouTubeUrl(videoUrl);
  const ytEmbedUrl = isYT ? getYouTubeEmbedUrl(videoUrl) : null;

  // Detect format label for direct video
  const getVideoFormatLabel = (url: string) => {
    const cleanUrl = url.split('?')[0].toLowerCase();
    if (cleanUrl.endsWith('.mp4') || cleanUrl.endsWith('.m4v')) return 'MP4 Video';
    if (cleanUrl.endsWith('.webm')) return 'WebM Video';
    if (cleanUrl.endsWith('.ogv') || cleanUrl.endsWith('.ogg')) return 'OGV Video';
    if (cleanUrl.endsWith('.mov')) return 'QuickTime / MOV';
    return 'Direct Video Stream';
  };

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setHasError(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.load();
    }
  }, [videoUrl]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(() => setHasError(true));
    }
  };

  // Handle Seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  // Handle Volume
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
    }
    if (isMuted && val > 0) setIsMuted(false);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.volume = volume;
      setIsMuted(false);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  // Playback Rate Cycle
  const cyclePlaybackRate = () => {
    const rates = [1, 1.25, 1.5, 0.75];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    setPlaybackRate(nextRate);
    if (videoRef.current) {
      videoRef.current.playbackRate = nextRate;
    }
  };

  // Fullscreen Toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs === 0) return '۰۰:۰۰';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = window.setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2800);
  };

  // 1. YouTube Rendering
  if (isYT && ytEmbedUrl) {
    return (
      <div className={`space-y-2 font-persian ${className}`} dir="rtl">
        <div className="flex items-center justify-between text-xs text-[#E5A836]">
          <div className="flex items-center gap-1.5 font-bold">
            <Youtube size={16} className="text-red-500" />
            <span>{title}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-950/70 text-red-200 border border-red-800">
              YouTube
            </span>
          </div>
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[11px] text-[#A6937C] hover:text-[#FFF5E6] transition"
          >
            <span>مشاهده در یوتیوب</span>
            <ExternalLink size={12} />
          </a>
        </div>
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[#594234] shadow-2xl bg-black">
          <iframe
            src={ytEmbedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>
      </div>
    );
  }

  // 2. Direct Video Rendering (HTML5 Native Player)
  return (
    <div className={`space-y-2 font-persian ${className}`} dir="rtl">
      {/* Header Info */}
      <div className="flex items-center justify-between text-xs text-[#E5A836]">
        <div className="flex items-center gap-2 font-bold">
          <Video size={16} className="text-[#34D399]" />
          <span>{title}</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#18231C] text-[#34D399] border border-[#10B981]/40 font-mono">
            {getVideoFormatLabel(videoUrl)}
          </span>
        </div>
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[11px] text-[#A6937C] hover:text-[#FFF5E6] transition"
          title="باز کردن مستقیم در تب جدید"
        >
          <span>لینک مستقیم ویدیو</span>
          <ExternalLink size={12} />
        </a>
      </div>

      {/* Video Container */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => isPlaying && setShowControls(false)}
        className="relative w-full aspect-video rounded-xl overflow-hidden border border-[#594234] shadow-2xl bg-[#0C0806] group select-none"
      >
        <video
          ref={videoRef}
          src={videoUrl}
          poster={posterUrl}
          playsInline
          preload="metadata"
          onClick={togglePlay}
          onLoadedMetadata={() => videoRef.current && setDuration(videoRef.current.duration)}
          onTimeUpdate={() => videoRef.current && setCurrentTime(videoRef.current.currentTime)}
          onEnded={() => setIsPlaying(false)}
          onError={() => setHasError(true)}
          className="w-full h-full object-contain cursor-pointer"
        />

        {/* Center Big Play Button (when paused) */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            aria-label="پخش ویدیو"
            className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-[#8B2635]/90 hover:bg-[#8B2635] text-[#FFF5E6] border-2 border-[#E5A836] flex items-center justify-center shadow-2xl transition hover:scale-110 z-10"
          >
            <Play size={28} className="fill-current ml-1" />
          </button>
        )}

        {/* Error Fallback Overlay */}
        {hasError && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-4 text-center space-y-2 z-20">
            <span className="text-sm font-bold text-red-400">امکان پخش مستقیم این ویدیو در مرورگر وجود ندارد</span>
            <p className="text-xs text-[#A6937C] max-w-sm">
              ممکن است سرور مبدا دسترسی مستقیم (CORS) را محدود کرده باشد. می‌توانید ویدیو را مستقیماً باز نمایید:
            </p>
            <a
              href={videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-1.5 rounded-lg bg-[#2A1F18] text-[#E5A836] border border-[#594234] text-xs font-bold hover:bg-[#3D2E24] flex items-center gap-1.5"
            >
              <ExternalLink size={14} />
              <span>باز کردن مستقیم ویدیو در سرور مبدأ</span>
            </a>
          </div>
        )}

        {/* Custom Controls Bar */}
        <div 
          className={`absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-3 pt-6 flex flex-col gap-2 transition-opacity duration-300 ${
            showControls || !isPlaying ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          dir="ltr"
        >
          {/* Progress Seekbar */}
          <input
            type="range"
            min="0"
            max={duration || 100}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 accent-[#E5A836] bg-[#3D2E24] rounded-lg cursor-pointer"
          />

          {/* Controls Row */}
          <div className="flex items-center justify-between text-xs text-[#F5EEDB]">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-8 h-8 rounded-full bg-[#2A1F18] hover:bg-[#3D2E24] text-[#E5A836] flex items-center justify-center transition border border-[#594234]/70"
                title={isPlaying ? 'توقف' : 'پخش'}
              >
                {isPlaying ? <Pause size={15} className="fill-current" /> : <Play size={15} className="fill-current ml-0.5" />}
              </button>

              <button
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = 0;
                    setCurrentTime(0);
                  }
                }}
                className="text-[#C4B59D] hover:text-[#FFF5E6] transition"
                title="شروع مجدد"
              >
                <RotateCcw size={15} />
              </button>

              {/* Volume */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={toggleMute}
                  className="text-[#C4B59D] hover:text-[#FFF5E6] transition"
                >
                  {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-14 sm:w-20 h-1 accent-[#E5A836] bg-[#3D2E24] rounded-lg cursor-pointer"
                />
              </div>

              {/* Time display */}
              <span className="text-[11px] font-mono text-[#A6937C]">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Speed rate button */}
              <button
                onClick={cyclePlaybackRate}
                className="px-2 py-0.5 rounded bg-[#2A1F18] hover:bg-[#3D2E24] text-[#E5A836] text-[10px] font-mono font-bold border border-[#594234]/60 transition"
                title="سرعت پخش"
              >
                {playbackRate}x
              </button>

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="text-[#C4B59D] hover:text-[#FFF5E6] p-1 transition"
                title="تمام‌صفحه"
              >
                <Maximize size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
