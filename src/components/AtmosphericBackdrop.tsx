import React, { useEffect, useRef } from 'react';

interface AtmosphericBackdropProps {
  intensity: 'subtle' | 'balanced' | 'cinematic';
  reducedMotion: boolean;
}

export const AtmosphericBackdrop: React.FC<AtmosphericBackdropProps> = ({
  intensity,
  reducedMotion,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerGlowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (reducedMotion) return;
    const handleMove = (e: PointerEvent) => {
      if (!pointerGlowRef.current) return;
      pointerGlowRef.current.style.transform = `translate3d(${e.clientX - 280}px, ${e.clientY - 280}px, 0)`;
    };
    window.addEventListener('pointermove', handleMove, { passive: true });
    return () => window.removeEventListener('pointermove', handleMove);
  }, [reducedMotion]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const count =
      intensity === 'subtle' ? 18 : intensity === 'balanced' ? 28 : 38;
    const particles = Array.from({ length: count }, (_, i) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.7 + Math.random() * 1.6,
      vx: (Math.random() - 0.5) * 0.14,
      vy: -0.08 - Math.random() * 0.22,
      alpha: 0.14 + Math.random() * 0.35,
      hue: i % 3 === 0 ? '244,63,94' : i % 3 === 1 ? '168,85,247' : '56,189,248',
    }));

    const drawFrame = () => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        if (!reducedMotion) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.hue}, ${p.alpha})`;
        ctx.fill();
      }
      if (!reducedMotion) {
        animId = requestAnimationFrame(drawFrame);
      }
    };

    drawFrame();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [intensity, reducedMotion]);

  const opacityFactor =
    intensity === 'subtle' ? 0.55 : intensity === 'balanced' ? 0.8 : 1;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-[#06060a]"
    >
      {/* Subtle volumetric crimson & purple atmospheric glows */}
      <div
        className="animate-slow-drift absolute -left-32 -top-24 h-[520px] w-[520px] rounded-full blur-[150px]"
        style={{
          opacity: 0.18 * opacityFactor,
          background: 'radial-gradient(circle, rgba(225,29,72,0.85), transparent 70%)',
        }}
      />
      <div
        className="animate-slow-drift absolute -right-32 top-[22%] h-[580px] w-[580px] rounded-full blur-[165px]"
        style={{
          animationDelay: '-6s',
          opacity: 0.16 * opacityFactor,
          background: 'radial-gradient(circle, rgba(139,92,246,0.85), transparent 70%)',
        }}
      />
      <div
        className="animate-slow-drift absolute bottom-[-160px] left-[28%] h-[500px] w-[620px] rounded-full blur-[170px]"
        style={{
          animationDelay: '-11s',
          opacity: 0.12 * opacityFactor,
          background: 'radial-gradient(circle, rgba(56,189,248,0.65), rgba(190,18,60,0.45), transparent 72%)',
        }}
      />

      {/* Subtle diagonal cinematic light streak */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background:
            'linear-gradient(125deg, transparent 35%, rgba(225,29,72,0.06) 47%, rgba(139,92,246,0.06) 53%, transparent 65%)',
        }}
      />

      {/* Micro grid telemetry horizon */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.22) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.22) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
          maskImage: 'radial-gradient(ellipse at center, black 35%, transparent 82%)',
        }}
      />

      {/* Cursor-following subtle light */}
      {!reducedMotion && (
        <div
          ref={pointerGlowRef}
          className="fixed left-0 top-0 h-[560px] w-[560px] rounded-full opacity-25 transition-transform duration-300 ease-out will-change-transform"
          style={{
            background:
              'radial-gradient(circle, rgba(225,29,72,0.14) 0%, rgba(139,92,246,0.08) 38%, transparent 70%)',
          }}
        />
      )}

      {/* Subtle floating particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

      {/* Cinema vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 42%, rgba(4,4,8,0.72) 86%, rgba(3,3,6,0.94) 100%)',
        }}
      />
    </div>
  );
};
