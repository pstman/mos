/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * تالار قطعات و نغمه‌های پیوستار آکوستیک (فلات کهن ایران تا حوزه رود دانوب)
 * ایستگاه‌بندی جغرافیایی بر پایه نقشه، در بازه زمانی ۲۰ تا ۳۰ ثانیه
 * بدون هوش مصنوعی یا سینتی‌سایزر صوتی؛ مبتنی بر پلیر پخش فایل‌های استاندارد صوتی و ویدیو
 * مجهز به نمایشگر موجی (Waveform) و اسپکتروگرام دوبعدی بسیار سبک با بار پردازشی اندک
 * نگارش به زبان فارسی پالوده و پاکیزه با اصطلاحات تخصصی ارگانولوژی
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  ExternalLink, 
  Youtube, 
  Compass, 
  Music, 
  MapPin, 
  Layers, 
  Clock, 
  Sparkles 
} from 'lucide-react';
import { 
  ContinuumStationPiece, 
  getStoredContinuumPieces 
} from '../utils/continuumPiecesData';
import { AudioWaveformVisualizer } from './AudioWaveformVisualizer';
import { MediaVideoPlayer } from './MediaVideoPlayer';

interface ContinuumPiecesHallProps {
  onOpenTreatise?: () => void;
  className?: string;
}

