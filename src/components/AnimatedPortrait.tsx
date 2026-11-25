import React, { useEffect, useRef, useState } from 'react';
import { ScanFace, ShieldCheck, Upload } from 'lucide-react';
import type { PortraitCalibration } from '../types/portfolio';

interface AnimatedPortraitProps {
  imageUrl: string;
  name: string;
  calibration: PortraitCalibration;
  reducedMotion?: boolean;
  showCalibrationGuides?: boolean;
  onOpenAdmin?: () => void;
  compact?: boolean;
}

export const AnimatedPortrait: React.FC<AnimatedPortraitProps> = ({
  imageUrl,
  name,
  calibration,
  reducedMotion = false,
  showCalibrationGuides = false,
  onOpenAdmin,
  compact = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const pointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const skinSamplesRef = useRef<{
    left: string;
    right: string;
    crease: string;
  }>({
    left: 'rgba(145, 108, 88, 0.92)',
    right: 'rgba(145, 108, 88, 0.92)',
    crease: 'rgba(58, 38, 30, 0.72)',
  });

  const [loaded, setLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Load actual user-uploaded image without altering identity
  useEffect(() => {
    if (!imageUrl) {
      setLoaded(false);
      setImgError(false);
      imgRef.current = null;
      return;
    }
    setLoaded(false);
    setImgError(false);
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imgRef.current = img;
      // Sample authentic skin tone just above each calibrated eye for seamless natural blinking
      try {
        const off = document.createElement('canvas');
        off.width = 240;
        off.height = 300;
        const octx = off.getContext('2d');
        if (octx) {
          const scale = Math.max(off.width / img.width, off.height / img.height) * calibration.zoom;
          const dw = img.width * scale;
          const dh = img.height * scale;
          const dx = (off.width - dw) / 2 + (calibration.offsetX / 100) * off.width;
          const dy = (off.height - dh) / 2 + (calibration.offsetY / 100) * off.height;
          octx.drawImage(img, dx, dy, dw, dh);

          const samplePixel = (pxPct: number, pyPct: number) => {
            const sx = Math.min(off.width - 2, Math.max(1, Math.round((pxPct / 100) * off.width)));
            const sy = Math.min(
              off.height - 2,
              Math.max(1, Math.round(((pyPct - 3.2) / 100) * off.height))
            );
            const data = octx.getImageData(sx - 1, sy - 1, 3, 3).data;
            let r = 0,
              g = 0,
              b = 0;
            for (let i = 0; i < data.length; i += 4) {
              r += data[i];
              g += data[i + 1];
              b += data[i + 2];
            }
            const count = data.length / 4;
            return {
              r: Math.round(r / count),
              g: Math.round(g / count),
              b: Math.round(b / count),
            };
          };

          const l = samplePixel(calibration.leftEyeX, calibration.leftEyeY);
          const r = samplePixel(calibration.rightEyeX, calibration.rightEyeY);
          skinSamplesRef.current = {
            left: `rgb(${l.r}, ${l.g}, ${l.b})`,
            right: `rgb(${r.r}, ${r.g}, ${r.b})`,
            crease: `rgb(${Math.max(0, Math.round(l.r * 0.45))}, ${Math.max(
              0,
              Math.round(l.g * 0.4)
            )}, ${Math.max(0, Math.round(l.b * 0.38))})`,
          };
        }
      } catch {
        // fallback skin tone preserved
      }
      setLoaded(true);
    };
    img.onerror = () => {
      setImgError(true);
      setLoaded(false);
    };
    img.src = imageUrl;
  }, [
    imageUrl,
    calibration.leftEyeX,
    calibration.leftEyeY,
    calibration.rightEyeX,
    calibration.rightEyeY,
    calibration.zoom,
    calibration.offsetX,
    calibration.offsetY,
  ]);

  // Subtle pointer tracking for gentle head & gaze orientation
  useEffect(() => {
    if (reducedMotion) return;
    const handleMove = (e: PointerEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const nx = Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth * 0.45)));
      const ny = Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight * 0.45)));
      pointerRef.current = { x: nx, y: ny };
    };
    window.addEventListener('pointermove', handleMove, { passive: true });
    return () => window.removeEventListener('pointermove', handleMove);
  }, [reducedMotion]);

  // High-DPI real-time cinematic portrait animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !loaded || !imgRef.current) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = 0;
    const startTime = performance.now();
    let nextBlinkAt = 2400 + Math.random() * 2400;
    let blinkStart = -1;
    let smoothPtrX = 0;
    let smoothPtrY = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = 420;
    const cssH = 520;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;

    const render = (now: number) => {
      const elapsed = now - startTime;
      const t = elapsed / 1000;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cssW, cssH);

      const img = imgRef.current;
      if (!img) return;

      // Smooth pointer interpolation
      smoothPtrX += (pointerRef.current.x - smoothPtrX) * 0.045;
      smoothPtrY += (pointerRef.current.y - smoothPtrY) * 0.045;

      // Subtle breathing & idle micro-motion (never exaggerated, zero distortion)
      const breathWave = calibration.enableBreathing && !reducedMotion ? Math.sin(t * 1.45) : 0;
      const idleYaw = !reducedMotion ? Math.sin(t * 0.55) * 1.2 + smoothPtrX * 2.1 : 0;
      const idlePitch = !reducedMotion ? Math.cos(t * 0.42) * 0.8 + smoothPtrY * 1.5 : 0;
      const headBobY = calibration.enableBreathing && !reducedMotion ? breathWave * 1.6 : 0;

      // Update 3D container tilt slightly for true physical depth
      if (containerRef.current && !reducedMotion) {
        containerRef.current.style.transform = `perspective(1200px) rotateY(${(
          idleYaw * 0.75
        ).toFixed(2)}deg) rotateX(${(-idlePitch * 0.65).toFixed(2)}deg)`;
      }

      // Base image cover rect
      const scale = Math.max(cssW / img.width, cssH / img.height) * calibration.zoom;
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = (cssW - dw) / 2 + (calibration.offsetX / 100) * cssW + smoothPtrX * 2.2;
      const dy = (cssH - dh) / 2 + (calibration.offsetY / 100) * cssH + headBobY;

      // 1. Draw upper portrait (identity locked, untouched facial proportions)
      ctx.save();
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.restore();

      // 2. Subtle chest/shoulder breathing layer (feathered mask below shoulderY)
      if (calibration.enableBreathing && !reducedMotion) {
        const shoulderPx = (calibration.shoulderY / 100) * cssH;
        const chestLift = breathWave * -1.8;
        const chestScaleX = 1 + Math.max(0, breathWave) * 0.006;

        ctx.save();
        ctx.beginPath();
        ctx.rect(0, shoulderPx, cssW, cssH - shoulderPx);
        ctx.clip();

        ctx.translate(cssW / 2, shoulderPx + (cssH - shoulderPx) / 2);
        ctx.scale(chestScaleX, 1 + Math.max(0, breathWave) * 0.008);
        ctx.translate(-cssW / 2, -(shoulderPx + (cssH - shoulderPx) / 2));

        ctx.globalAlpha = 0.72;
        ctx.drawImage(img, dx, dy + chestLift, dw, dh);
        ctx.restore();
      }

      // 3. Subtle natural eyelid blinking (samples real skin tone, 175ms natural cadence)
      let blinkAmount = 0;
      if (calibration.enableBlinking && !reducedMotion) {
        if (blinkStart < 0 && elapsed >= nextBlinkAt) {
          blinkStart = elapsed;
        }
        if (blinkStart >= 0) {
          const bElapsed = elapsed - blinkStart;
          const bDuration = 175;
          if (bElapsed <= bDuration) {
            blinkAmount = Math.sin((bElapsed / bDuration) * Math.PI);
          } else {
            blinkStart = -1;
            nextBlinkAt = elapsed + 3200 + Math.random() * 3400;
          }
        }
      }

      const lx = (calibration.leftEyeX / 100) * cssW + smoothPtrX * 2.2;
      const ly = (calibration.leftEyeY / 100) * cssH + headBobY;
      const rx = (calibration.rightEyeX / 100) * cssW + smoothPtrX * 2.2;
      const ry = (calibration.rightEyeY / 100) * cssH + headBobY;
      const eyeSpacing = Math.max(36, Math.abs(rx - lx));
      const eyeW = eyeSpacing * 0.28;
      const eyeH = eyeSpacing * 0.125;

      // Subtle iris catchlight & micro-gaze reflection
      if (calibration.enableGaze && !reducedMotion && blinkAmount < 0.4) {
        const gazeShiftX = Math.sin(t * 0.9) * 1.1 + smoothPtrX * 1.6;
        const gazeShiftY = Math.cos(t * 0.7) * 0.6 + smoothPtrY * 1.0;
        const drawCatchlight = (ex: number, ey: number) => {
          const grad = ctx.createRadialGradient(
            ex + gazeShiftX - 1.5,
            ey + gazeShiftY - 1.5,
            0.2,
            ex + gazeShiftX,
            ey + gazeShiftY,
            3.2
          );
          grad.addColorStop(0, 'rgba(255, 255, 255, 0.36)');
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(ex + gazeShiftX, ey + gazeShiftY, 3.2, 0, Math.PI * 2);
          ctx.fill();
        };
        drawCatchlight(lx, ly);
        drawCatchlight(rx, ry);
      }

      if (blinkAmount > 0.02) {
        const drawEyelid = (ex: number, ey: number, skinColor: string) => {
          ctx.save();
          ctx.globalAlpha = Math.min(0.94, blinkAmount * 0.94);
          ctx.beginPath();
          ctx.ellipse(ex, ey, eyeW, Math.max(1.5, eyeH * blinkAmount), 0, 0, Math.PI * 2);
          ctx.fillStyle = skinColor;
          ctx.shadowColor = skinSamplesRef.current.crease;
          ctx.shadowBlur = 4;
          ctx.fill();

          // Subtle natural lash-line crease
          ctx.beginPath();
          ctx.moveTo(ex - eyeW * 0.85, ey + eyeH * 0.25 * blinkAmount);
          ctx.quadraticCurveTo(
            ex,
            ey + eyeH * 0.72 * blinkAmount,
            ex + eyeW * 0.85,
            ey + eyeH * 0.25 * blinkAmount
          );
          ctx.strokeStyle = skinSamplesRef.current.crease;
          ctx.lineWidth = 1.4;
          ctx.stroke();
          ctx.restore();
        };

        drawEyelid(lx, ly, skinSamplesRef.current.left);
        drawEyelid(rx, ry, skinSamplesRef.current.right);
      }

      // 4. Subtle key-light & facial warmth modulation (syncs gently with breathing)
      if (!reducedMotion) {
        const keyGlow = 0.035 + (breathWave + 1) * 0.018;
        const keyGrad = ctx.createRadialGradient(
          cssW * 0.45 + smoothPtrX * 18,
          cssH * 0.32 + smoothPtrY * 14,
          12,
          cssW * 0.5,
          cssH * 0.4,
          cssW * 0.62
        );
        keyGrad.addColorStop(0, `rgba(255, 232, 224, ${keyGlow})`);
        keyGrad.addColorStop(0.55, 'rgba(139, 92, 246, 0.03)');
        keyGrad.addColorStop(1, 'rgba(6, 6, 10, 0.28)');
        ctx.fillStyle = keyGrad;
        ctx.fillRect(0, 0, cssW, cssH);
      }

      // 5. Cinematic Rim Lighting edge sweep
      if (calibration.enableRimLight) {
        const sweep = !reducedMotion ? (Math.sin(t * 0.85) + 1) / 2 : 0.5;
        const rimColors =
          calibration.rimColor === 'electric-blue'
            ? ['rgba(56,189,248,0.28)', 'rgba(139,92,246,0.22)']
            : calibration.rimColor === 'violet-gold'
              ? ['rgba(168,85,247,0.28)', 'rgba(251,191,36,0.18)']
              : ['rgba(244,63,94,0.3)', 'rgba(139,92,246,0.26)'];

        const leftRim = ctx.createLinearGradient(0, 0, cssW * 0.34, cssH);
        leftRim.addColorStop(0, rimColors[0]);
        leftRim.addColorStop(0.5 + sweep * 0.2, 'rgba(0,0,0,0)');
        ctx.fillStyle = leftRim;
        ctx.fillRect(0, 0, cssW * 0.36, cssH);

        const rightRim = ctx.createLinearGradient(cssW, 0, cssW * 0.66, cssH);
        rightRim.addColorStop(0, rimColors[1]);
        rightRim.addColorStop(0.5 + (1 - sweep) * 0.2, 'rgba(0,0,0,0)');
        ctx.fillStyle = rightRim;
        ctx.fillRect(cssW * 0.64, 0, cssW * 0.36, cssH);
      }

      // 6. Soft lower cinema vignette blend
      const bottomVignette = ctx.createLinearGradient(0, cssH * 0.62, 0, cssH);
      bottomVignette.addColorStop(0, 'rgba(6,6,10,0)');
      bottomVignette.addColorStop(1, 'rgba(6,6,10,0.88)');
      ctx.fillStyle = bottomVignette;
      ctx.fillRect(0, cssH * 0.6, cssW, cssH * 0.4);

      if (!reducedMotion) {
        rafId = requestAnimationFrame(render);
      }
    };

    rafId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(rafId);
  }, [loaded, calibration, reducedMotion]);

  const hasPhoto = Boolean(imageUrl) && !imgError;

  return (
    <div
      ref={containerRef}
      className={`glass-panel screen-reflection relative overflow-hidden rounded-3xl border border-white/12 transition-transform duration-300 ease-out ${
        compact ? 'aspect-[4/5] w-full max-w-[320px]' : 'aspect-[4/5] w-full max-w-[400px]'
      }`}
      style={{
        boxShadow:
          '0 30px 90px -20px rgba(0,0,0,0.9), 0 0 55px -16px rgba(225,29,72,0.28), 0 0 80px -24px rgba(139,92,246,0.25)',
      }}
    >
      {/* Subtle optical scan-sweep & corner brackets */}
      {!reducedMotion && hasPhoto && (
        <div
          aria-hidden="true"
          className="animate-scan-sweep pointer-events-none absolute inset-x-0 top-0 z-10 h-20 bg-gradient-to-b from-transparent via-sky-400/10 to-transparent"
        />
      )}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-3 z-20 rounded-2xl border border-white/[0.04]"
      />

      {/* Top holographic telemetry strip */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between px-4 py-3 text-[10px] font-tech uppercase tracking-[0.22em]">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-black/55 px-2.5 py-1 text-rose-300 backdrop-blur-md">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
          {hasPhoto ? 'LIVE PORTRAIT' : 'IDENTITY SLOT'}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-black/55 px-2.5 py-1 text-zinc-300 backdrop-blur-md">
          <ShieldCheck className="h-3 w-3 text-sky-400" />
          ID LOCKED
        </span>
      </div>

      {hasPhoto ? (
        <>
          <canvas
            ref={canvasRef}
            aria-label={`Animated digital portrait of ${name}`}
            className="h-full w-full object-cover"
          />

          {/* Calibration marker overlay (only shown inside Admin Calibration Preview) */}
          {showCalibrationGuides && (
            <div className="pointer-events-none absolute inset-0 z-30">
              <div
                className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-400 bg-sky-400/20"
                style={{ left: `${calibration.leftEyeX}%`, top: `${calibration.leftEyeY}%` }}
                title="Left Eye Anchor"
              />
              <div
                className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border border-sky-400 bg-sky-400/20"
                style={{ left: `${calibration.rightEyeX}%`, top: `${calibration.rightEyeY}%` }}
                title="Right Eye Anchor"
              />
              <div
                className="absolute inset-x-6 border-t border-dashed border-rose-400/80"
                style={{ top: `${calibration.shoulderY}%` }}
              >
                <span className="ml-2 bg-black/70 px-1.5 font-tech text-[9px] text-rose-300">
                  BREATHING ANCHOR
                </span>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="relative flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-[#0f101a] via-[#090a11] to-[#050508] p-6 text-center">
          <div className="mb-5 flex h-24 w-24 items-center justify-center rounded-full border border-rose-500/30 bg-rose-500/10 shadow-[0_0_40px_rgba(225,29,72,0.22)]">
            <ScanFace className="h-11 w-11 text-rose-400" />
          </div>
          <p className="font-cinema text-lg font-bold tracking-wide text-white">{name}</p>
          <p className="mt-2 max-w-[240px] text-xs leading-relaxed text-zinc-400">
            Identity-locked animated portrait engine ready. Upload your real photograph in the
            Admin Studio to activate live blinking, breathing &amp; rim-lit 2.5D motion.
          </p>
          {onOpenAdmin && (
            <button
              type="button"
              onClick={onOpenAdmin}
              className="mt-5 inline-flex items-center gap-2 rounded-full border border-rose-500/45 bg-rose-600/20 px-4 py-2 font-tech text-xs uppercase tracking-wider text-rose-200 transition hover:bg-rose-600/35 hover:text-white"
            >
              <Upload className="h-3.5 w-3.5" />
              Upload Photo in Admin
            </button>
          )}
        </div>
      )}

      {/* Bottom cinema identity plate */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-5">
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className="font-tech text-[10px] uppercase tracking-[0.24em] text-rose-400">
              ECE • EMBEDDED SYSTEMS
            </p>
            <p className="font-cinema text-lg font-bold tracking-wide text-white">{name}</p>
          </div>
          <span className="rounded-md border border-white/10 bg-black/60 px-2 py-0.5 font-tech text-[10px] text-zinc-300 backdrop-blur-sm">
            2.5D LIVE
          </span>
        </div>
      </div>
    </div>
  );
};
