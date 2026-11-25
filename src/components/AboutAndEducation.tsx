import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronUp,
  Cpu,
  GraduationCap,
  Hash,
  MapPin,
  Target,
  UserCheck,
} from 'lucide-react';
import type { AboutInfo, EducationItem } from '../types/portfolio';
import { CinematicPanel } from './CinematicPanel';

interface AboutSectionProps {
  about: AboutInfo;
  title: string;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ about, title }) => {
  if (!about.visible) return null;

  const specs = [
    { label: 'Full Name', value: about.name, icon: UserCheck },
    { label: 'Degree Program', value: about.course, icon: GraduationCap },
    { label: 'Institution', value: about.institution, icon: BookOpen },
    { label: 'Current CGPA', value: about.cgpa, icon: Award, highlight: true },
    { label: 'Current Semester', value: about.semester, icon: Calendar },
    { label: 'Academic Batch', value: about.batch, icon: Calendar },
    { label: 'Register Number', value: about.registerNumber, icon: Hash },
    { label: 'Academic Status', value: about.status, icon: Cpu },
    { label: 'Location', value: about.location, icon: MapPin },
  ];

  return (
    <section id="about" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-2">
          <span className="font-tech text-xs uppercase tracking-[0.28em] text-rose-400">
            01 // ENGINEERING PROFILE
          </span>
          <h2 className="font-cinema text-3xl font-bold tracking-tight text-white sm:text-5xl">
            {title}
          </h2>
        </div>

        <div className="cinema-stage grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Left Narrative & Target Roles */}
          <CinematicPanel tilt="left" glow="purple" className="p-7 sm:p-9 lg:col-span-5">
            <p className="font-tech text-[11px] uppercase tracking-[0.24em] text-violet-300">
              EXECUTIVE SUMMARY
            </p>
            <h3 className="mt-2 font-cinema text-2xl font-bold text-white">{about.name}</h3>
            <p className="mt-4 text-sm leading-relaxed text-zinc-300 sm:text-base">
              {about.summary}
            </p>

            <div className="mt-7 border-t border-white/10 pt-6">
              <p className="mb-3 flex items-center gap-2 font-tech text-[11px] uppercase tracking-[0.2em] text-rose-300">
                <Target className="h-3.5 w-3.5" />
                Target Opportunities
              </p>
              <div className="flex flex-wrap gap-2">
                {about.targetOpportunities.map((role) => (
                  <span
                    key={role}
                    className="rounded-xl border border-rose-500/35 bg-rose-500/12 px-3.5 py-2 font-tech text-xs text-rose-100 shadow-[0_0_20px_rgba(225,29,72,0.12)]"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </CinematicPanel>

          {/* Right Telemetry Specifications Grid */}
          <CinematicPanel tilt="right" glow="crimson" className="p-6 sm:p-8 lg:col-span-7">
            <div className="mb-5 flex items-center justify-between">
              <span className="font-tech text-[11px] uppercase tracking-[0.22em] text-zinc-400">
                ACADEMIC &amp; IDENTITY TELEMETRY
              </span>
              <span className="rounded-full border border-emerald-500/35 bg-emerald-500/10 px-2.5 py-0.5 font-tech text-[10px] text-emerald-300">
                VERIFIED RECORD
              </span>
            </div>
            <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
              {specs.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className={`glass-subcard-3d rounded-xl p-4 ${
                      item.highlight
                        ? 'border-rose-500/40 bg-gradient-to-br from-rose-500/20 to-violet-500/12'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 font-tech text-[10px] uppercase tracking-[0.18em] text-zinc-400">
                      <Icon className="h-3.5 w-3.5 text-rose-400" />
                      {item.label}
                    </div>
                    <p className="mt-1.5 text-sm font-semibold text-white">{item.value}</p>
                  </div>
                );
              })}
            </div>
          </CinematicPanel>
        </div>
      </div>
    </section>
  );
};

interface EducationSectionProps {
  items: EducationItem[];
  title: string;
}

export const EducationSection: React.FC<EducationSectionProps> = ({ items, title }) => {
  const [expandedId, setExpandedId] = useState<string | null>(items[0]?.id ?? null);
  const visibleItems = [...items]
    .filter((i) => i.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <section id="education" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-2">
          <span className="font-tech text-xs uppercase tracking-[0.28em] text-violet-400">
            02 // ACADEMIC TRAJECTORY
          </span>
          <h2 className="font-cinema text-3xl font-bold tracking-tight text-white sm:text-5xl">
            {title}
          </h2>
        </div>

        <div className="relative space-y-6 pl-6 sm:pl-10">
          {/* Glowing vertical timeline spine */}
          <div
            aria-hidden="true"
            className="absolute bottom-4 left-2 top-4 w-0.5 bg-gradient-to-b from-rose-500 via-violet-500 to-sky-400/40 sm:left-3.5"
          />

          {visibleItems.map((edu, idx) => {
            const expanded = expandedId === edu.id;
            return (
              <div key={edu.id} className="relative">
                {/* Timeline Node */}
                <span
                  aria-hidden="true"
                  className="absolute -left-[22px] top-7 flex h-4 w-4 items-center justify-center rounded-full border border-rose-400 bg-[#06060a] shadow-[0_0_16px_rgba(244,63,94,0.85)] sm:-left-[33px]"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                </span>

                <CinematicPanel
                  tilt={idx % 2 === 0 ? 'left' : 'right'}
                  delayMs={idx * 90}
                  glow={idx === 0 ? 'crimson' : 'purple'}
                  className="p-6 sm:p-7"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="rounded-md border border-violet-400/35 bg-violet-500/15 px-2.5 py-0.5 font-tech text-[11px] text-violet-200">
                          {edu.period}
                        </span>
                        <span className="rounded-md border border-rose-500/35 bg-rose-500/15 px-2.5 py-0.5 font-tech text-[11px] text-rose-200">
                          {edu.scoreLabel}
                        </span>
                        {edu.semesterOrLevel && (
                          <span className="font-tech text-[11px] text-zinc-400">
                            {edu.semesterOrLevel}
                          </span>
                        )}
                      </div>
                      <h3 className="mt-3 font-cinema text-xl font-bold text-white sm:text-2xl">
                        {edu.degree}
                      </h3>
                      <p className="mt-1 text-sm font-medium text-zinc-300">{edu.institution}</p>
                      {edu.registerNumber && (
                        <p className="mt-1 font-tech text-xs text-sky-300">
                          Register No: {edu.registerNumber}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setExpandedId(expanded ? null : edu.id)}
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-white/12 bg-white/[0.04] px-3.5 py-2 font-tech text-[11px] uppercase tracking-wider text-zinc-200 transition hover:border-rose-400/45 hover:text-white"
                    >
                      {expanded ? 'Hide Details' : 'Expand Details'}
                      {expanded ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  {expanded && (
                    <div className="mt-5 border-t border-white/10 pt-4 text-sm text-zinc-300">
                      <p className="leading-relaxed">{edu.details}</p>
                      {edu.highlights.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {edu.highlights.map((h) => (
                            <span
                              key={h}
                              className="rounded-lg border border-white/10 bg-black/40 px-3 py-1 font-tech text-[11px] text-zinc-200"
                            >
                              {h}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CinematicPanel>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
