import React, { useEffect, useState } from 'react';
import { ChevronRight, Cpu, MousePointerClick, Sparkles } from 'lucide-react';

interface OpeningSequenceProps {
  name: string;
  subtitle: string;
  positioning: string;
  onComplete: () => void;
}

export const OpeningSequence: React.FC<OpeningSequenceProps> = ({
  name,
  subtitle,
  positioning,
  onComplete,
}) => {
  const [phase, setPhase] = useState<'dark' | 'emerge' | 'standby' | 'exit'>('dark');

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('emerge'), 280);
    const t2 = setTimeout(() => setPhase('standby'), 1100);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  const handleEnter = () => {
    if (phase === 'exit') return;
    setPhase('exit');
    setTimeout(() => onComplete(), 650);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleEnter();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Click anywhere to open portfolio"
      onClick={handleEnter}
      className={`fixed inset-0 z-50 flex cursor-pointer select-none items-center justify-center overflow-hidden bg-[#040407] transition-all duration-700 ${
        phase === 'exit' ? 'pointer-events-none scale-105 opacity-0 blur-sm' : 'opacity-100'
      }`}
    >
      {/* Subtle volumetric crimson & purple backlights */}
      <div
        className={`absolute h-[540px] w-[540px] rounded-full blur-[165px] transition-all duration-1000 ${
          phase === 'dark' ? 'scale-50 opacity-0' : 'scale-100 opacity-40'
        }`}
        style={{
          background:
            'radial-gradient(circle, rgba(225,29,72,0.75) 0%, rgba(139,92,246,0.55) 55%, transparent 75%)',
        }}
      />

      {/* Tilted 3D Portfolio Slate Emerging from Darkness & Holding on Standby */}
      <div className="cinema-stage relative mx-4 w-full max-w-3xl">
        <div
          className={`glass-panel screen-reflection relative rounded-3xl border border-white/12 p-8 sm:p-12 transition-all duration-1000 ease-out ${
            phase === 'dark'
              ? 'scale-75 opacity-0 blur-xl'
              : phase === 'emerge'
                ? 'scale-95 opacity-85 blur-[2px]'
                : 'scale-100 opacity-100 blur-0 hover:border-rose-500/45'
          }`}
          style={{
            transform:
              phase === 'dark'
                ? 'perspective(1400px) rotateX(16deg) rotateY(-12deg) translateZ(-220px)'
                : phase === 'emerge'
                  ? 'perspective(1400px) rotateX(5deg) rotateY(-5deg) translateZ(-40px)'
                  : 'perspective(1400px) rotateX(1.5deg) rotateY(-2deg) translateZ(0px)',
          }}
        >
          <div className="mb-6 flex items-center justify-between text-xs font-tech uppercase tracking-[0.26em] text-zinc-400">
            <span className="inline-flex items-center gap-2 text-rose-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500 shadow-[0_0_10px_#f43f5e]" />
              {phase === 'standby' ? 'STANDBY // READY TO ENTER' : 'SYSTEM BOOT // PORTFOLIO STREAM'}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-violet-300/80">
              <Cpu className="h-3.5 w-3.5" /> ECE HARDWARE EDITION
            </span>
          </div>

          <div
            className={`transition-all duration-1000 ${
              phase === 'standby' || phase === 'exit'
                ? 'translate-y-0 opacity-100 blur-0'
                : 'translate-y-4 opacity-0 blur-md'
            }`}
          >
            <p className="mb-2 flex items-center gap-2 font-tech text-xs uppercase tracking-[0.28em] text-sky-300/85">
              <Sparkles className="h-3.5 w-3.5 text-rose-400" />
              PRESENTING DIGITAL ENGINEERING DOSSIER
            </p>
            <h1 className="font-cinema animate-shimmer-text bg-gradient-to-r from-white via-rose-200 to-violet-200 bg-clip-text pr-1 text-[clamp(1.85rem,4.5vw,3.5rem)] font-extrabold leading-[1.08] tracking-tight text-transparent">
              {name}
            </h1>
            <p className="mt-3 text-lg font-medium text-zinc-200 sm:text-2xl">{subtitle}</p>
            <p className="mt-2 font-tech text-xs tracking-wider text-rose-300/90 sm:text-sm">
              {positioning}
            </p>
          </div>

          {/* Cinematic progress / standby bar */}
          <div className="mt-8 h-0.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-rose-500 via-violet-500 to-sky-400 transition-all duration-[1400ms] ease-out"
              style={{ width: phase === 'dark' ? '10%' : '100%' }}
            />
          </div>

          {/* Interactive Click-Anywhere Prompt */}
          <div
            className={`mt-6 flex flex-wrap items-center justify-between gap-3 transition-opacity duration-700 ${
              phase === 'standby' ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <span className="inline-flex items-center gap-2 font-tech text-xs uppercase tracking-[0.22em] text-zinc-200">
              <MousePointerClick className="h-4 w-4 animate-bounce text-rose-400" />
              Click anywhere to open portfolio
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/45 bg-rose-600/20 px-4 py-1.5 font-tech text-[11px] uppercase tracking-widest text-rose-100 shadow-[0_0_24px_rgba(225,29,72,0.35)]">
              Enter Experience
              <ChevronRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
