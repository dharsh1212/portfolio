import React, { useCallback, useEffect, useState } from 'react';
import { fetchPortfolio } from './lib/api';
import type { PortfolioData, SectionKey } from './types/portfolio';
import { AtmosphericBackdrop } from './components/AtmosphericBackdrop';
import { GlassCursor3D } from './components/GlassCursor3D';
import { OpeningSequence } from './components/OpeningSequence';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { AboutSection, EducationSection } from './components/AboutAndEducation';
import { SkillUniverse } from './components/SkillUniverse';
import { InternshipsSection, ProjectsSection } from './components/ProjectsAndInternships';
import {
  AchievementsSection,
  CertificationsSection,
} from './components/CertificationsAndActivities';
import { ContactSection } from './components/ContactSection';
import { AdminDashboard } from './components/admin/AdminDashboard';

const TRACKED_SECTIONS: SectionKey[] = [
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

export function App() {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() =>
    window.location.pathname.startsWith('/admin')
  );
  const [activeSection, setActiveSection] = useState<SectionKey>('home');
  const [cameraTraveling, setCameraTraveling] = useState(false);
  const [showIntro, setShowIntro] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState<boolean>(() =>
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  // Track cinema scroll laser progress
  useEffect(() => {
    const onScroll = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      setScrollProgress(max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Sync browser back/forward navigation
  useEffect(() => {
    const onPop = () => {
      setIsAdminRoute(window.location.pathname.startsWith('/admin'));
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // Load live portfolio JSON from backend
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchPortfolio();
        if (!mounted) return;
        setPortfolio(data);
        if (data.settings.reducedMotionDefault) {
          setReducedMotion(true);
        }
        if (
          data.settings.introEnabled &&
          !data.settings.reducedMotionDefault &&
          !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
          !window.location.pathname.startsWith('/admin')
        ) {
          setShowIntro(true);
        }
      } catch (err) {
        if (mounted) {
          setLoadError(err instanceof Error ? err.message : 'Unable to connect to portfolio server');
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Sync dynamic page title & meta description from Admin Settings
  useEffect(() => {
    if (!portfolio) return;
    document.title = portfolio.settings.siteTitle;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', portfolio.settings.metaDescription);
    }
  }, [portfolio]);

  // Apply reduced-motion class on document root
  useEffect(() => {
    document.documentElement.classList.toggle('reduced-motion', reducedMotion);
  }, [reducedMotion]);

  // Track visible scene during scroll
  useEffect(() => {
    if (isAdminRoute || !portfolio) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id as SectionKey;
            if (TRACKED_SECTIONS.includes(id)) {
              setActiveSection(id);
            }
          }
        }
      },
      { threshold: 0.32 }
    );
    for (const id of TRACKED_SECTIONS) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [isAdminRoute, portfolio]);

  const navigateToSection = useCallback(
    (section: SectionKey) => {
      const target = document.getElementById(section);
      if (!target) return;
      if (reducedMotion) {
        target.scrollIntoView({ behavior: 'auto' });
        setActiveSection(section);
        return;
      }
      setCameraTraveling(true);
      setActiveSection(section);
      setTimeout(() => {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 110);
      setTimeout(() => {
        setCameraTraveling(false);
      }, 620);
    },
    [reducedMotion]
  );

  const openAdmin = useCallback(() => {
    window.history.pushState({}, '', '/admin');
    setIsAdminRoute(true);
    window.scrollTo({ top: 0 });
  }, []);

  const exitAdmin = useCallback(() => {
    window.history.pushState({}, '', '/');
    setIsAdminRoute(false);
    window.scrollTo({ top: 0 });
  }, []);

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#06060a] p-6 text-center text-zinc-200">
        <div className="glass-panel max-w-md rounded-2xl p-8">
          <p className="font-tech text-xs uppercase tracking-widest text-rose-400">
            PORTFOLIO LINK ERROR
          </p>
          <p className="mt-2 text-sm text-zinc-300">{loadError}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-5 rounded-xl bg-rose-600 px-5 py-2 text-xs font-semibold text-white"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#06060a]">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
          <p className="mt-4 font-tech text-xs uppercase tracking-[0.28em] text-zinc-400">
            INITIALIZING CINEMA STAGE...
          </p>
        </div>
      </div>
    );
  }

  if (isAdminRoute) {
    return (
      <>
        <GlassCursor3D reducedMotion={reducedMotion} />
        <AdminDashboard
          portfolio={portfolio}
          onPortfolioChange={setPortfolio}
          onExitAdmin={exitAdmin}
        />
      </>
    );
  }

  const vis = portfolio.settings.sectionVisibility;
  const titles = portfolio.settings.sectionTitles;

  return (
    <div className={`relative min-h-screen ${cameraTraveling ? 'camera-traveling' : ''}`}>
      <GlassCursor3D reducedMotion={reducedMotion} />
      <AtmosphericBackdrop
        intensity={portfolio.settings.atmosphereIntensity}
        reducedMotion={reducedMotion}
      />

      {showIntro && (
        <OpeningSequence
          name={portfolio.profile.name}
          subtitle={portfolio.profile.subtitle}
          positioning={portfolio.profile.positioning}
          onComplete={() => {
            setShowIntro(false);
          }}
        />
      )}

      <Navbar
        activeSection={activeSection}
        settings={portfolio.settings}
        reducedMotion={reducedMotion}
        onToggleReducedMotion={() => setReducedMotion((v) => !v)}
        onNavigate={navigateToSection}
        onOpenAdmin={openAdmin}
      />

      {/* Glowing Cinema Scroll Progress Laser */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-16 z-40 h-[2px] w-full bg-white/[0.04]"
      >
        <div
          className="h-full bg-gradient-to-r from-rose-500 via-violet-500 to-sky-400 shadow-[0_0_12px_rgba(244,63,94,0.85)] transition-[width] duration-150 ease-out"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <main className="camera-steady relative z-10">
        {vis.home !== false && (
          <HeroSection
            profile={portfolio.profile}
            reducedMotion={reducedMotion}
            onNavigate={navigateToSection}
            onOpenAdmin={openAdmin}
          />
        )}

        {vis.about !== false && (
          <AboutSection about={portfolio.about} title={titles.about || 'ABOUT ME'} />
        )}

        {vis.education !== false && (
          <EducationSection
            items={portfolio.education}
            title={titles.education || 'EDUCATION TIMELINE'}
          />
        )}

        {vis.skills !== false && (
          <SkillUniverse
            categories={portfolio.skillCategories}
            title={titles.skills || 'SKILL UNIVERSE'}
          />
        )}

        {vis.projects !== false && (
          <ProjectsSection
            projects={portfolio.projects}
            title={titles.projects || 'PROJECT SHOWCASE'}
          />
        )}

        {vis.internships !== false && (
          <InternshipsSection
            internships={portfolio.internships}
            title={titles.internships || 'INTERNSHIPS TIMELINE'}
          />
        )}

        {vis.certifications !== false && (
          <CertificationsSection
            certifications={portfolio.certifications}
            title={titles.certifications || 'CERTIFICATIONS'}
          />
        )}

        {vis.achievements !== false && (
          <AchievementsSection
            activities={portfolio.activities}
            title={titles.achievements || 'ACHIEVEMENTS & WORKSHOPS'}
          />
        )}

        {vis.contact !== false && (
          <ContactSection
            contact={portfolio.contact}
            socialLinks={portfolio.socialLinks}
            resumeUrl={portfolio.profile.resumeUrl}
            title={titles.contact || 'CONTACT'}
            onOpenAdmin={openAdmin}
          />
        )}
      </main>
    </div>
  );
}

export default App;
