import React, { useEffect, useRef, useState } from 'react';

interface CinematicPanelProps {
  children: React.ReactNode;
  className?: string;
  tilt?: 'left' | 'right' | 'none';
  interactiveTilt?: boolean;
  delayMs?: number;
  glow?: 'crimson' | 'purple' | 'blue' | 'neutral';
  onClick?: () => void;
}

export const CinematicPanel: React.FC<CinematicPanelProps> = ({
  children,
  className = '',
  tilt = 'none',
  interactiveTilt = true,
  delayMs = 0,
  glow = 'crimson',
  onClick,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [hoverTransform, setHoverTransform] = useState('');
  const [spot, setSpot] = useState<{ x: number; y: number; active: boolean }>({
    x: 50,
    y: 50,
    active: false,
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    setSpot({ x: xPct, y: yPct, active: true });

    if (!interactiveTilt || window.innerWidth < 1024) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    const rx = (-py * 5.2).toFixed(2);
    const ry = (px * 6.0).toFixed(2);
    setHoverTransform(
      `perspective(1400px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px) scale(1.01)`
    );
  };

  const handlePointerLeave = () => {
    setHoverTransform('');
    setSpot((s) => ({ ...s, active: false }));
  };

  const baseTiltClass =
    tilt === 'left'
      ? 'tilted-panel-left'
      : tilt === 'right'
        ? 'tilted-panel-right'
        : '';

  const glowBorder =
    glow === 'crimson'
      ? 'hover:border-rose-500/35 hover:shadow-[0_28px_70px_-15px_rgba(225,29,72,0.28)]'
      : glow === 'purple'
        ? 'hover:border-violet-500/35 hover:shadow-[0_28px_70px_-15px_rgba(139,92,246,0.28)]'
        : glow === 'blue'
          ? 'hover:border-sky-400/35 hover:shadow-[0_28px_70px_-15px_rgba(56,189,248,0.25)]'
          : 'hover:border-white/20';

  const spotTint =
    glow === 'purple'
      ? 'rgba(139, 92, 246, 0.14)'
      : glow === 'blue'
        ? 'rgba(56, 189, 248, 0.14)'
        : 'rgba(225, 29, 72, 0.14)';

  return (
    <div
      ref={ref}
      onClick={onClick}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        transitionDelay: `${delayMs}ms`,
        transform: hoverTransform || undefined,
      }}
      className={`scene-reveal glass-panel screen-reflection rounded-2xl ${baseTiltClass} ${glowBorder} ${
        visible ? 'is-visible' : ''
      } ${className}`}
    >
      {/* Cursor-tracked soft spotlight reflection */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl transition-opacity duration-300"
        style={{
          opacity: spot.active ? 1 : 0,
          background: `radial-gradient(420px circle at ${spot.x}% ${spot.y}%, ${spotTint}, transparent 65%)`,
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};
