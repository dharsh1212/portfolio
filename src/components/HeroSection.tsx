import React from 'react';
import { ArrowDownRight, Cpu, FileText, Play, Sparkles } from 'lucide-react';
import type { HeroProfile, SectionKey } from '../types/portfolio';
import { AnimatedPortrait } from './AnimatedPortrait';
import { CinematicPanel } from './CinematicPanel';

interface HeroSectionProps {
  profile: HeroProfile;
  reducedMotion: boolean;
  onNavigate: (section: SectionKey) => void;
  onOpenAdmin: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  profile,
  reducedMotion,
  onNavigate,
  onOpenAdmin,
}) => {
  const portraitSrc = profile.portraitSourceUrl || profile.profilePhotoUrl;

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center pt-24 pb-16 sm:pt-28 sm:pb-24"
    >
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8">
        {/* Left Tilted 3D Identity Slate */}
        <div className="cinema-stage lg:col-span-7">
          <CinematicPanel tilt="left" glow="crimson" className="p-6 sm:p-8 lg:p-10">
            {/* Streaming-Style Featured Tag */}
            <div className="mb-5 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-rose-500/40 bg-rose-500/15 px-3.5 py-1 font-tech text-[11px] uppercase tracking-[0.18em] text-rose-200 shadow-[0_0_24px_rgba(225,29,72,0.22)]">
                <span className="h-2 w-2 animate-pulse rounded-full bg-rose-500 shadow-[0_0_12px_#f43f5e]" />
                {profile.availabilityBadge || 'ECE PORTFOLIO STREAM'}
              </span>
              <span className="inline-flex items-center gap-1.5 font-tech text-[11px] uppercase tracking-[0.18em] text-zinc-400">
                <Cpu className="h-3.5 w-3.5 text-violet-400" />
                HW • FIRMWARE • PCB
              </span>
            </div>

            {/* Hero Display Typography — sized cleanly so full name is always 100% visible */}
            <h1 className="font-cinema animate-shimmer-text bg-gradient-to-r from-white via-rose-100 to-violet-200 bg-clip-text pr-2 text-[clamp(1.9rem,4.1vw,3.55rem)] font-extrabold leading-[1.08] tracking-tight text-transparent sm:whitespace-nowrap">
              {profile.name}
            </h1>

            <p className="mt-3 text-lg font-semibold text-zinc-100 sm:text-2xl">
              {profile.subtitle}
            </p>

            <p className="mt-2 font-tech text-xs uppercase tracking-[0.2em] text-rose-400 sm:text-sm">
              {profile.positioning}
            </p>

            {/* Subtle animated ECE Signal Waveform Divider */}
            <div className="my-4 flex items-center gap-3 opacity-80" aria-hidden="true">
              <svg viewBox="0 0 260 22" className="h-5 w-48 sm:w-64" fill="none">
                <path
                  d="M0 11 H36 L44 3 L52 19 L60 7 L68 15 L76 11 H130 L138 4 L146 18 L154 11 H260"
                  stroke="url(#waveGrad)"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={reducedMotion ? '' : 'animate-waveform'}
                />
                <defs>
                  <linearGradient id="waveGrad" x1="0" y1="0" x2="260" y2="0">
                    <stop offset="0%" stopColor="#f43f5e" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.3" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="h-px flex-1 bg-gradient-to-r from-sky-400/35 to-transparent" />
            </div>

            <p className="max-w-2xl text-sm leading-relaxed text-zinc-300 sm:text-base">
              {profile.tagline}
            </p>

            {/* Supporting Focus Pillars */}
            <div className="mt-6 flex flex-wrap gap-2">
              {profile.focusAreas.map((area) => (
                <span
                  key={area}
                  className="glass-subcard-3d inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-tech text-[11px] text-zinc-200"
                >
                  <Sparkles className="h-3 w-3 text-rose-400" />
                  {area}
                </span>
              ))}
            </div>

            {/* Cinematic CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <button
                type="button"
                onClick={() => onNavigate('projects')}
                className="btn-cinema-shine group inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-600 to-violet-600 px-6 py-3.5 text-sm font-semibold text-white shadow-[0_12px_35px_-8px_rgba(225,29,72,0.7)] transition hover:scale-[1.03] hover:shadow-[0_18px_46px_-6px_rgba(225,29,72,0.88)]"
              >
                <Play className="h-4 w-4 fill-current" />
                {profile.ctaPrimary || 'Explore Projects'}
              </button>

              <button
                type="button"
                onClick={() => onNavigate('about')}
                className="group inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-5 py-3.5 text-sm font-medium text-zinc-100 backdrop-blur-md transition hover:border-rose-400/50 hover:bg-white/[0.09]"
              >
                {profile.ctaSecondary || 'About & Dossier'}
                <ArrowDownRight className="h-4 w-4 text-rose-400 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" />
              </button>

              {profile.resumeUrl && (
                <a
                  href={profile.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-sky-400/30 bg-sky-500/10 px-4 py-3.5 font-tech text-xs uppercase tracking-wider text-sky-200 transition hover:border-sky-300 hover:bg-sky-500/20"
                >
                  <FileText className="h-4 w-4" />
                  Resume
                </a>
              )}
            </div>
          </CinematicPanel>
        </div>

        {/* Right Animated Digital Portrait Stage */}
        <div className="cinema-stage flex flex-col items-center lg:col-span-5">
          <div
            className={`relative flex w-full justify-center ${
              reducedMotion ? '' : 'animate-float-portrait'
            }`}
          >
            {/* Subtle backlit halo behind portrait */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -inset-6 rounded-full opacity-60 blur-3xl"
              style={{
                background:
                  'radial-gradient(circle, rgba(225,29,72,0.36) 0%, rgba(139,92,246,0.3) 52%, transparent 75%)',
              }}
            />
            <AnimatedPortrait
              imageUrl={portraitSrc}
              name={profile.name}
              calibration={profile.portraitCalibration}
              reducedMotion={reducedMotion}
              onOpenAdmin={onOpenAdmin}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