export const ContinuumPiecesHall: React.FC<ContinuumPiecesHallProps> = ({
  onOpenTreatise,
  className = ''
}) => {
  const [pieces, setPieces] = useState<ContinuumStationPiece[]>(getStoredContinuumPieces());
  const [selectedPieceId, setSelectedPieceId] = useState<string>(pieces[0]?.id || 'piece_station_1_iran');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(pieces[0]?.durationSec || 26);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const activePiece = pieces.find(p => p.id === selectedPieceId) || pieces[0];

  useEffect(() => {
    // When selected piece changes, pause and reload audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(activePiece.durationSec);
  }, [selectedPieceId, activePiece]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('پخش مستقیم پرونده صوتی با وقفه روبرو شد:', err);
          setIsPlaying(false);
        });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime || 0);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const realDur = audioRef.current.duration;
      if (!isNaN(realDur) && realDur > 0) {
        setDuration(realDur);
      }
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
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

  const cycleSpeed = () => {
    const speeds = [1, 1.25, 0.85];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const next = speeds[nextIdx];
    setPlaybackRate(next);
    if (audioRef.current) {
      audioRef.current.playbackRate = next;
    }
  };

  const formatSeconds = (sec: number) => {
    if (isNaN(sec) || sec === 0) return '۰۰:۰۰';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const faM = m.toString().padStart(2, '0');
    const faS = s.toString().padStart(2, '0');
    return `${faM}:${faS}`;
  };

  return (
    <section className={`w-full bg-[#16110E] border-2 border-[#594234] rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6 text-[#F5EEDB] font-persian ${className}`} dir="rtl">
      {/* Hidden Native Audio Element (Standard .mp3 / .m4a / .webm) */}
      <audio
        ref={audioRef}
        src={activePiece.audioUrl}
        preload="metadata"
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
      />

      {/* Header Title & Station Progress */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#594234]/60 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-[#E5A836]">
            <Compass size={16} />
            <span>تالار نواها و قطعات پیوستار آکوستیک (بازه زمانی ۲۰ تا ۳۰ ثانیه)</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-[#F5EEDB]">
            گنجینه قطعات پیوستار: از فلات ایران تا فرودگاه دانوب
          </h2>
          <p className="text-xs text-[#C4B59D]">
            پخش استودیویی و بی‌نیاز از هوش مصنوعی، همراه با شناسنامه سازشناسی (ارگانولوژی) و نغمه‌های پاک و اصیل
          </p>
        </div>

        {onOpenTreatise && (
          <button
            onClick={onOpenTreatise}
            className="px-3.5 py-1.5 rounded-lg bg-[#241A14] hover:bg-[#34261D] text-[#E5A836] border border-[#594234] text-xs font-bold transition flex items-center gap-1.5 shrink-0 self-start md:self-center"
          >
            <span>📜 مطالعه پژوهش‌نامه پیوستار</span>
          </button>
        )}
      </div>

      {/* Station Selector Bar (4 Stations along the Map Route) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
        {pieces.map((piece) => {
          const isSelected = piece.id === selectedPieceId;
          return (
            <button
              key={piece.id}
              onClick={() => setSelectedPieceId(piece.id)}
              className={`p-3 rounded-xl border text-right transition flex flex-col justify-between gap-2 ${
                isSelected
                  ? 'bg-gradient-to-br from-[#2A1F18] to-[#1E1612] border-[#E5A836] shadow-lg ring-1 ring-[#E5A836]/60'
                  : 'bg-[#140F0C] hover:bg-[#1E1712] border-[#594234]/60'
              }`}
            >
              <div className="flex items-center justify-between gap-1 w-full">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isSelected ? 'bg-[#8B2635] text-white border-[#E5A836]' : 'bg-[#241A14] text-[#A6937C] border-[#594234]'
                }`}>
                  ایستگاه {piece.stationNumber}
                </span>
                <span className="text-[10px] text-[#A6937C] font-mono flex items-center gap-1">
                  <Clock size={11} />
                  <span>{piece.durationSec} ثانیه</span>
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#F5EEDB] line-clamp-1">
                  {piece.stationNameFa.split(':')[1]?.trim() || piece.stationNameFa}
                </h4>
                <p className="text-[11px] text-[#C4B59D] line-clamp-1 mt-0.5">
                  {piece.musicalSystemFa}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-[10px] text-[#E5A836]">
                <MapPin size={12} />
                <span className="truncate">{piece.routeTitleFa}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Player & Organology Showcase Box */}
      <div className="bg-gradient-to-b from-[#1E1612] to-[#140F0C] border border-[#E5A836]/40 rounded-xl p-4 sm:p-5 shadow-xl space-y-4">
        {/* Piece Banner Info */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-[#E5A836] bg-[#2A1F18] px-2.5 py-0.5 rounded-md border border-[#594234]">
                {activePiece.stationNameFa}
              </span>
              <span className="text-xs text-[#34D399] bg-[#14261C] px-2.5 py-0.5 rounded-md border border-[#10B981]/40 font-mono">
                {activePiece.durationSec} ثانیه شنیداری
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#F5EEDB]">
              {activePiece.titleFa}
            </h3>
            <div className="text-xs text-[#C4B59D]">
              <strong>نظام خنیاگری و پرده‌بندی: </strong>
              <span className="text-[#EDE0C8]">{activePiece.musicalSystemFa}</span>
            </div>
          </div>

          {/* Quick Actions (YouTube & Direct Link) */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {activePiece.youtubeUrl && (
              <button
                onClick={() => setShowVideoModal(true)}
                className="px-3 py-1.5 rounded-lg bg-[#8B2635] hover:bg-[#A62F41] text-white text-xs font-bold transition flex items-center gap-1.5 shadow"
                title="مشاهده اجرای تصویری در پلیر ویدیو"
              >
                <Youtube size={15} />
                <span>اجرای تصویری (یوتیوب)</span>
              </button>
            )}

            <a
              href={activePiece.audioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-[#241A14] hover:bg-[#34261D] text-[#E5A836] border border-[#594234] text-xs font-bold transition flex items-center gap-1.5"
              title="بارگیری مستقیم پرونده صوتی"
            >
              <ExternalLink size={14} />
              <span>پیوند مستقیم آوا</span>
            </a>
          </div>
        </div>

        {/* 2D Canvas Waveform & Spectrogram Visualizer */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-[#A6937C] px-1">
            <span>تجسم بسامدی و نوسان امواج صوتی (پردازش سبک ۲ بعدی):</span>
            <span className="font-mono text-[#E5A836]">
              {formatSeconds(currentTime)} / {formatSeconds(duration)}
            </span>
          </div>
          <AudioWaveformVisualizer
            isPlaying={isPlaying}
            height={56}
            mode="both"
            accentColor="#E5A836"
          />
        </div>

        {/* Playback Controls Strip */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          {/* Play/Pause & Reset */}
          <div className="flex items-center gap-3">
            <button
              onClick={togglePlay}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition shadow-lg shrink-0 border ${
                isPlaying
                  ? 'bg-[#8B2635] text-[#FFF5E6] border-[#E5A836] shadow-[#8B2635]/50 scale-105'
                  : 'bg-[#D97706] hover:bg-[#E5A836] text-black border-amber-300'
              }`}
              title={isPlaying ? 'درنگ' : 'پخش قطعه'}
            >
              {isPlaying ? (
                <Pause size={22} className="fill-current" />
              ) : (
                <Play size={22} className="fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={() => {
                if (audioRef.current) {
                  audioRef.current.currentTime = 0;
                  setCurrentTime(0);
                }
              }}
              className="p-2.5 rounded-lg bg-[#241A14] hover:bg-[#34261D] text-[#C4B59D] hover:text-[#FFF5E6] border border-[#594234] transition"
              title="آغاز دوباره قطعه"
            >
              <RotateCcw size={16} />
            </button>

            <div className="text-xs">
              <div className="font-bold text-[#F5EEDB]">
                {isPlaying ? 'در حال پخش قطعه نغمه...' : 'آماده شنیدن'}
              </div>
              <div className="text-[10px] text-[#A6937C]">
                پخش با کیفیت استودیویی
              </div>
            </div>
          </div>

          {/* Time Scrubber */}
          <div className="flex-1 mx-2 sm:mx-4">
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

          {/* Speed & Volume */}
          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={cycleSpeed}
              className="px-2 py-1 rounded bg-[#18120E] hover:bg-[#2A1F18] text-[#E5A836] text-[11px] font-mono font-bold border border-[#594234] transition"
              title="دگرگونی تندی نواخت"
            >
              {playbackRate}x
            </button>

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
              className="w-16 h-1 accent-[#E5A836] bg-[#3D2E24] rounded-lg cursor-pointer"
              title="بلندی آوا"
            />
          </div>
        </div>

        {/* Organology & Historical Narrative Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-[#594234]/40 text-xs">
          {/* Card 1: Organology */}
          <div className="bg-[#18120E] p-3.5 rounded-xl border border-[#594234]/50 space-y-2">
            <div className="flex items-center gap-2 text-[#E5A836] font-bold">
              <Layers size={14} />
              <span>سازشناسی تطبیقی (ارگانولوژی):</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {activePiece.instrumentsFa.map((inst, i) => (
                <span key={i} className="px-2 py-0.5 rounded bg-[#2A1F18] text-[#F5EEDB] border border-[#594234] text-[11px]">
                  🎻 {inst}
                </span>
              ))}
            </div>
            <p className="text-[#C4B59D] text-[11px] leading-relaxed pt-1">
              {activePiece.organologyNotesFa}
            </p>
          </div>

          {/* Card 2: Historical Context */}
          <div className="bg-[#18120E] p-3.5 rounded-xl border border-[#594234]/50 space-y-2">
            <div className="flex items-center gap-2 text-[#34D399] font-bold">
              <Sparkles size={14} />
              <span>پیشینه کهن و جایگاه تاریخی:</span>
            </div>
            <p className="text-[#C4B59D] text-[11px] leading-relaxed">
              {activePiece.historicalContextFa}
            </p>
          </div>
        </div>
      </div>

      {/* Video Modal if User Clicks Video Button */}
      {showVideoModal && activePiece.youtubeUrl && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
          <div className="bg-[#1A1410] border-2 border-[#E5A836] rounded-2xl max-w-3xl w-full p-4 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#594234] pb-2">
              <div className="font-bold text-sm text-[#F5EEDB]">
                نمایشگر ویدیویی: {activePiece.titleFa}
              </div>
              <button
                onClick={() => setShowVideoModal(false)}
                className="px-2.5 py-1 rounded-lg bg-[#2A1F18] text-[#C4B59D] hover:text-white border border-[#594234] text-xs"
              >
                بستن پنجره
              </button>
            </div>

            <MediaVideoPlayer
              videoUrl={activePiece.youtubeUrl}
              title={activePiece.titleFa}
            />
          </div>
        </div>
      )}
    </section>
  );
};
