import React, { useState } from 'react';
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Code2,
  Cpu,
  ExternalLink,
  FileText,
  Film,
  Maximize2,
  ShieldCheck,
  Star,
  Wrench,
  X,
} from 'lucide-react';
import { GitHubIcon } from './BrandIcons';
import type { InternshipItem, ProjectItem } from '../types/portfolio';
import { CinematicPanel } from './CinematicPanel';

interface ProjectsSectionProps {
  projects: ProjectItem[];
  title: string;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects, title }) => {
  const [activeProject, setActiveProject] = useState<ProjectItem | null>(null);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  const visibleProjects = [...projects]
    .filter((p) => p.visible)
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order);

  const openProject = (proj: ProjectItem) => {
    setActiveProject(proj);
    setActiveImageIdx(0);
  };

  return (
    <section id="projects" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-2">
          <span className="font-tech text-xs uppercase tracking-[0.28em] text-rose-400">
            04 // FEATURED HARDWARE &amp; EMBEDDED BUILDS
          </span>
          <h2 className="font-cinema text-3xl font-bold tracking-tight text-white sm:text-5xl">
            {title}
          </h2>
        </div>

        <div className="cinema-stage grid grid-cols-1 gap-8 lg:grid-cols-3">
          {visibleProjects.map((proj, idx) => {
            const coverImg = proj.images[0] || '/posters/kicad-pcb.svg';
            return (
              <CinematicPanel
                key={proj.id}
                tilt={idx % 2 === 0 ? 'left' : 'right'}
                delayMs={idx * 90}
                glow={proj.featured ? 'crimson' : 'purple'}
                className="group flex flex-col overflow-hidden"
              >
                {/* Cinematic Poster Frame with Zoom */}
                <div
                  onClick={() => openProject(proj)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      openProject(proj);
                    }
                  }}
                  className="relative aspect-[16/10] w-full cursor-pointer overflow-hidden bg-black"
                >
                  <img
                    src={coverImg}
                    alt={proj.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c13] via-black/30 to-transparent" />

                  <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-rose-500/45 bg-black/70 px-2.5 py-1 font-tech text-[10px] uppercase tracking-widest text-rose-300 backdrop-blur-md">
                      {proj.code}
                    </span>
                    {proj.featured && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-amber-400/40 bg-amber-500/15 px-2 py-1 font-tech text-[10px] text-amber-200 backdrop-blur-md">
                        <Star className="h-3 w-3 fill-amber-300 text-amber-300" />
                        FEATURED
                      </span>
                    )}
                  </div>

                  <span className="absolute right-4 top-4 rounded-full border border-white/15 bg-black/65 px-2.5 py-1 font-tech text-[10px] text-zinc-200 backdrop-blur-md">
                    {proj.status}
                  </span>

                  <div className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/75 px-3 py-1.5 font-tech text-[10px] uppercase tracking-wider text-white opacity-90 transition group-hover:border-rose-400 group-hover:bg-rose-600/80">
                    <Maximize2 className="h-3 w-3" />
                    Inspect Build
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex flex-1 flex-col p-6">
                  <p className="font-tech text-[10px] uppercase tracking-[0.22em] text-violet-300">
                    {proj.category}
                  </p>
                  <h3 className="mt-1.5 font-cinema text-xl font-bold leading-snug text-white">
                    {proj.title}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-zinc-300">
                    {proj.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {proj.technologies.slice(0, 4).map((tech) => (
                      <span
                        key={tech}
                        className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-1 font-tech text-[10px] text-zinc-300"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-5">
                    <button
                      type="button"
                      onClick={() => openProject(proj)}
                      className="inline-flex items-center gap-1.5 font-tech text-xs uppercase tracking-wider text-rose-300 transition hover:text-white"
                    >
                      Full Cinema Case Study →
                    </button>
                    <div className="flex items-center gap-2">
                      {proj.videos.length > 0 && (
                        <span
                          title="Includes demo video"
                          className="rounded-lg border border-sky-400/30 bg-sky-500/15 p-1.5 text-sky-300"
                        >
                          <Film className="h-3.5 w-3.5" />
                        </span>
                      )}
                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`${proj.title} GitHub`}
                          className="rounded-lg border border-white/10 bg-white/5 p-1.5 text-zinc-300 transition hover:border-white/30 hover:text-white"
                        >
                          <GitHubIcon className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </CinematicPanel>
            );
          })}
        </div>
      </div>

      {/* Full-Screen Project Cinema Modal */}
      {activeProject && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeProject.title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-xl sm:p-6"
          onClick={() => setActiveProject(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-panel relative max-h-[92vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-white/15 p-6 sm:p-10"
          >
            <button
              type="button"
              onClick={() => setActiveProject(null)}
              aria-label="Close project view"
              className="sticky float-right top-0 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/75 text-zinc-200 transition hover:border-rose-500 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-wrap items-center gap-2.5">
              <span className="rounded-md border border-rose-500/40 bg-rose-500/15 px-3 py-1 font-tech text-xs text-rose-200">
                {activeProject.code}
              </span>
              <span className="rounded-md border border-violet-500/40 bg-violet-500/15 px-3 py-1 font-tech text-xs text-violet-200">
                {activeProject.category}
              </span>
              <span className="rounded-md border border-emerald-500/35 bg-emerald-500/10 px-3 py-1 font-tech text-xs text-emerald-200">
                {activeProject.status}
              </span>
            </div>

            <h3 className="mt-4 font-cinema text-2xl font-bold text-white sm:text-4xl">
              {activeProject.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-zinc-300 sm:text-base">
              {activeProject.description}
            </p>

            {/* Media Stage: Images + Videos */}
            {(activeProject.images.length > 0 || activeProject.videos.length > 0) && (
              <div className="mt-6 space-y-4">
                {activeProject.images.length > 0 && (
                  <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
                    <img
                      src={activeProject.images[activeImageIdx] || activeProject.images[0]}
                      alt={activeProject.title}
                      className="max-h-[420px] w-full object-contain"
                    />
                  </div>
                )}
                {activeProject.images.length > 1 && (
                  <div className="flex flex-wrap gap-2">
                    {activeProject.images.map((imgUrl, i) => (
                      <button
                        key={imgUrl + i}
                        type="button"
                        onClick={() => setActiveImageIdx(i)}
                        className={`h-16 w-24 overflow-hidden rounded-lg border transition ${
                          activeImageIdx === i
                            ? 'border-rose-500 ring-2 ring-rose-500/40'
                            : 'border-white/15 opacity-65 hover:opacity-100'
                        }`}
                      >
                        <img src={imgUrl} alt="" className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
                {activeProject.videos.map((vidUrl) => (
                  <div
                    key={vidUrl}
                    className="overflow-hidden rounded-2xl border border-white/10 bg-black"
                  >
                    <video src={vidUrl} controls className="max-h-[420px] w-full" />
                  </div>
                ))}
              </div>
            )}

            {/* Engineering Breakdown */}
            <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
              <div className="glass-subcard-3d rounded-2xl p-5">
                <p className="font-tech text-[11px] uppercase tracking-[0.2em] text-rose-400">
                  PROBLEM STATEMENT
                </p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                  {activeProject.problem}
                </p>
              </div>
              <div className="glass-subcard-3d rounded-2xl p-5">
                <p className="font-tech text-[11px] uppercase tracking-[0.2em] text-violet-300">
                  ENGINEERED SOLUTION
                </p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                  {activeProject.solution}
                </p>
              </div>
              <div className="glass-subcard-3d rounded-2xl p-5">
                <p className="font-tech text-[11px] uppercase tracking-[0.2em] text-sky-300">
                  MY CONTRIBUTION
                </p>
                <p className="mt-2 text-sm leading-relaxed text-zinc-300">
                  {activeProject.contribution}
                </p>
              </div>
            </div>

            {/* Hardware & Software Stack */}
            <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="glass-subcard-3d rounded-2xl p-5">
                <p className="mb-3 flex items-center gap-2 font-tech text-xs uppercase tracking-wider text-rose-300">
                  <Wrench className="h-4 w-4" />
                  Hardware Stack
                </p>
                <div className="flex flex-wrap gap-2">
                  {activeProject.hardware.map((item) => (
                    <span
                      key={item}
                      className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 font-tech text-xs text-zinc-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="glass-subcard-3d rounded-2xl p-5">
                <p className="mb-3 flex items-center gap-2 font-tech text-xs uppercase tracking-wider text-sky-300">
                  <Code2 className="h-4 w-4" />
                  Software &amp; Firmware
                </p>
                <div className="flex flex-wrap gap-2">
                  {activeProject.software.map((item) => (
                    <span
                      key={item}
                      className="rounded-lg border border-white/10 bg-white/[0.05] px-3 py-1.5 font-tech text-xs text-zinc-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* External Action Links */}
            <div className="mt-7 flex flex-wrap gap-3 border-t border-white/10 pt-5">
              {activeProject.githubUrl && (
                <a
                  href={activeProject.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-medium text-white transition hover:border-rose-400/50 hover:bg-white/10"
                >
                  <GitHubIcon className="h-4 w-4" />
                  View Source on GitHub
                </a>
              )}
              {activeProject.liveDemoUrl && (
                <a
                  href={activeProject.liveDemoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Live Demo
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

interface InternshipsSectionProps {
  internships: InternshipItem[];
  title: string;
}

export const InternshipsSection: React.FC<InternshipsSectionProps> = ({
  internships,
  title,
}) => {
  const [certModalItem, setCertModalItem] = useState<InternshipItem | null>(null);
  const visible = [...internships]
    .filter((i) => i.visible)
    .sort((a, b) => a.order - b.order);

  return (
    <section id="internships" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-2">
          <span className="font-tech text-xs uppercase tracking-[0.28em] text-violet-400">
            05 // INDUSTRY &amp; LAB EXPOSURE
          </span>
          <h2 className="font-cinema text-3xl font-bold tracking-tight text-white sm:text-5xl">
            {title}
          </h2>
        </div>

        <div className="cinema-stage grid grid-cols-1 gap-6 lg:grid-cols-2">
          {visible.map((item, idx) => (
            <CinematicPanel
              key={item.id}
              tilt={idx % 2 === 0 ? 'left' : 'right'}
              delayMs={idx * 80}
              glow={idx % 2 === 0 ? 'crimson' : 'purple'}
              className="flex flex-col p-6 sm:p-8"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-rose-500/35 bg-rose-500/12 text-rose-300">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-cinema text-xl font-bold text-white">
                      {item.organization}
                    </h3>
                    <p className="flex items-center gap-1.5 text-sm font-medium text-rose-300">
                      <Briefcase className="h-3.5 w-3.5" />
                      {item.role}
                    </p>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/[0.04] px-3 py-1 font-tech text-[11px] text-zinc-300">
                  <Calendar className="h-3 w-3 text-violet-400" />
                  {item.duration}
                </span>
              </div>

              {/* Optional metadata tags */}
              <div className="mt-4 flex flex-wrap gap-2">
                {item.division && (
                  <span className="rounded-md border border-violet-400/30 bg-violet-500/12 px-2.5 py-1 font-tech text-[10px] text-violet-200">
                    Division: {item.division}
                  </span>
                )}
                {item.certificateNo && (
                  <span className="rounded-md border border-sky-400/30 bg-sky-500/12 px-2.5 py-1 font-tech text-[10px] text-sky-200">
                    Cert No: {item.certificateNo}
                  </span>
                )}
                {item.standard && (
                  <span className="rounded-md border border-emerald-400/30 bg-emerald-500/12 px-2.5 py-1 font-tech text-[10px] text-emerald-200">
                    {item.standard}
                  </span>
                )}
                {item.certifiedDate && (
                  <span className="rounded-md border border-amber-400/30 bg-amber-500/12 px-2.5 py-1 font-tech text-[10px] text-amber-200">
                    Certified: {item.certifiedDate}
                  </span>
                )}
              </div>

              <div className="glass-subcard-3d mt-5 rounded-xl p-4">
                <p className="mb-1.5 flex items-center gap-1.5 font-tech text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                  <Cpu className="h-3 w-3 text-rose-400" />
                  Technical Focus
                </p>
                <p className="text-sm leading-relaxed text-zinc-200">{item.focus}</p>
              </div>

              {item.outcomes.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {item.outcomes.map((out) => (
                    <li key={out} className="flex items-start gap-2 text-xs text-zinc-300">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                      <span>{out}</span>
                    </li>
                  ))}
                </ul>
              )}

              {item.certificateFileUrl && (
                <div className="mt-5 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => setCertModalItem(item)}
                    className="inline-flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/15 px-4 py-2 font-tech text-xs text-rose-100 transition hover:bg-rose-500/30 hover:text-white"
                  >
                    {item.certificateFileType === 'pdf' ||
                    item.certificateFileUrl.toLowerCase().endsWith('.pdf') ? (
                      <FileText className="h-3.5 w-3.5 text-rose-300" />
                    ) : (
                      <ShieldCheck className="h-3.5 w-3.5 text-sky-300" />
                    )}
                    View Internship Certificate
                  </button>
                </div>
              )}
            </CinematicPanel>
          ))}
        </div>
      </div>

      {/* Internship Certificate Full-Screen Preview Modal */}
      {certModalItem && certModalItem.certificateFileUrl && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${certModalItem.organization} Certificate`}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/88 p-3 backdrop-blur-xl sm:p-6"
          onClick={() => setCertModalItem(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-panel relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/15 p-6 sm:p-9"
          >
            <button
              type="button"
              onClick={() => setCertModalItem(null)}
              aria-label="Close internship certificate"
              className="float-right inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/75 text-zinc-200 hover:border-rose-500 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <span className="rounded-md border border-rose-500/40 bg-rose-500/15 px-3 py-1 font-tech text-xs text-rose-200">
              INTERNSHIP CREDENTIAL
            </span>
            <h3 className="mt-3 font-cinema text-2xl font-bold text-white sm:text-3xl">
              {certModalItem.organization}
            </h3>
            <p className="mt-1 text-sm text-zinc-300">
              {certModalItem.role} • {certModalItem.duration}
            </p>
            {certModalItem.certificateNo && (
              <p className="mt-1 font-tech text-xs text-sky-300">
                Certificate No: {certModalItem.certificateNo}
              </p>
            )}

            <div className="mt-6 overflow-hidden rounded-2xl border border-white/15 bg-black">
              {certModalItem.certificateFileType === 'pdf' ||
              certModalItem.certificateFileUrl.toLowerCase().endsWith('.pdf') ? (
                <iframe
                  src={certModalItem.certificateFileUrl}
                  title={`${certModalItem.organization} Certificate`}
                  className="h-[540px] w-full"
                />
              ) : (
                <img
                  src={certModalItem.certificateFileUrl}
                  alt={`${certModalItem.organization} Certificate`}
                  className="max-h-[560px] w-full object-contain"
                />
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <a
                href={certModalItem.certificateFileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs text-white hover:border-rose-400/50"
              >
                <ExternalLink className="h-3.5 w-3.5" /> Open Original File
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
