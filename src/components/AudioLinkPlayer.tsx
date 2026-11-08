/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * پخش‌کننده شنیداری سبک و واکنشی برای نواها و پیوست‌های پژوهشی
 * پشتیبانی کامل از انواع فرمت‌های استاندارد صوتی (.m4a, .mp3, .ogg, .wav, .flac)
 * همراه با نمایشگر موجی و طیف‌نگار دوبعدی بسیار سبک با بار پردازشی اندک
 * نگارش به زبان فارسی پالوده و پاکیزه با اصطلاحات تخصصی خنیاگری
 */

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX, RotateCcw, ExternalLink } from 'lucide-react';
import { AudioWaveformVisualizer } from './AudioWaveformVisualizer';

interface AudioLinkPlayerProps {
  audioUrl: string;
  title?: string;
  className?: string;
}

export const AudioLinkPlayer: React.FC<AudioLinkPlayerProps> = ({
  audioUrl,
  title = 'پرونده شنیداری پیوست',
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Resolve acoustic:// references to real standard audio URLs
  const resolvedUrl = audioUrl.startsWith('acoustic://')
    ? (audioUrl.includes('violin')
        ? 'https://cdn.jsdelivr.net/gh/nbrosowsky/tonejs-instruments@master/samples/violin/A4.mp3'
        : audioUrl.includes('continuum')
        ? 'https://cdn.jsdelivr.net/gh/nbrosowsky/tonejs-instruments@master/samples/harp/D4.mp3'
        : 'https://cdn.jsdelivr.net/gh/nbrosowsky/tonejs-instruments@master/samples/piano/C4.mp3')
    : audioUrl;

  // Format detection with pure Persian descriptions
  const getAudioFormat = (url: string) => {
    const clean = url.split('?')[0].toLowerCase();
    if (clean.endsWith('.m4a') || clean.endsWith('.mp4a')) {
      return { label: 'M4A (فشرده باکیفیت)', mime: 'audio/mp4; codecs="mp4a.40.2"', color: 'text-[#38BDF8] bg-[#0C2538] border-[#0284C7]/50' };
    }
    if (clean.endsWith('.mp3')) {
      return { label: 'MP3 استاندارد', mime: 'audio/mpeg', color: 'text-[#E5A836] bg-[#2A1F18] border-[#E5A836]/40' };
    }
    if (clean.endsWith('.ogg') || clean.endsWith('.oga')) {
      return { label: 'OGG Vorbis', mime: 'audio/ogg', color: 'text-[#34D399] bg-[#14261C] border-[#10B981]/40' };
    }
    if (clean.endsWith('.wav')) {
      return { label: 'WAV بدون افت کیفیت', mime: 'audio/wav', color: 'text-[#A78BFA] bg-[#221834] border-[#8B5CF6]/40' };
    }
    if (clean.endsWith('.flac')) {
      return { label: 'FLAC خالص استودیویی', mime: 'audio/flac', color: 'text-[#F472B6] bg-[#2D1623] border-[#EC4899]/40' };
    }
    return { label: 'جریان شنیداری استاندارد', mime: 'audio/*', color: 'text-[#E5A836] bg-[#2A1F18] border-[#594234]' };
  };

  const formatInfo = getAudioFormat(resolvedUrl);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setIsLoading(false);

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.load();
    }
  }, [resolvedUrl]);

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
      setIsLoading(false);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime || 0);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleError = () => {
    setIsLoading(false);
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsLoading(false);
        })
        .catch((err) => {
          console.warn('پخش مستقیم با وقفه مواجه شد:', err);
          setIsLoading(false);
          setIsPlaying(false);
        });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = parseFloat(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
    if (isMuted && val > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const cyclePlaybackRate = () => {
    const rates = [1, 1.25, 0.85];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    const nextRate = rates[nextIdx];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds === 0) return '۰۰:۰۰';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const faMins = mins.toString().padStart(2, '0');
    const faSecs = secs.toString().padStart(2, '0');
    return `${faMins}:${faSecs}`;
  };

  return (
    <div
      className={`w-full bg-gradient-to-r from-[#1E1612] via-[#2A1F18] to-[#1E1612] border border-[#E5A836]/40 rounded-xl p-3 sm:p-4 shadow-lg text-[#F5EEDB] font-persian ${className}`}
      dir="rtl"
    >
      {/* پرونده شنیداری واقعی و استاندارد HTML5 */}
      <audio
        ref={audioRef}
        src={resolvedUrl}
        preload="metadata"
        playsInline
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={handleError}
      />

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* دکمه پخش/درنگ و عنوان نغمه */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={togglePlay}
            disabled={isLoading}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition shadow-md shrink-0 border ${
              isPlaying
                ? 'bg-[#8B2635] text-[#FFF5E6] border-[#E5A836] shadow-[#8B2635]/50 scale-105'
                : 'bg-[#D97706] hover:bg-[#E5A836] text-black border-amber-300'
            }`}
            title={isPlaying ? 'درنگ' : 'پخش آوا'}
          >
            {isPlaying ? (
              <Pause size={20} className="fill-current" />
            ) : (
              <Play size={20} className="fill-current ml-0.5" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold text-[#F5EEDB] truncate">
                {title}
              </h4>
              <span className={`text-[9px] px-2 py-0.5 rounded-full border font-mono shrink-0 ${formatInfo.color}`}>
                {formatInfo.label}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-[#A6937C] mt-0.5">
              <span>پخش مستقیم استودیویی</span>
              <span>•</span>
              <span className="font-mono text-[#E5A836]">
                {formatTime(currentTime)} / {formatTime(duration || 26)}
              </span>
            </div>
          </div>
        </div>

        {/* دکمه‌های کنترل: تندی، بلندی آوا، بازآغاز و پیوند مستقیم */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          {/* دگرگونی تندی نواخت */}
          <button
            onClick={cyclePlaybackRate}
            className="px-2 py-1 rounded bg-[#18120E] hover:bg-[#2A1F18] text-[#E5A836] text-[10px] font-mono font-bold border border-[#594234]/60 transition"
            title="دگرگونی تندی نواختن"
          >
            {playbackRate}x
          </button>

          {/* بلندی آوا */}
          <button
            onClick={toggleMute}
            className="text-[#C4B59D] hover:text-[#FFF5E6] p-1.5 transition"
            title={isMuted ? 'روشن کردن صدا' : 'بی‌صدا'}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-14 sm:w-16 h-1 accent-[#E5A836] bg-[#3D2E24] rounded-lg cursor-pointer"
            title="بلندی آوای پخش"
          />

          {/* بازآغاز قطعه */}
          <button
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                setCurrentTime(0);
              }
            }}
            className="text-[#C4B59D] hover:text-[#FFF5E6] p-1.5 transition"
            title="بازآغاز از آغاز نغمه"
          >
            <RotateCcw size={15} />
          </button>

          {/* پیوند مستقیم پرونده شنیداری */}
          {!resolvedUrl.startsWith('acoustic://') && (
            <a
              href={resolvedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#A6937C] hover:text-[#E5A836] p-1.5 transition"
              title="باز کردن پیوند مستقیم پرونده شنیداری"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>

      {/* نمایشگر موجی و طیف‌نگار ۲ بعدی سبک */}
      <div className="mt-2.5">
        <AudioWaveformVisualizer
          isPlaying={isPlaying}
          height={38}
          mode="both"
          accentColor="#E5A836"
        />
      </div>

      {/* نوار لغزان پیشرفت نغمه */}
      <div className="mt-2 flex items-center gap-2">
        <input
          type="range"
          min="0"
          max={duration || 26}
          step="0.1"
          value={currentTime}
          onChange={handleSeek}
          className="w-full h-1.5 accent-[#E5A836] bg-[#3D2E24] rounded-lg cursor-pointer"
        />
      </div>
    </div>
  );
};
