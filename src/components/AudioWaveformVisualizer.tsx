/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * نمایشگر موجی و طیف‌نگار سبک و بهینه (Lightweight 2D Canvas Waveform & Spectrogram)
 * طراحی بهینه‌سازی‌شده با فریم‌ریت مهارشده (۳۰ فریم بر ثانیه) جهت عدم درگیری پردازنده (CPU) کاربر
 * با رنگ‌آمیزی کهن ایرانی: کهربایی، زرین و لاکی (#E5A836, #D97706, #8B2635)
 */

import React, { useRef, useEffect } from 'react';

interface AudioWaveformVisualizerProps {
  isPlaying: boolean;
  audioElement?: HTMLAudioElement | null;
  mode?: 'waveform' | 'spectrogram' | 'both';
  height?: number;
  className?: string;
  accentColor?: string;
}

export const AudioWaveformVisualizer: React.FC<AudioWaveformVisualizerProps> = ({
  isPlaying,
  audioElement,
  mode = 'both',
  height = 54,
  className = '',
  accentColor = '#E5A836'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastDrawTimeRef = useRef<number>(0);
  const phaseRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI crisp rendering
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 300;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const TARGET_FPS = 30;
    const FRAME_INTERVAL = 1000 / TARGET_FPS;

    const drawFrame = (currentTime: number) => {
      if (!isPlaying) {
        // Draw static elegant baseline when audio is stopped
        ctx.clearRect(0, 0, width, height);
        const midY = height / 2;
        ctx.beginPath();
        ctx.moveTo(0, midY);
        ctx.lineTo(width, midY);
        ctx.strokeStyle = 'rgba(89, 66, 52, 0.45)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Little center indicator
        ctx.beginPath();
        ctx.arc(width / 2, midY, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(229, 168, 54, 0.4)';
        ctx.fill();
        return;
      }

      // Throttle rendering to TARGET_FPS to preserve CPU performance
      const delta = currentTime - lastDrawTimeRef.current;
      if (delta >= FRAME_INTERVAL) {
        lastDrawTimeRef.current = currentTime - (delta % FRAME_INTERVAL);
        phaseRef.current += 0.08;

        ctx.clearRect(0, 0, width, height);

        const midY = height / 2;
        const phase = phaseRef.current;

        if (mode === 'spectrogram' || mode === 'both') {
          // Discrete frequency spectrum bars (۲۴ ستون فرکانسی لگاریتمی سبک)
          const barCount = Math.min(28, Math.floor(width / 10));
          const barWidth = 3;
          const barGap = (width - barCount * barWidth) / (barCount + 1);

          for (let i = 0; i < barCount; i++) {
            const x = barGap + i * (barWidth + barGap);
            // Harmonic wave formula simulating real frequency bands
            const harmonic =
              Math.sin(phase * 1.5 + i * 0.45) * 0.45 +
              Math.cos(phase * 0.9 + i * 0.8) * 0.35 +
              Math.sin(phase * 2.2 + i * 1.2) * 0.2;
            const barH = Math.max(4, (Math.abs(harmonic) * (height * 0.75)));
            const y = midY - barH / 2;

            const grad = ctx.createLinearGradient(0, y, 0, y + barH);
            grad.addColorStop(0, '#8B2635');
            grad.addColorStop(0.5, accentColor);
            grad.addColorStop(1, '#D97706');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barH, 1.5);
            ctx.fill();
          }
        }

        if (mode === 'waveform' || mode === 'both') {
          // Smooth continuous wave contour
          ctx.beginPath();
          ctx.lineWidth = 1.5;
          ctx.strokeStyle = accentColor;

          for (let x = 0; x <= width; x += 3) {
            const normX = x / width;
            const wave1 = Math.sin(normX * Math.PI * 6 + phase * 2) * (height * 0.25);
            const wave2 = Math.cos(normX * Math.PI * 14 - phase * 1.3) * (height * 0.12);
            const wave3 = Math.sin(normX * Math.PI * 2 + phase * 0.7) * (height * 0.08);
            const envelope = Math.sin(normX * Math.PI); // Pinched at borders
            const y = midY + (wave1 + wave2 + wave3) * envelope;

            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();

          // Echo shadow wave for spatial depth
          ctx.beginPath();
          ctx.lineWidth = 1;
          ctx.strokeStyle = 'rgba(217, 119, 6, 0.35)';
          for (let x = 0; x <= width; x += 4) {
            const normX = x / width;
            const wave = Math.sin(normX * Math.PI * 5 + (phase - 0.5) * 2) * (height * 0.2) * Math.sin(normX * Math.PI);
            const y = midY + wave;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }

      animFrameIdRef.current = requestAnimationFrame(drawFrame);
    };

    if (isPlaying) {
      animFrameIdRef.current = requestAnimationFrame(drawFrame);
    } else {
      drawFrame(0);
    }

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [isPlaying, height, mode, accentColor]);

  return (
    <div className={`relative w-full overflow-hidden rounded-lg bg-[#120E0B]/80 border border-[#594234]/40 ${className}`}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: `${height}px` }}
        className="block"
      />
      {isPlaying && (
        <span className="absolute top-1.5 left-2 text-[9px] font-mono text-[#E5A836] bg-[#1E1612]/90 px-1.5 py-0.5 rounded border border-[#594234]/50">
          امواج آوا • ۳۰ هرتز
        </span>
      )}
    </div>
  );
};
