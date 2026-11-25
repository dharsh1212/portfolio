import React, { useEffect, useRef, useState } from 'react';

interface GlassCursor3DProps {
  reducedMotion: boolean;
}

export const GlassCursor3D: React.FC<GlassCursor3DProps> = ({ reducedMotion }) => {
  const lensRef = useRef<HTMLDivElement | null>(null);
  const coreRef = useRef<HTMLDivElement | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [hoveringInteractive, setHoveringInteractive] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    if (!finePointer || reducedMotion) {
      setEnabled(false);
      document.documentElement.classList.remove('glass-cursor-active');
      return;
    }
    setEnabled(true);
    document.documentElement.classList.add('glass-cursor-active');

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let lensX = targetX;
    let lensY = targetY;
    let prevX = targetX;
    let prevY = targetY;
    let rafId = 0;
    let visible = false;

    const onMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      visible = true;

      if (coreRef.current) {
        coreRef.current.style.opacity = '1';
        coreRef.current.style.transform = `translate3d(${targetX - 5}px, ${targetY - 5}px, 0)`;
      }

      const el = e.target as HTMLElement | null;
      const interactive = Boolean(
        el?.closest('a, button, input, select, textarea, [role="button"]')
      );
      setHoveringInteractive(interactive);
    };

    const onDown = () => setPressed(true);
    const onUp = () => setPressed(false);
    const onLeave = () => {
      visible = false;
      if (lensRef.current) lensRef.current.style.opacity = '0';
      if (coreRef.current) coreRef.current.style.opacity = '0';
    };

    const tick = () => {
      lensX += (targetX - lensX) * 0.18;
      lensY += (targetY - lensY) * 0.18;

      const vx = Math.max(-14, Math.min(14, lensX - prevX));
      const vy = Math.max(-14, Math.min(14, lensY - prevY));
      prevX = lensX;
      prevY = lensY;

      if (lensRef.current && visible) {
        lensRef.current.style.opacity = '1';
        const rotY = (vx * 1.6).toFixed(1);
        const rotX = (-vy * 1.6).toFixed(1);
        lensRef.current.style.transform = `translate3d(${lensX - 24}px, ${
          lensY - 24
        }px, 0) perspective(400px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
      }
      rafId = requestAnimationFrame(tick);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    document.addEventListener('mouseleave', onLeave);
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      document.documentElement.classList.remove('glass-cursor-active');
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, [reducedMotion]);

  if (!enabled) return null;

  return (
    <>
      {/* Outer 3D Refractive Glass Orb */}
      <div
        ref={lensRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9999] opacity-0 transition-[opacity] duration-200 will-change-transform"
      >
        <div
          className={`relative flex h-12 w-12 items-center justify-center rounded-full transition-transform duration-200 ease-out ${
            pressed
              ? 'scale-75'
              : hoveringInteractive
                ? 'scale-125'
                : 'scale-100'
          }`}
          style={{
            backdropFilter: 'blur(4px) brightness(1.16) saturate(140%)',
            WebkitBackdropFilter: 'blur(4px) brightness(1.16) saturate(140%)',
            background:
              'radial-gradient(circle at 30% 26%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.06) 36%, rgba(225,29,72,0.08) 70%, rgba(139,92,246,0.14) 100%)',
            border: '1px solid rgba(255, 255, 255, 0.34)',
            boxShadow:
              '0 10px 26px rgba(0, 0, 0, 0.45), 0 0 20px rgba(225, 29, 72, 0.28), inset 2px 2px 6px rgba(255, 255, 255, 0.38), inset -2px -3px 8px rgba(139, 92, 246, 0.32)',
          }}
        >
          {/* Top-left 3D glass specular glint */}
          <span
            className="absolute left-2 top-1.5 h-2.5 w-4 rotate-[-28deg] rounded-full bg-white/55 blur-[0.5px]"
          />
          {/* Subtle inner prismatic ring */}
          <span
            className="h-6 w-6 rounded-full border border-sky-300/25"
          />
        </div>
      </div>

      {/* Crisp center glass bead */}
      <div
        ref={coreRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9999] opacity-0 will-change-transform"
      >
        <div
          className={`h-2.5 w-2.5 rounded-full transition-transform duration-150 ${
            pressed ? 'scale-150 bg-rose-400' : 'scale-100 bg-white/90'
          }`}
          style={{
            boxShadow: '0 0 12px rgba(255,255,255,0.9), 0 0 18px rgba(225,29,72,0.8)',
          }}
        />
      </div>
    </>
  );
};
