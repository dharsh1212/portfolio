import React, { useMemo, useState } from 'react';
import {
  Award,
  Calendar,
  ExternalLink,
  FileText,
  Maximize2,
  ShieldCheck,
  Sparkles,
  Star,
  Trophy,
  X,
} from 'lucide-react';
import type { ActivityCategory, ActivityItem, CertificateItem } from '../types/portfolio';
import { CinematicPanel } from './CinematicPanel';

interface CertificationsSectionProps {
  certifications: CertificateItem[];
  title: string;
}

export const CertificationsSection: React.FC<CertificationsSectionProps> = ({
  certifications,
  title,
}) => {
  const [selectedCert, setSelectedCert] = useState<CertificateItem | null>(null);

  const visible = [...certifications]
    .filter((c) => c.visible)
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order);

  return (
    <section id="certifications" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-2">
          <span className="font-tech text-xs uppercase tracking-[0.28em] text-sky-400">
            06 // VERIFIED CREDENTIALS
          </span>
          <h2 className="font-cinema text-3xl font-bold tracking-tight text-white sm:text-5xl">
            {title}
          </h2>
        </div>

        <div className="cinema-stage grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {visible.map((cert, idx) => {
            const previewUrl =
              cert.thumbnailUrl || (cert.fileType === 'image' ? cert.fileUrl : '');
            return (
              <CinematicPanel
                key={cert.id}
                tilt={idx % 2 === 0 ? 'left' : 'right'}
                delayMs={idx * 70}
                glow={cert.featured ? 'crimson' : 'blue'}
                onClick={() => setSelectedCert(cert)}
                className="group flex cursor-pointer flex-col overflow-hidden p-5 sm:p-6"
              >
                {/* Certificate Preview Frame */}
                <div className="relative mb-5 aspect-[16/10] w-full overflow-hidden rounded-xl border border-white/10 bg-[#090a11]">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt={cert.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-rose-950/35 via-[#0b0c14] to-violet-950/35 p-4 text-center">
                      {cert.fileType === 'pdf' ? (
                        <FileText className="h-10 w-10 text-rose-400" />
                      ) : (
                        <ShieldCheck className="h-10 w-10 text-sky-400" />
                      )}
                      <span className="mt-2 font-tech text-[10px] uppercase tracking-widest text-zinc-400">
                        {cert.fileUrl
                          ? cert.fileType === 'pdf'
                            ? 'PDF CERTIFICATE'
                            : 'CREDENTIAL FILE'
                          : 'VERIFIED RECORD'}
                      </span>
                    </div>
                  )}
                  <div className="absolute right-3 top-3 flex items-center gap-1.5">
                    {cert.featured && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/40 bg-black/75 px-2.5 py-0.5 font-tech text-[10px] text-amber-200">
                        <Star className="h-2.5 w-2.5 fill-amber-300 text-amber-300" />
                        FEATURED
                      </span>
                    )}
                    <span className="rounded-full border border-white/15 bg-black/75 p-1.5 text-zinc-200 transition group-hover:border-rose-400 group-hover:text-white">
                      <Maximize2 className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 font-tech text-[10px] uppercase tracking-wider">
                  <span className="text-rose-300">{cert.category}</span>
                  <span className="text-zinc-400">{cert.issueDate}</span>
                </div>
                <h3 className="mt-2 font-cinema text-lg font-bold text-white">
                  {cert.name}
                </h3>
                <p className="mt-1 text-xs font-medium text-zinc-300">{cert.organization}</p>
                {cert.certificateId && (
                  <p className="mt-1.5 font-tech text-[11px] text-sky-300">
                    ID: {cert.certificateId}
                  </p>
                )}
                <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-zinc-400">
                  {cert.description}
                </p>
              </CinematicPanel>
            );
          })}
        </div>
      </div>

      {/* Full-Screen Certificate Viewer Modal (Image + PDF) */}
      {selectedCert && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedCert.name}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/88 p-3 backdrop-blur-xl sm:p-6"
          onClick={() => setSelectedCert(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-panel relative max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl border border-white/15 p-6 sm:p-9"
          >
            <button
              type="button"
              onClick={() => setSelectedCert(null)}
              aria-label="Close certificate preview"
              className="float-right inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/75 text-zinc-200 hover:border-rose-500 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <span className="rounded-md border border-rose-500/40 bg-rose-500/15 px-3 py-1 font-tech text-xs text-rose-200">
              {selectedCert.category}
            </span>
            <h3 className="mt-3 font-cinema text-2xl font-bold text-white sm:text-3xl">
              {selectedCert.name}
            </h3>
            <p className="mt-1 text-sm text-zinc-300">{selectedCert.organization}</p>

            <div className="mt-3 flex flex-wrap gap-4 font-tech text-xs text-zinc-400">
              {selectedCert.issueDate && (
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-violet-400" />
                  Issued: {selectedCert.issueDate}
                </span>
              )}
              {selectedCert.certificateId && (
                <span className="inline-flex items-center gap-1.5 text-sky-300">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  ID: {selectedCert.certificateId}
                </span>
              )}
            </div>

            {/* File Renderer */}
            {selectedCert.fileUrl ? (
              <div className="mt-6 overflow-hidden rounded-2xl border border-white/15 bg-black">
                {selectedCert.fileType === 'pdf' ||
                selectedCert.fileUrl.toLowerCase().endsWith('.pdf') ? (
                  <iframe
                    src={selectedCert.fileUrl}
                    title={selectedCert.name}
                    className="h-[520px] w-full"
                  />
                ) : (
                  <img
                    src={selectedCert.fileUrl}
                    alt={selectedCert.name}
                    className="max-h-[540px] w-full object-contain"
                  />
                )}
              </div>
            ) : selectedCert.thumbnailUrl ? (
              <div className="mt-6 overflow-hidden rounded-2xl border border-white/15 bg-black">
                <img
                  src={selectedCert.thumbnailUrl}
                  alt={selectedCert.name}
                  className="max-h-[520px] w-full object-contain"
                />
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-8 text-center">
                <FileText className="mx-auto h-10 w-10 text-zinc-500" />
                <p className="mt-2 text-sm text-zinc-400">
                  Certificate document file can be attached anytime from Admin Studio →
                  Certifications.
                </p>
              </div>
            )}

            <p className="mt-5 text-sm leading-relaxed text-zinc-300">
              {selectedCert.description}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {selectedCert.fileUrl && (
                <a
                  href={selectedCert.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white hover:border-rose-400/50"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open Original File
                </a>
              )}
              {selectedCert.verificationUrl && (
                <a
                  href={selectedCert.verificationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Verify Credential
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

interface AchievementsSectionProps {
  activities: ActivityItem[];
  title: string;
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({
  activities,
  title,
}) => {
  const [filter, setFilter] = useState<'ALL' | ActivityCategory>('ALL');

  const visible = useMemo(
    () =>
      [...activities]
        .filter((a) => a.visible)
        .sort((a, b) => Number(b.featured) - Number(a.featured) || a.order - b.order),
    [activities]
  );

  const presentCategories = useMemo(
    () => Array.from(new Set(visible.map((a) => a.category))),
    [visible]
  );

  const filtered =
    filter === 'ALL' ? visible : visible.filter((a) => a.category === filter);

  return (
    <section id="achievements" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <span className="font-tech text-xs uppercase tracking-[0.28em] text-rose-400">
              07 // HACKATHONS, WORKSHOPS &amp; RECOGNITION
            </span>
            <h2 className="mt-2 font-cinema text-3xl font-bold tracking-tight text-white sm:text-5xl">
              {title}
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              className={`rounded-full border px-3.5 py-1.5 font-tech text-[11px] uppercase tracking-wider transition ${
                filter === 'ALL'
                  ? 'border-rose-500/60 bg-rose-500/20 text-white'
                  : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white'
              }`}
            >
              All ({visible.length})
            </button>
            {presentCategories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={`rounded-full border px-3.5 py-1.5 font-tech text-[11px] uppercase tracking-wider transition ${
                  filter === cat
                    ? 'border-violet-400/60 bg-violet-500/20 text-white'
                    : 'border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="cinema-stage grid grid-cols-1 gap-6 md:grid-cols-2">
          {filtered.map((item, idx) => (
            <CinematicPanel
              key={item.id}
              tilt={idx % 2 === 0 ? 'left' : 'right'}
              delayMs={idx * 80}
              glow={item.category === 'Hackathons' ? 'crimson' : 'purple'}
              className="flex flex-col overflow-hidden p-6 sm:p-7"
            >
              {item.imageUrl && (
                <div className="mb-5 aspect-[16/9] overflow-hidden rounded-xl border border-white/10 bg-black">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/35 bg-rose-500/15 px-3 py-1 font-tech text-[10px] uppercase tracking-wider text-rose-200">
                  {item.category === 'Hackathons' || item.category === 'Awards' ? (
                    <Trophy className="h-3 w-3" />
                  ) : (
                    <Award className="h-3 w-3" />
                  )}
                  {item.category}
                </span>
                <div className="flex items-center gap-2">
                  {item.badgeText && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-violet-400/35 bg-violet-500/15 px-2.5 py-0.5 font-tech text-[10px] text-violet-200">
                      <Sparkles className="h-3 w-3" />
                      {item.badgeText}
                    </span>
                  )}
                  {item.date && (
                    <span className="font-tech text-[11px] text-zinc-400">{item.date}</span>
                  )}
                </div>
              </div>

              <h3 className="mt-4 font-cinema text-xl font-bold text-white sm:text-2xl">
                {item.title}
              </h3>
              <p className="mt-1 text-sm font-medium text-sky-300/90">{item.organization}</p>
              <p className="mt-3 text-sm leading-relaxed text-zinc-300">{item.description}</p>

              {item.linkUrl && (
                <a
                  href={item.linkUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-1.5 font-tech text-xs text-rose-300 hover:text-white"
                >
                  View Details <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </CinematicPanel>
          ))}
        </div>
      </div>
    </section>
  );
};
