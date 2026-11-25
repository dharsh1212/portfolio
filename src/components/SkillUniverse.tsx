import React, { useMemo, useState } from 'react';
import { Cpu, Layers, Search, Sparkles } from 'lucide-react';
import type { SkillCategory } from '../types/portfolio';
import { CinematicPanel } from './CinematicPanel';

interface SkillUniverseProps {
  categories: SkillCategory[];
  title: string;
}

export const SkillUniverse: React.FC<SkillUniverseProps> = ({ categories, title }) => {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('ALL');
  const [query, setQuery] = useState('');

  const visibleCategories = useMemo(
    () =>
      [...categories]
        .filter((c) => c.visible)
        .sort((a, b) => a.order - b.order)
        .map((c) => ({
          ...c,
          skills: [...c.skills].filter((s) => s.visible).sort((a, b) => a.order - b.order),
        })),
    [categories]
  );

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    return visibleCategories
      .filter((c) => selectedCategoryId === 'ALL' || c.id === selectedCategoryId)
      .map((c) => ({
        ...c,
        skills: q
          ? c.skills.filter(
              (s) =>
                s.name.toLowerCase().includes(q) ||
                c.name.toLowerCase().includes(q) ||
                s.level.toLowerCase().includes(q)
            )
          : c.skills,
      }))
      .filter((c) => c.skills.length > 0 || !q);
  }, [visibleCategories, selectedCategoryId, query]);

  const totalSkills = visibleCategories.reduce((acc, c) => acc + c.skills.length, 0);

  return (
    <section id="skills" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <span className="font-tech text-xs uppercase tracking-[0.28em] text-sky-400">
              03 // TECHNICAL MATRIX • {totalSkills} CAPABILITIES
            </span>
            <h2 className="mt-2 font-cinema text-3xl font-bold tracking-tight text-white sm:text-5xl">
              {title}
            </h2>
          </div>

          <div className="relative w-full max-w-xs">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter skills, buses, MCUs..."
              aria-label="Filter skills"
              className="w-full rounded-xl border border-white/12 bg-white/[0.04] py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 backdrop-blur-md focus:border-rose-500/50 focus:outline-none"
            />
          </div>
        </div>

        {/* Category Constellation Filter Pills */}
        <div className="mb-8 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedCategoryId('ALL')}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-tech text-[11px] uppercase tracking-wider transition ${
              selectedCategoryId === 'ALL'
                ? 'border-rose-500/60 bg-rose-600/20 text-white shadow-[0_0_20px_rgba(225,29,72,0.3)]'
                : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/25 hover:text-zinc-200'
            }`}
          >
            <Layers className="h-3 w-3" />
            All Clusters ({visibleCategories.length})
          </button>

          {visibleCategories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`rounded-full border px-3.5 py-1.5 font-tech text-[11px] uppercase tracking-wider transition ${
                selectedCategoryId === cat.id
                  ? 'border-violet-400/60 bg-violet-500/20 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                  : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/25 hover:text-zinc-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* 3D Tilted Skill Universe Panels */}
        <div className="cinema-stage grid grid-cols-1 gap-6 md:grid-cols-2">
          {filteredCategories.map((cat, idx) => {
            const glow =
              cat.accent === 'crimson'
                ? 'crimson'
                : cat.accent === 'purple'
                  ? 'purple'
                  : 'blue';
            const badgeAccent =
              cat.accent === 'crimson'
                ? 'border-rose-500/35 bg-rose-500/12 text-rose-200'
                : cat.accent === 'purple'
                  ? 'border-violet-500/35 bg-violet-500/12 text-violet-200'
                  : cat.accent === 'blue'
                    ? 'border-sky-400/35 bg-sky-500/12 text-sky-200'
                    : 'border-emerald-400/35 bg-emerald-500/12 text-emerald-200';

            return (
              <CinematicPanel
                key={cat.id}
                tilt={idx % 2 === 0 ? 'left' : 'right'}
                delayMs={(idx % 4) * 70}
                glow={glow}
                className="p-6 sm:p-7"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-rose-400" />
                      <h3 className="font-tech text-xs font-semibold uppercase tracking-[0.2em] text-white">
                        {cat.name}
                      </h3>
                    </div>
                    {cat.description && (
                      <p className="mt-1.5 text-xs text-zinc-400">{cat.description}</p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded-full border px-2.5 py-0.5 font-tech text-[10px] ${badgeAccent}`}
                  >
                    {cat.skills.length} nodes
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {cat.skills.map((skill) => (
                    <div
                      key={skill.id}
                      className="glass-subcard-3d group/skill inline-flex items-center gap-2 rounded-xl px-3 py-2"
                    >
                      <Sparkles className="h-3 w-3 text-violet-400 transition group-hover/skill:text-rose-400" />
                      <span className="text-xs font-medium text-zinc-100">{skill.name}</span>
                      {skill.level && (
                        <span className="rounded bg-white/[0.06] px-1.5 py-0.5 font-tech text-[9px] uppercase text-zinc-400">
                          {skill.level}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </CinematicPanel>
            );
          })}
        </div>
      </div>
    </section>
  );
};
