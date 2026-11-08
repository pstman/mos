import React, { useRef, useState } from 'react';

interface RipplePoint {
  id: number;
  x: number;
  y: number;
}

interface TiltCard3DProps {
  children: React.ReactNode;
  className?: string;
  enable3D?: boolean;
  enableGlow?: boolean;
  maxTiltDeg?: number;
  onClick?: () => void;
}

/**
 * Interactive 3D/4D Perspective Card with Mouse-Tracking Specular Glare,
 * Magnetic Depth Lift, and Acoustic Click Shockwave Ripple.
 */
export const TiltCard3D: React.FC<TiltCard3DProps> = ({
  children,
  className = '',
  enable3D = true,
  enableGlow = true,
  maxTiltDeg = 9,
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState<string>(
    'perspective(1100px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
  );
  const [glarePos, setGlarePos] = useState<{ x: number; y: number; opacity: number }>({
    x: 50,
    y: 50,
    opacity: 0,
  });
  const [ripples, setRipples] = useState<RipplePoint[]>([]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const relX = e.clientX - rect.left;
    const relY = e.clientY - rect.top;
    const pctX = Math.max(0, Math.min(100, (relX / rect.width) * 100));
    const pctY = Math.max(0, Math.min(100, (relY / rect.height) * 100));

    if (enable3D) {
      const rotateY = ((pctX - 50) / 50) * maxTiltDeg;
      const rotateX = -((pctY - 50) / 50) * maxTiltDeg;
      setTransformStyle(
        `perspective(1100px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.018, 1.018, 1.018)`
      );
    }

    if (enableGlow) {
      setGlarePos({ x: pctX, y: pctY, opacity: 1 });
    }
  };

  const handleMouseLeave = () => {
    setTransformStyle('perspective(1100px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  const handleCardClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const id = Date.now() + Math.random();
      setRipples((prev) => [...prev, { id, x, y }]);
      setTimeout(() => {
        setRipples((prev) => prev.filter((r) => r.id !== id));
      }, 780);
    }
    if (onClick) onClick();
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleCardClick}
      style={{
        transform: transformStyle,
        transition:
          glarePos.opacity > 0
            ? 'transform 0.12s cubic-bezier(0.2, 0.8, 0.2, 1), border-color 0.3s ease, box-shadow 0.3s ease'
            : 'transform 0.55s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.3s ease, box-shadow 0.3s ease',
        transformStyle: 'preserve-3d',
      }}
      className="relative overflow-hidden rounded-[22px] bg-[var(--bg-card)] border border-[var(--color-border)] hover:border-[var(--color-gold)] shadow-[var(--shadow-card)] group"
    >
      {/* Dynamic Cursor-Tracking Specular Gold Glare */}
      {enableGlow && (
        <div
          className="pointer-events-none absolute inset-0 z-20 transition-opacity duration-300"
          style={{
            opacity: glarePos.opacity,
            background: `radial-gradient(420px circle at ${glarePos.x}% ${glarePos.y}%, rgba(214, 179, 108, 0.16), rgba(214, 179, 108, 0.04) 40%, transparent 75%)`,
          }}
        />
      )}

      {/* Interactive Click Acoustic Shockwave Ripples */}
      {ripples.map((r) => (
        <span
          key={r.id}
          style={{ left: r.x, top: r.y }}
          className="pointer-events-none absolute z-30 h-28 w-28 rounded-full border border-[var(--color-gold)] bg-[var(--color-gold)]/15 animate-shiri-ripple"
        />
      ))}

      <div className={`relative z-10 h-full ${className}`}>{children}</div>
    </div>
  );
};
