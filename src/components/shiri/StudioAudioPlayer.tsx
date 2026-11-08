import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Sliders,
  Repeat,
  FileText,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  TrackItem,
  EqualizerBand,
  DEFAULT_EQ_BANDS,
  EQ_PRESETS,
  clampEqGain,
  formatTimecode,
} from '../../utils/shiriData';
import fallbackCover from '../../assets/images/album_cover_golden_night_1794140915037.jpg';

interface StudioAudioPlayerProps {
  currentTrack: TrackItem | null;
  tracks: TrackItem[];
  onSelectTrack: (track: TrackItem) => void;
  isPlaying: boolean;
  onPlayStateChange: (playing: boolean) => void;
  forceOpenEq?: boolean;
  onCloseEq?: () => void;
}

/**
 * Custom Studio Audio Player + 5-Band Web Audio API Parametric/Graphic Equalizer
 * + Real-Time 2D Canvas Spectrum Visualizer + Volume Fader + Lyrics Drawer.
 */
export const StudioAudioPlayer: React.FC<StudioAudioPlayerProps> = ({
  currentTrack,
  tracks,
  onSelectTrack,
  isPlaying,
  onPlayStateChange,
  forceOpenEq = false,
  onCloseEq,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Web Audio API Nodes
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const filtersRef = useRef<BiquadFilterNode[]>([]);
  const gainNodeRef = useRef<GainNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const webAudioFailedRef = useRef<boolean>(false);

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [loop, setLoop] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);

  const [eqBands, setEqBands] = useState<EqualizerBand[]>(DEFAULT_EQ_BANDS);
  const [activePresetId, setActivePresetId] = useState<string>('flat');
  const [showEqDrawer, setShowEqDrawer] = useState<boolean>(false);
  const [showLyricsModal, setShowLyricsModal] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [preampGain, setPreampGain] = useState<number>(0);

  useEffect(() => {
    if (forceOpenEq) {
      setShowEqDrawer(true);
      setIsMinimized(false);
    }
  }, [forceOpenEq]);

  // Initialize Web Audio API 5-Band Equalizer Graph on first user playback
  const ensureAudioGraph = () => {
    const audioEl = audioRef.current;
    if (!audioEl || audioCtxRef.current || webAudioFailedRef.current) return;

    try {
      const AudioContextClass =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      const source = ctx.createMediaElementSource(audioEl);
      const gainNode = ctx.createGain();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.82;

      const createdFilters = eqBands.map((band) => {
        const filter = ctx.createBiquadFilter();
        filter.type = band.type;
        filter.frequency.value = band.frequency;
        filter.Q.value = 1.1;
        filter.gain.value = band.gain;
        return filter;
      });

      // Chain: source -> preamp gain -> filter[0..4] -> analyser -> destination
      source.connect(gainNode);
      let prevNode: AudioNode = gainNode;
      for (const f of createdFilters) {
        prevNode.connect(f);
        prevNode = f;
      }
      prevNode.connect(analyser);
      analyser.connect(ctx.destination);

      audioCtxRef.current = ctx;
      sourceNodeRef.current = source;
      gainNodeRef.current = gainNode;
      filtersRef.current = createdFilters;
      analyserRef.current = analyser;
    } catch {
      // Fallback gracefully if CORS or browser policy blocks MediaElementSource
      webAudioFailedRef.current = true;
    }
  };

  // Sync EQ band gains to BiquadFilterNodes
  useEffect(() => {
    filtersRef.current.forEach((filterNode, idx) => {
      const band = eqBands[idx];
      if (band && filterNode && audioCtxRef.current) {
        filterNode.gain.setTargetAtTime(band.gain, audioCtxRef.current.currentTime, 0.02);
      }
    });
  }, [eqBands]);

  // Sync Preamp gain
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      const linearGain = Math.pow(10, preampGain / 20);
      gainNodeRef.current.gain.setTargetAtTime(linearGain, audioCtxRef.current.currentTime, 0.02);
    }
  }, [preampGain]);

  // Sync Volume & Mute
  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;
    audioEl.volume = isMuted ? 0 : Math.max(0, Math.min(1, volume));
  }, [volume, isMuted]);

  // Sync Playback Rate
  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl) return;
    audioEl.playbackRate = playbackRate;
  }, [playbackRate]);

  // Handle Track Source Change & Play/Pause
  useEffect(() => {
    const audioEl = audioRef.current;
    if (!audioEl || !currentTrack) return;

    if (audioEl.src !== currentTrack.audio) {
      audioEl.src = currentTrack.audio;
      audioEl.load();
      setCurrentTime(0);
    }

    if (isPlaying) {
      ensureAudioGraph();
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
      audioEl.play().catch(() => {
        onPlayStateChange(false);
      });
    } else {
      audioEl.pause();
    }
  }, [currentTrack, isPlaying]);

  // Real-time 2D Spectrum Visualizer Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    const bufferLength = 32;
    const dataArray = new Uint8Array(bufferLength);
    let phase = 0;

    const drawVisualizer = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      let hasLiveFreq = false;
      if (analyserRef.current && isPlaying) {
        analyserRef.current.getByteFrequencyData(dataArray);
        const sum = dataArray.reduce((a, b) => a + b, 0);
        hasLiveFreq = sum > 0;
      }

      phase += 0.09;
      const barCount = 24;
      const gap = 3;
      const barWidth = (w - gap * (barCount - 1)) / barCount;

      for (let i = 0; i < barCount; i++) {
        let ratio = 0.12;
        if (hasLiveFreq) {
          ratio = Math.max(0.1, dataArray[i % bufferLength] / 255);
        } else if (isPlaying) {
          // Smooth responsive acoustic envelope when cross-origin stream is active
          const eqBoost = eqBands[Math.min(4, Math.floor((i / barCount) * 5))]?.gain || 0;
          const boostFactor = 1 + eqBoost * 0.035;
          ratio =
            (0.28 +
              0.32 * Math.sin(phase + i * 0.45) +
              0.2 * Math.cos(phase * 1.4 - i * 0.3)) *
            boostFactor;
          ratio = Math.max(0.12, Math.min(0.96, ratio));
        }

        const barH = Math.max(3, ratio * (h - 4));
        const x = i * (barWidth + gap);
        const y = h - barH;

        const grad = ctx.createLinearGradient(0, y, 0, h);
        grad.addColorStop(0, '#dfc48e');
        grad.addColorStop(1, '#8f671f');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barH, 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(drawVisualizer);
    };

    animId = requestAnimationFrame(drawVisualizer);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, eqBands]);

  if (!currentTrack) return null;

  const togglePlay = () => {
    onPlayStateChange(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
  };

  const handlePrevTrack = () => {
    if (!tracks.length) return;
    const idx = tracks.findIndex((t) => t.id === currentTrack.id);
    const prevIdx = idx > 0 ? idx - 1 : tracks.length - 1;
    onSelectTrack(tracks[prevIdx]);
    onPlayStateChange(true);
  };

  const handleNextTrack = () => {
    if (!tracks.length) return;
    const idx = tracks.findIndex((t) => t.id === currentTrack.id);
    const nextIdx = idx >= 0 && idx < tracks.length - 1 ? idx + 1 : 0;
    onSelectTrack(tracks[nextIdx]);
    onPlayStateChange(true);
  };

  const handleBandGainChange = (index: number, rawGain: number) => {
    const clamped = clampEqGain(rawGain);
    setActivePresetId('custom');
    setEqBands((prev) =>
      prev.map((b, i) => (i === index ? { ...b, gain: clamped } : b))
    );
  };

  const applyPreset = (presetId: string) => {
    const found = EQ_PRESETS.find((p) => p.id === presetId);
    if (!found) return;
    setActivePresetId(found.id);
    setEqBands((prev) =>
      prev.map((b, idx) => ({
        ...b,
        gain: found.gains[idx] ?? 0,
      }))
    );
  };

  const resetEq = () => {
    applyPreset('flat');
    setPreampGain(0);
  };

  return (
    <>
      {/* Hidden Native Audio Element with CrossOrigin for Web Audio API */}
      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        loop={loop}
        onTimeUpdate={() => {
          if (audioRef.current) setCurrentTime(audioRef.current.currentTime);
        }}
        onLoadedMetadata={() => {
          if (audioRef.current && Number.isFinite(audioRef.current.duration)) {
            setDuration(audioRef.current.duration);
          }
        }}
        onEnded={() => {
          if (!loop) handleNextTrack();
        }}
      />

      {/* Synchronized Track Lyrics Modal */}
      {showLyricsModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setShowLyricsModal(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-[var(--bg-card)] border border-[var(--color-gold)]/50 p-6 md:p-8 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4 mb-5">
              <div>
                <h4 className="text-lg font-bold text-[var(--color-gold)]">
                  متن ترانه «{currentTrack.title}»
                </h4>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {currentTrack.subtitle} · تنظیم: {currentTrack.arrangement}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowLyricsModal(false)}
                className="px-3 py-1.5 rounded-lg border border-[var(--color-border)] text-xs text-[var(--text-muted)] hover:text-[var(--color-gold)] cursor-pointer"
              >
                بستن
              </button>
            </div>
            <div className="max-h-[55vh] overflow-y-auto whitespace-pre-line leading-9 text-center text-base text-[var(--text-main)] font-medium px-2">
              {currentTrack.lyrics || 'متن ترانه برای این قطعه ثبت نشده است.'}
            </div>
          </div>
        </div>
      )}

      {/* Persistent Studio Deck & Equalizer Dock */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-[var(--bg-header)] backdrop-blur-xl border-t border-[var(--color-gold)]/35 shadow-[0_-15px_45px_rgba(0,0,0,0.85)] transition-all duration-300">
        {/* Expandable 5-Band Studio Parametric Equalizer Drawer */}
        {showEqDrawer && !isMinimized && (
          <div className="border-b border-[var(--color-border)] bg-[var(--bg-surface)]/95 px-4 py-5 md:px-8">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-2.5">
                  <Sliders className="w-5 h-5 text-[var(--color-gold)]" />
                  <div>
                    <h4 className="text-sm md:text-base font-bold text-[var(--text-main)] flex items-center gap-2">
                      <span>اکولایزر استودیویی ۵ بانده مصطفی شیری</span>
                      <span className="font-mono-num text-[11px] text-[var(--color-gold)] font-normal">
                        Web Audio BiquadFilter DSP
                      </span>
                    </h4>
                    <p className="text-xs text-[var(--text-muted)]">
                      تنظیم زنده فرکانس‌های ساب‌بیس، گرمای آکوستیک، حضور وکال و شفافیت مسترینگ
                    </p>
                  </div>
                </div>

                {/* Preset Selector Bar */}
                <div className="flex flex-wrap items-center gap-2">
                  {EQ_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => applyPreset(preset.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                        activePresetId === preset.id
                          ? 'bg-[var(--color-gold)] text-[#050505] border-[var(--color-gold)]'
                          : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--color-border)] hover:border-[var(--color-gold)]/60 hover:text-[var(--text-main)]'
                      }`}
                    >
                      {preset.nameFa}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={resetEq}
                    title="بازنشانی اکولایزر به حالت فلت"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs border border-[var(--color-border)] text-[var(--text-muted)] hover:text-[var(--color-gold)] hover:border-[var(--color-gold)] cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>ریست (0dB)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowEqDrawer(false);
                      if (onCloseEq) onCloseEq();
                    }}
                    className="px-2.5 py-1.5 rounded-lg text-xs bg-white/5 text-[var(--text-muted)] hover:text-white cursor-pointer"
                  >
                    بستن پنل EQ
                  </button>
                </div>
              </div>

              {/* 5 Frequency Bands + Preamp Sliders Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 bg-[var(--bg-card)] border border-[var(--color-border)] rounded-2xl p-4">
                {/* Preamp Slider */}
                <div className="flex flex-col items-center justify-between p-2.5 rounded-xl bg-[var(--bg-surface)]/70 border border-[var(--color-border)]">
                  <div className="w-full flex items-center justify-between text-[11px] text-[var(--text-muted)] mb-2">
                    <span>PREAMP</span>
                    <span className="font-mono-num text-[var(--color-gold)] font-semibold">
                      {preampGain > 0 ? `+${preampGain}` : preampGain} dB
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-6}
                    max={6}
                    step={0.5}
                    value={preampGain}
                    onChange={(e) => setPreampGain(Number(e.target.value))}
                    className="w-full shiri-slider my-2"
                  />
                  <span className="text-[11px] text-[var(--text-muted)] mt-1">تقویت ورودی</span>
                </div>

                {/* 5 Parametric Bands */}
                {eqBands.map((band, idx) => (
                  <div
                    key={band.frequency}
                    className="flex flex-col items-center justify-between p-2.5 rounded-xl bg-[var(--bg-surface)]/40 border border-[var(--color-border)] hover:border-[var(--color-gold)]/45 transition-colors"
                  >
                    <div className="w-full flex items-center justify-between text-[11px] mb-2">
                      <span className="font-mono-num font-bold text-[var(--text-main)]">
                        {band.label}
                      </span>
                      <span
                        dir="ltr"
                        className={`font-mono-num font-semibold ${
                          band.gain !== 0 ? 'text-[var(--color-gold)]' : 'text-[var(--text-muted)]'
                        }`}
                      >
                        {band.gain > 0 ? `+${band.gain}` : band.gain} dB
                      </span>
                    </div>

                    <input
                      type="range"
                      min={-12}
                      max={12}
                      step={0.5}
                      value={band.gain}
                      onChange={(e) => handleBandGainChange(idx, Number(e.target.value))}
                      className="w-full shiri-slider my-2"
                    />

                    <span className="text-[11px] text-[var(--text-muted)] text-center mt-1 line-clamp-1">
                      {band.roleFa}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Player Bar */}
        <div className="max-w-6xl mx-auto px-4 py-3 md:px-6 flex flex-col gap-2.5">
          {/* Top Timeline Scrubber Row */}
          {!isMinimized && (
            <div className="flex items-center gap-3" dir="ltr">
              <span className="font-mono-num text-xs text-[var(--color-gold)] w-11 text-right">
                {formatTimecode(currentTime)}
              </span>
              <input
                type="range"
                min={0}
                max={duration > 0 ? duration : 220}
                step={0.5}
                value={currentTime}
                onChange={handleSeek}
                aria-label="نوار زمان پخش"
                className="flex-1 shiri-slider"
              />
              <span className="font-mono-num text-xs text-[var(--text-muted)] w-11">
                {duration > 0 ? formatTimecode(duration) : currentTrack.duration}
              </span>
            </div>
          )}

          {/* Controls, Track Info, Spectrum Visualizer & Volume Row */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            {/* Track Cover & Info */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-[var(--color-gold)]/50 shrink-0">
                <img
                  src={currentTrack.image || fallbackCover}
                  alt={currentTrack.title}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = fallbackCover;
                  }}
                  className={`w-full h-full object-cover ${
                    isPlaying ? 'scale-105 transition-transform duration-700' : ''
                  }`}
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm md:text-base font-bold text-[var(--text-main)] truncate">
                    {currentTrack.title}
                  </h4>
                  {activePresetId !== 'flat' && (
                    <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono-num text-[var(--color-gold)]">
                      <Sparkles className="w-3 h-3" />
                      EQ ACTIVE
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--text-muted)] truncate">
                  {currentTrack.subtitle} · تنظیم: {currentTrack.arrangement}
                </p>
              </div>
            </div>

            {/* Transport Buttons */}
            <div className="flex items-center gap-2 sm:gap-3" dir="ltr">
              <button
                type="button"
                onClick={handlePrevTrack}
                title="قطعه قبلی"
                className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--color-gold)] transition-colors cursor-pointer"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={togglePlay}
                aria-label={isPlaying ? 'توقف پخش' : 'پخش قطعه'}
                className="w-11 h-11 rounded-full bg-[var(--color-gold)] text-[#050505] flex items-center justify-center shadow-[0_0_20px_rgba(214,179,108,0.4)] hover:bg-[var(--color-gold-hover)] hover:scale-105 transition-all cursor-pointer"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={handleNextTrack}
                title="قطعه بعدی"
                className="p-2 rounded-lg text-[var(--text-muted)] hover:text-[var(--color-gold)] transition-colors cursor-pointer"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setLoop(!loop)}
                title="تکرار قطعه"
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  loop ? 'text-[var(--color-gold)] bg-[var(--color-gold)]/10' : 'text-[var(--text-muted)] hover:text-white'
                }`}
              >
                <Repeat className="w-4 h-4" />
              </button>
            </div>

            {/* Real-time 2D Spectrum Canvas + Volume Control + EQ & Lyrics Buttons */}
            <div className="flex items-center gap-3 justify-end flex-1">
              <canvas
                ref={canvasRef}
                width={116}
                height={30}
                className="hidden lg:block opacity-90"
              />

              {/* Volume Fader */}
              <div className="hidden sm:flex items-center gap-2 bg-[var(--bg-surface)] px-2.5 py-1.5 rounded-xl border border-[var(--color-border)]" dir="ltr">
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  aria-label="قطع یا وصل صدا"
                  className="text-[var(--color-gold)] hover:opacity-80 cursor-pointer"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.02}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    setIsMuted(false);
                    setVolume(Number(e.target.value));
                  }}
                  aria-label="کنترل ولوم صدا"
                  className="w-20 shiri-slider"
                />
                <span className="font-mono-num text-[11px] text-[var(--text-muted)] w-8 text-right">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
              </div>

              {/* Speed Button */}
              <button
                type="button"
                onClick={() => {
                  const nextRate = playbackRate === 1 ? 1.25 : playbackRate === 1.25 ? 0.75 : 1;
                  setPlaybackRate(nextRate);
                }}
                className="hidden md:inline-flex font-mono-num text-xs px-2.5 py-1.5 rounded-lg border border-[var(--color-border)] text-[var(--text-muted)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] cursor-pointer"
              >
                {playbackRate}x
              </button>

              {/* Lyrics Drawer Trigger */}
              <button
                type="button"
                onClick={() => setShowLyricsModal(true)}
                title="متن ترانه"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--color-border)] text-xs text-[var(--text-main)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-[var(--color-gold)]" />
                <span className="hidden md:inline">متن ترانه</span>
              </button>

              {/* 5-Band Equalizer Toggle Button */}
              <button
                type="button"
                onClick={() => {
                  setIsMinimized(false);
                  setShowEqDrawer(!showEqDrawer);
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  showEqDrawer
                    ? 'bg-[var(--color-gold)] text-[#050505] border-[var(--color-gold)]'
                    : 'bg-[var(--bg-surface)] text-[var(--color-gold)] border-[var(--color-gold)]/50 hover:bg-[var(--color-gold)]/15'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>اکولایزر</span>
              </button>

              {/* Minimize / Expand Player */}
              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-white cursor-pointer"
                title={isMinimized ? 'باز کردن پلیر' : 'کوچک کردن پلیر'}
              >
                {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
