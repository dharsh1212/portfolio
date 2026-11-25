import React, { useState } from 'react';
import {
  Check,
  Copy,
  ExternalLink,
  FileText,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from 'lucide-react';
import { GitHubIcon, LinkedInIcon } from './BrandIcons';
import type { ContactInfo, SocialLink } from '../types/portfolio';
import { CinematicPanel } from './CinematicPanel';

interface ContactSectionProps {
  contact: ContactInfo;
  socialLinks: SocialLink[];
  resumeUrl: string;
  title: string;
  onOpenAdmin: () => void;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  contact,
  socialLinks,
  resumeUrl,
  title,
  onOpenAdmin,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!contact.visible) return null;

  const copyValue = (key: string, value: string) => {
    navigator.clipboard.writeText(value).catch(() => undefined);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const visibleSocials = [...socialLinks]
    .filter((s) => s.visible)
    .sort((a, b) => a.order - b.order);

  const whatsappDigits = contact.whatsapp.replace(/[^0-9]/g, '');

  return (
    <section id="contact" className="relative pb-16 pt-20 sm:pb-24 sm:pt-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-2">
          <span className="font-tech text-xs uppercase tracking-[0.28em] text-sky-400">
            08 // DIRECT CHANNELS
          </span>
          <h2 className="font-cinema text-3xl font-bold tracking-tight text-white sm:text-5xl">
            {title}
          </h2>
        </div>

        <div className="cinema-stage grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Headline Callout */}
          <CinematicPanel tilt="left" glow="crimson" className="p-7 sm:p-10 lg:col-span-5">
            <p className="font-tech text-[11px] uppercase tracking-[0.24em] text-rose-400">
              {contact.name}
            </p>
            <h3 className="mt-2 font-cinema text-2xl font-bold text-white sm:text-3xl">
              {contact.headline}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-zinc-300">{contact.subtext}</p>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={`mailto:${contact.email}`}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-[0_12px_32px_-8px_rgba(225,29,72,0.7)] transition hover:scale-[1.02]"
              >
                <Mail className="h-4 w-4" />
                Send Email
              </a>
              {whatsappDigits && (
                <a
                  href={`https://wa.me/${whatsappDigits}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/35 bg-emerald-500/12 px-5 py-3 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/20"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
              )}
              {resumeUrl && (
                <a
                  href={resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-sky-400/35 bg-sky-500/12 px-5 py-3 text-sm font-medium text-sky-200 transition hover:bg-sky-500/20"
                >
                  <FileText className="h-4 w-4" />
                  Resume
                </a>
              )}
            </div>
          </CinematicPanel>

          {/* Contact & Social Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-7">
            {/* Email Card */}
            <CinematicPanel tilt="none" glow="crimson" className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-rose-500/30 bg-rose-500/12 text-rose-300">
                  <Mail className="h-4 w-4" />
                </div>
                <button
                  type="button"
                  onClick={() => copyValue('email', contact.email)}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1 font-tech text-[10px] text-zinc-400 hover:border-white/25 hover:text-white"
                >
                  {copiedKey === 'email' ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> Copy
                    </>
                  )}
                </button>
              </div>
              <p className="mt-4 font-tech text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                Email
              </p>
              <a
                href={`mailto:${contact.email}`}
                className="mt-1 block break-all text-sm font-semibold text-white hover:text-rose-300"
              >
                {contact.email}
              </a>
            </CinematicPanel>

            {/* Phone / WhatsApp Card */}
            <CinematicPanel tilt="none" glow="purple" className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/30 bg-violet-500/12 text-violet-300">
                  <Phone className="h-4 w-4" />
                </div>
                <button
                  type="button"
                  onClick={() => copyValue('phone', contact.phone)}
                  className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-2.5 py-1 font-tech text-[10px] text-zinc-400 hover:border-white/25 hover:text-white"
                >
                  {copiedKey === 'phone' ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> Copy
                    </>
                  )}
                </button>
              </div>
              <p className="mt-4 font-tech text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                Phone / WhatsApp
              </p>
              <a
                href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                className="mt-1 block text-sm font-semibold text-white hover:text-violet-300"
              >
                {contact.phone}
              </a>
            </CinematicPanel>

            {/* Location Card */}
            <CinematicPanel tilt="none" glow="blue" className="p-5 sm:col-span-2">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-400/30 bg-sky-500/12 text-sky-300">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-tech text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                    Base Location
                  </p>
                  <p className="text-sm font-semibold text-white">{contact.location}</p>
                </div>
              </div>
            </CinematicPanel>

            {/* Dynamic Social Links */}
            {visibleSocials.map((soc) => {
              const lower = soc.platform.toLowerCase();
              const Icon = lower.includes('linkedin')
                ? LinkedInIcon
                : lower.includes('github')
                  ? GitHubIcon
                  : ExternalLink;
              return (
                <CinematicPanel
                  key={soc.id}
                  tilt="none"
                  glow={lower.includes('linkedin') ? 'blue' : 'purple'}
                  className="p-5"
                >
                  <a
                    href={soc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/[0.05] text-zinc-200 transition group-hover:border-rose-400/45 group-hover:text-rose-300">
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="mt-4 font-tech text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                        {soc.platform}
                      </p>
                      <p className="mt-1 break-all text-sm font-semibold text-white group-hover:text-rose-300">
                        {soc.displayText || soc.url}
                      </p>
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 text-zinc-500 transition group-hover:text-white" />
                  </a>
                </CinematicPanel>
              );
            })}
          </div>
        </div>

        {/* Minimal Footer */}
        <footer className="mt-20 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-xs text-zinc-500 sm:flex-row">
          <p>
            © {new Date().getFullYear()} <span className="text-zinc-300">{contact.name}</span> —
            Electronics &amp; Communication Engineering Portfolio.
          </p>
          <button
            type="button"
            onClick={onOpenAdmin}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 font-tech text-[11px] text-zinc-400 transition hover:border-rose-500/40 hover:text-white"
          >
            <Lock className="h-3 w-3" />
            Manage Portfolio in Admin Studio
          </button>
        </footer>
      </div>
    </section>
  );
};
