import React, { useState } from 'react';
import { Eye, Lock, Menu, Sparkles, X } from 'lucide-react';
import type { SectionKey, WebsiteSettings } from '../types/portfolio';

interface NavbarProps {
  activeSection: SectionKey;
  settings: WebsiteSettings;
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
  onNavigate: (section: SectionKey) => void;
  onOpenAdmin: () => void;
}

const SECTION_ORDER: SectionKey[] = [
  'home',
  'about',
  'education',
  'skills',
  'projects',
  'internships',
  'certifications',
  'achievements',
  'contact',
];

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  settings,
  reducedMotion,
  onToggleReducedMotion,
  onNavigate,
  onOpenAdmin,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleSections = SECTION_ORDER.filter(
    (key) => settings.sectionVisibility[key] !== false
  );

  const handleSelect = (key: SectionKey) => {
    setMobileOpen(false);
    onNavigate(key);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/[0.07] bg-[#06060a]/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Monogram */}
        <button
          type="button"
          onClick={() => handleSelect('home')}
          className="group flex items-center gap-2.5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded-lg px-1"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-500/40 bg-gradient-to-br from-rose-600/30 to-violet-700/30 font-cinema text-sm font-extrabold text-white shadow-[0_0_20px_rgba(225,29,72,0.3)] transition group-hover:scale-105">
            DS
          </span>
          <div className="hidden sm:block">
            <span className="block font-cinema text-sm font-bold tracking-wider text-white">
              DHARSHAN S
            </span>
            <span className="block font-tech text-[9px] uppercase tracking-[0.22em] text-zinc-400">
              ECE • EMBEDDED
            </span>
          </div>
        </button>

        {/* Desktop Minimal Cinematic Nav */}
        <nav aria-label="Primary Navigation" className="hidden xl:flex items-center gap-1">
          {visibleSections.map((key) => {
            const active = activeSection === key;
            const label = settings.sectionTitles[key] || key.toUpperCase();
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelect(key)}
                className={`group relative px-3 py-2 font-tech text-[11px] tracking-[0.16em] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 rounded ${
                  active ? 'text-white' : 'text-zinc-400 hover:text-zinc-100'
                }`}
              >
                {label}
                <span
                  className={`absolute inset-x-3 -bottom-0.5 h-[2px] rounded-full bg-gradient-to-r from-rose-500 via-violet-500 to-sky-400 transition-all duration-300 ${
                    active
                      ? 'opacity-100 shadow-[0_0_12px_rgba(244,63,94,0.8)]'
                      : 'scale-x-0 opacity-0 group-hover:scale-x-75 group-hover:opacity-60'
                  }`}
                />
              </button>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleReducedMotion}
            title={reducedMotion ? 'Enable Cinematic Motion' : 'Enable Reduced Motion'}
            className={`hidden sm:inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-tech text-[10px] uppercase tracking-wider transition ${
              reducedMotion
                ? 'border-sky-400/40 bg-sky-500/15 text-sky-200'
                : 'border-white/10 bg-white/[0.04] text-zinc-400 hover:border-white/25 hover:text-white'
            }`}
          >
            {reducedMotion ? <Eye className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
            {reducedMotion ? 'Reduced Motion' : 'Cinema FX'}
          </button>

          <button
            type="button"
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/35 bg-rose-600/15 px-3.5 py-1.5 font-tech text-[11px] uppercase tracking-wider text-rose-200 transition hover:border-rose-400 hover:bg-rose-600/30 hover:text-white"
          >
            <Lock className="h-3 w-3" />
            Admin Studio
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            className="inline-flex xl:hidden h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-200 hover:bg-white/10"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Tablet/Mobile Drawer */}
      {mobileOpen && (
        <div className="xl:hidden border-t border-white/10 bg-[#08080e]/95 px-4 py-4 backdrop-blur-2xl">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {visibleSections.map((key) => {
              const active = activeSection === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleSelect(key)}
                  className={`rounded-xl border px-3 py-2.5 text-left font-tech text-xs tracking-wider transition ${
                    active
                      ? 'border-rose-500/50 bg-rose-500/15 text-white'
                      : 'border-white/8 bg-white/[0.03] text-zinc-400 hover:text-white'
                  }`}
                >
                  {settings.sectionTitles[key] || key.toUpperCase()}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-white/10 pt-3">
            <button
              type="button"
              onClick={onToggleReducedMotion}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 font-tech text-[11px] text-zinc-300"
            >
              <Sparkles className="h-3.5 w-3.5 text-rose-400" />
              {reducedMotion ? 'Cinema FX: Off' : 'Cinema FX: On'}
            </button>
            <span className="font-tech text-[10px] text-zinc-500">TAP TO JUMP SCENE</span>
          </div>
        </div>
      )}
    </header>
  );
};
