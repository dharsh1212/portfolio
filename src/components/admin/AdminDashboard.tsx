import React, { useEffect, useState } from 'react';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Cpu,
  Download,
  Eye,
  EyeOff,
  FolderGit2,
  GraduationCap,
  Image as ImageIcon,
  Layers,
  Lock,
  LogOut,
  Mail,
  Plus,
  RotateCcw,
  Save,
  Settings,
  Share2,
  ShieldCheck,
  Star,
  Trash2,
  Upload,
  User,
  Wrench,
} from 'lucide-react';
import type {
  AboutInfo,
  ActivityCategory,
  ActivityItem,
  CertificateItem,
  ContactInfo,
  EducationItem,
  InternshipItem,
  PortfolioData,
  ProjectItem,
  SectionKey,
  SkillCategory,
  SocialLink,
  WebsiteSettings,
} from '../../types/portfolio';
import {
  changeAdminPassword,
  checkAuthStatus,
  loginAdmin,
  resetPortfolioData,
  savePortfolioData,
  setStoredToken,
  uploadMediaFile,
  verifySession,
} from '../../lib/api';
import { MediaLibraryManager, ProfileEditor } from './AdminMediaAndProfile';

type AdminTab =
  | 'profile'
  | 'about'
  | 'education'
  | 'skills'
  | 'projects'
  | 'internships'
  | 'certifications'
  | 'workshops'
  | 'achievements'
  | 'media'
  | 'contact'
  | 'social'
  | 'settings';

interface AdminDashboardProps {
  portfolio: PortfolioData;
  onPortfolioChange: (next: PortfolioData) => void;
  onExitAdmin: () => void;
}

const ADMIN_TABS: { id: AdminTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'profile', label: 'PROFILE & PORTRAIT', icon: User },
  { id: 'about', label: 'ABOUT', icon: BookOpen },
  { id: 'education', label: 'EDUCATION', icon: GraduationCap },
  { id: 'skills', label: 'SKILLS', icon: Cpu },
  { id: 'projects', label: 'PROJECTS', icon: FolderGit2 },
  { id: 'internships', label: 'INTERNSHIPS', icon: Briefcase },
  { id: 'certifications', label: 'CERTIFICATIONS', icon: ShieldCheck },
  { id: 'workshops', label: 'WORKSHOPS', icon: Wrench },
  { id: 'achievements', label: 'ACHIEVEMENTS', icon: Award },
  { id: 'media', label: 'MEDIA LIBRARY', icon: ImageIcon },
  { id: 'contact', label: 'CONTACT', icon: Mail },
  { id: 'social', label: 'SOCIAL LINKS', icon: Share2 },
  { id: 'settings', label: 'WEBSITE SETTINGS', icon: Settings },
];

function reorderList<T extends { order: number }>(list: T[], index: number, dir: -1 | 1): T[] {
  const sorted = [...list].sort((a, b) => a.order - b.order);
  const target = index + dir;
  if (target < 0 || target >= sorted.length) return sorted;
  const copy = [...sorted];
  const [moved] = copy.splice(index, 1);
  copy.splice(target, 0, moved);
  return copy.map((item, i) => ({ ...item, order: i }));
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  portfolio,
  onPortfolioChange,
  onExitAdmin,
}) => {
  const [authenticated, setAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isDefaultPassword, setIsDefaultPassword] = useState(true);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [activeTab, setActiveTab] = useState<AdminTab>('profile');
  const [toast, setToast] = useState<{ msg: string; isError: boolean } | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [session, status] = await Promise.all([verifySession(), checkAuthStatus()]);
        if (!mounted) return;
        setAuthenticated(session.authenticated);
        setIsDefaultPassword(status.isDefaultPassword);
      } catch {
        if (mounted) setAuthenticated(false);
      } finally {
        if (mounted) setCheckingAuth(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const notify = (msg: string, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => {
      setToast((prev) => (prev?.msg === msg ? null : prev));
    }, 3500);
  };

  const persistSection = async (patch: Partial<PortfolioData>, successMsg: string) => {
    const merged: PortfolioData = { ...portfolio, ...patch };
    const saved = await savePortfolioData(merged);
    onPortfolioChange(saved);
    notify(successMsg);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await loginAdmin(passwordInput);
      setAuthenticated(true);
      setIsDefaultPassword(res.isDefaultPassword);
      setPasswordInput('');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  const handleLogout = () => {
    setStoredToken('');
    setAuthenticated(false);
  };

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#06060a] text-zinc-300">
        <p className="font-tech text-xs uppercase tracking-widest">Verifying Admin Session...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="relative flex min-h-screen items-center justify-center bg-[#06060a] px-4">
        <div className="glass-panel w-full max-w-md rounded-3xl border border-white/15 p-8">
          <button
            type="button"
            onClick={onExitAdmin}
            className="mb-6 inline-flex items-center gap-1.5 font-tech text-xs text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Public Portfolio
          </button>

          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl border border-rose-500/40 bg-rose-500/15 text-rose-400">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="font-cinema text-2xl font-bold text-white">Portfolio Admin Studio</h1>
          <p className="mt-1 text-xs text-zinc-400">
            Sign in to edit profile, animated portrait, projects, internships, certifications, and
            media library.
          </p>

          {isDefaultPassword && (
            <div className="mt-4 rounded-xl border border-sky-400/30 bg-sky-500/10 p-3 text-xs text-sky-200">
              Initial setup password: <code className="font-tech font-bold">dharshan@2026</code>
              <br />
              You can change it anytime inside <strong>Website Settings</strong>.
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-5 space-y-4">
            <label className="block space-y-1.5 text-xs">
              <span className="text-zinc-400">Admin Password</span>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter admin password"
                required
                className="w-full rounded-xl border border-white/15 bg-black/60 px-4 py-3 text-sm text-white focus:border-rose-500 focus:outline-none"
              />
            </label>
            {authError && <p className="text-xs text-rose-400">{authError}</p>}
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-rose-600 to-violet-600 py-3 text-sm font-semibold text-white shadow-[0_12px_30px_-8px_rgba(225,29,72,0.7)]"
            >
              Unlock Admin Studio
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06060a] text-zinc-100">
      {/* Top Studio Bar */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#08090f]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onExitAdmin}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3 py-1.5 font-tech text-xs text-zinc-200 hover:border-rose-400/50 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> View Live Site
            </button>
            <div className="hidden sm:block">
              <p className="font-cinema text-sm font-bold text-white">DHARSHAN S — ADMIN STUDIO</p>
              <p className="font-tech text-[10px] text-zinc-400">
                Changes auto-publish to public portfolio upon Save
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden md:inline font-tech text-[10px] text-emerald-300">
              Last Synced: {new Date(portfolio.updatedAt).toLocaleTimeString()}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-3 py-1.5 font-tech text-xs text-zinc-300 hover:border-rose-500/50 hover:text-rose-200"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-xl border px-4 py-3 text-xs font-medium shadow-2xl backdrop-blur-xl ${
            toast.isError
              ? 'border-rose-500/50 bg-rose-950/90 text-rose-100'
              : 'border-emerald-500/50 bg-emerald-950/90 text-emerald-100'
          }`}
        >
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          {toast.msg}
        </div>
      )}

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 lg:grid-cols-12">
        {/* Sidebar Navigation */}
        <aside className="lg:col-span-3">
          <div className="flex gap-1.5 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:rounded-2xl lg:border lg:border-white/10 lg:bg-white/[0.02] lg:p-3">
            {ADMIN_TABS.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left font-tech text-[11px] tracking-wider transition ${
                    active
                      ? 'border border-rose-500/45 bg-rose-600/20 text-white'
                      : 'border border-transparent text-zinc-400 hover:bg-white/[0.04] hover:text-zinc-200'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-rose-400" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Active Section Workspace */}
        <section className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 sm:p-7 lg:col-span-9">
          {activeTab === 'profile' && (
            <ProfileEditor
              profile={portfolio.profile}
              media={portfolio.media}
              onSaveProfile={(next) => persistSection({ profile: next }, 'Profile saved.')}
              onPortfolioSynced={onPortfolioChange}
              notify={notify}
            />
          )}

          {activeTab === 'about' && (
            <AboutEditor
              about={portfolio.about}
              onSave={(next) => persistSection({ about: next }, 'About section saved.')}
              notify={notify}
            />
          )}

          {activeTab === 'education' && (
            <EducationEditor
              items={portfolio.education}
              onSave={(next) => persistSection({ education: next }, 'Education timeline saved.')}
              notify={notify}
            />
          )}

          {activeTab === 'skills' && (
            <SkillsEditor
              categories={portfolio.skillCategories}
              onSave={(next) => persistSection({ skillCategories: next }, 'Skills updated.')}
              notify={notify}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsEditor
              projects={portfolio.projects}
              media={portfolio.media}
              onSave={(next) => persistSection({ projects: next }, 'Projects saved.')}
              onPortfolioSynced={onPortfolioChange}
              notify={notify}
            />
          )}

          {activeTab === 'internships' && (
            <InternshipsEditor
              internships={portfolio.internships}
              media={portfolio.media}
              onSave={(next) => persistSection({ internships: next }, 'Internships saved.')}
              onPortfolioSynced={onPortfolioChange}
              notify={notify}
            />
          )}

          {activeTab === 'certifications' && (
            <CertificationsEditor
              certifications={portfolio.certifications}
              media={portfolio.media}
              onSave={(next) =>
                persistSection({ certifications: next }, 'Certifications saved.')
              }
              onPortfolioSynced={onPortfolioChange}
              notify={notify}
            />
          )}

          {activeTab === 'workshops' && (
            <ActivitiesEditor
              mode="workshops"
              activities={portfolio.activities}
              media={portfolio.media}
              onSave={(next) => persistSection({ activities: next }, 'Workshops & Training saved.')}
              notify={notify}
            />
          )}

          {activeTab === 'achievements' && (
            <ActivitiesEditor
              mode="achievements"
              activities={portfolio.activities}
              media={portfolio.media}
              onSave={(next) =>
                persistSection({ activities: next }, 'Achievements & Activities saved.')
              }
              notify={notify}
            />
          )}

          {activeTab === 'media' && (
            <MediaLibraryManager
              portfolio={portfolio}
              onPortfolioSynced={onPortfolioChange}
              notify={notify}
            />
          )}

          {activeTab === 'contact' && (
            <ContactEditor
              contact={portfolio.contact}
              onSave={(next) => persistSection({ contact: next }, 'Contact details saved.')}
              notify={notify}
            />
          )}

          {activeTab === 'social' && (
            <SocialLinksEditor
              links={portfolio.socialLinks}
              onSave={(next) => persistSection({ socialLinks: next }, 'Social links saved.')}
              notify={notify}
            />
          )}

          {activeTab === 'settings' && (
            <WebsiteSettingsEditor
              portfolio={portfolio}
              onSaveSettings={(next) =>
                persistSection({ settings: next }, 'Website settings saved.')
              }
              onPortfolioChange={onPortfolioChange}
              notify={notify}
            />
          )}
        </section>
      </div>
    </div>
  );
};

/* ---------- Sub-Editors ---------- */

function SectionHeader({
  title,
  subtitle,
  onAdd,
  addLabel,
  onSave,
  onCancel,
  saving,
}: {
  title: string;
  subtitle: string;
  onAdd?: () => void;
  addLabel?: string;
  onSave: () => void;
  onCancel: () => void;
  saving?: boolean;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
      <div>
        <h2 className="font-cinema text-2xl font-bold text-white">{title}</h2>
        <p className="text-xs text-zinc-400">{subtitle}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-1.5 rounded-xl border border-sky-400/40 bg-sky-500/15 px-3.5 py-2 text-xs font-medium text-sky-100 hover:bg-sky-500/25"
          >
            <Plus className="h-3.5 w-3.5" /> {addLabel || 'Add Item'}
          </button>
        )}
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-3.5 py-2 text-xs text-zinc-300 hover:bg-white/5"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-violet-600 px-4 py-2 text-xs font-semibold text-white"
        >
          <Save className="h-3.5 w-3.5" /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}

const AboutEditor: React.FC<{
  about: AboutInfo;
  onSave: (next: AboutInfo) => Promise<void>;
  notify: (m: string, err?: boolean) => void;
}> = ({ about, onSave, notify }) => {
  const [draft, setDraft] = useState<AboutInfo>(about);
  const [rolesInput, setRolesInput] = useState(about.targetOpportunities.join(', '));
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await onSave({
        ...draft,
        targetOpportunities: rolesInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      });
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Save failed', true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <SectionHeader
        title="About Me Dossier"
        subtitle="Update CGPA, semester, academic status, summary, and target opportunities."
        onSave={save}
        onCancel={() => {
          setDraft(about);
          setRolesInput(about.targetOpportunities.join(', '));
          notify('Cancelled About edits.');
        }}
        saving={saving}
      />

      <div className="mb-4 flex items-center gap-3">
        <label className="inline-flex items-center gap-2 text-xs text-zinc-300">
          <input
            type="checkbox"
            checked={draft.visible}
            onChange={(e) => setDraft({ ...draft, visible: e.target.checked })}
            className="accent-rose-500"
          />
          Show About section on public website
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
        {(
          [
            ['name', 'Full Name'],
            ['course', 'Course / Degree'],
            ['institution', 'Institution'],
            ['cgpa', 'Current CGPA'],
            ['semester', 'Semester'],
            ['batch', 'Batch'],
            ['registerNumber', 'Register Number'],
            ['status', 'Status'],
            ['location', 'Location'],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block space-y-1">
            <span className="text-zinc-400">{label}</span>
            <input
              value={draft[key]}
              onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
              className="w-full rounded-xl border border-white/12 bg-black/50 px-3.5 py-2.5 text-sm text-white"
            />
          </label>
        ))}

        <label className="block space-y-1 sm:col-span-2">
          <span className="text-zinc-400">Target Opportunities (comma-separated)</span>
          <input
            value={rolesInput}
            onChange={(e) => setRolesInput(e.target.value)}
            className="w-full rounded-xl border border-white/12 bg-black/50 px-3.5 py-2.5 text-sm text-white"
          />
        </label>

        <label className="block space-y-1 sm:col-span-2">
          <span className="text-zinc-400">Profile Summary</span>
          <textarea
            rows={4}
            value={draft.summary}
            onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
            className="w-full rounded-xl border border-white/12 bg-black/50 px-3.5 py-2.5 text-sm text-white"
          />
        </label>
      </div>
    </div>
  );
};

const EducationEditor: React.FC<{
  items: EducationItem[];
  onSave: (next: EducationItem[]) => Promise<void>;
  notify: (m: string, err?: boolean) => void;
}> = ({ items, onSave, notify }) => {
  const [draft, setDraft] = useState<EducationItem[]>(() =>
    [...items].sort((a, b) => a.order - b.order)
  );
  const [saving, setSaving] = useState(false);

  const addItem = () => {
    setDraft([
      ...draft,
      {
        id: `edu-${Date.now()}`,
        degree: 'New Degree / Certification Program',
        institution: 'Institution Name',
        period: '2026–2027',
        scoreLabel: 'Score / CGPA',
        semesterOrLevel: '',
        registerNumber: '',
        details: '',
        highlights: [],
        visible: true,
        order: draft.length,
      },
    ]);
  };

  return (
    <div>
      <SectionHeader
        title="Education Timeline"
        subtitle="Add, edit, reorder, or hide education entries."
        onAdd={addItem}
        addLabel="Add Education"
        saving={saving}
        onCancel={() => {
          setDraft([...items].sort((a, b) => a.order - b.order));
          notify('Reverted Education edits.');
        }}
        onSave={async () => {
          setSaving(true);
          try {
            await onSave(draft);
          } catch (e) {
            notify(e instanceof Error ? e.message : 'Save failed', true);
          } finally {
            setSaving(false);
          }
        }}
      />

      <div className="space-y-4">
        {draft.map((edu, idx) => (
          <div
            key={edu.id}
            className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-3 text-xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-tech text-rose-300">#{idx + 1} • {edu.degree}</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setDraft(reorderList(draft, idx, -1))}
                  className="rounded-lg border border-white/10 p-1.5 hover:bg-white/10"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDraft(reorderList(draft, idx, 1))}
                  className="rounded-lg border border-white/10 p-1.5 hover:bg-white/10"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDraft(
                      draft.map((d) => (d.id === edu.id ? { ...d, visible: !d.visible } : d))
                    )
                  }
                  className="rounded-lg border border-white/10 px-2.5 py-1 inline-flex items-center gap-1"
                >
                  {edu.visible ? <Eye className="h-3.5 w-3.5 text-emerald-400" /> : <EyeOff className="h-3.5 w-3.5 text-zinc-500" />}
                  {edu.visible ? 'Visible' : 'Hidden'}
                </button>
                <button
                  type="button"
                  onClick={() => setDraft(draft.filter((d) => d.id !== edu.id))}
                  className="rounded-lg border border-rose-500/30 p-1.5 text-rose-300 hover:bg-rose-500/20"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <input
                value={edu.degree}
                onChange={(e) =>
                  setDraft(draft.map((d) => (d.id === edu.id ? { ...d, degree: e.target.value } : d)))
                }
                placeholder="Degree / Class"
                className="rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
              />
              <input
                value={edu.institution}
                onChange={(e) =>
                  setDraft(
                    draft.map((d) => (d.id === edu.id ? { ...d, institution: e.target.value } : d))
                  )
                }
                placeholder="Institution"
                className="rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
              />
              <input
                value={edu.period}
                onChange={(e) =>
                  setDraft(draft.map((d) => (d.id === edu.id ? { ...d, period: e.target.value } : d)))
                }
                placeholder="Period (e.g. 2024–2028)"
                className="rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
              />
              <input
                value={edu.scoreLabel}
                onChange={(e) =>
                  setDraft(
                    draft.map((d) => (d.id === edu.id ? { ...d, scoreLabel: e.target.value } : d))
                  )
                }
                placeholder="CGPA / Percentage"
                className="rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
              />
              <input
                value={edu.semesterOrLevel}
                onChange={(e) =>
                  setDraft(
                    draft.map((d) =>
                      d.id === edu.id ? { ...d, semesterOrLevel: e.target.value } : d
                    )
                  )
                }
                placeholder="Semester / Level"
                className="rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
              />
              <input
                value={edu.registerNumber || ''}
                onChange={(e) =>
                  setDraft(
                    draft.map((d) =>
                      d.id === edu.id ? { ...d, registerNumber: e.target.value } : d
                    )
                  )
                }
                placeholder="Register Number (optional)"
                className="rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
              />
            </div>

            <textarea
              rows={2}
              value={edu.details}
              onChange={(e) =>
                setDraft(draft.map((d) => (d.id === edu.id ? { ...d, details: e.target.value } : d)))
              }
              placeholder="Details..."
              className="w-full rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const SkillsEditor: React.FC<{
  categories: SkillCategory[];
  onSave: (next: SkillCategory[]) => Promise<void>;
  notify: (m: string, err?: boolean) => void;
}> = ({ categories, onSave, notify }) => {
  const [draft, setDraft] = useState<SkillCategory[]>(() =>
    [...categories].sort((a, b) => a.order - b.order)
  );
  const [newSkillText, setNewSkillText] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const addCategory = () => {
    setDraft([
      ...draft,
      {
        id: `cat-${Date.now()}`,
        name: 'NEW CATEGORY',
        accent: 'purple',
        description: 'Custom technical cluster',
        skills: [],
        visible: true,
        order: draft.length,
      },
    ]);
  };

  return (
    <div>
      <SectionHeader
        title="Skill Universe"
        subtitle="Add, edit, delete, reorder, and categorize skills and categories."
        onAdd={addCategory}
        addLabel="Add Category"
        saving={saving}
        onCancel={() => {
          setDraft([...categories].sort((a, b) => a.order - b.order));
          notify('Reverted Skills edits.');
        }}
        onSave={async () => {
          setSaving(true);
          try {
            await onSave(draft);
          } catch (e) {
            notify(e instanceof Error ? e.message : 'Save failed', true);
          } finally {
            setSaving(false);
          }
        }}
      />

      <div className="space-y-4">
        {draft.map((cat, cIdx) => (
          <div key={cat.id} className="rounded-2xl border border-white/10 bg-black/40 p-4 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <div className="flex flex-wrap items-center gap-2 flex-1">
                <input
                  value={cat.name}
                  onChange={(e) =>
                    setDraft(
                      draft.map((c) => (c.id === cat.id ? { ...c, name: e.target.value } : c))
                    )
                  }
                  className="rounded-lg border border-white/15 bg-black/60 px-3 py-1.5 font-tech text-xs font-semibold text-white"
                />
                <select
                  value={cat.accent}
                  onChange={(e) =>
                    setDraft(
                      draft.map((c) =>
                        c.id === cat.id
                          ? { ...c, accent: e.target.value as SkillCategory['accent'] }
                          : c
                      )
                    )
                  }
                  className="rounded-lg border border-white/15 bg-black/60 px-2.5 py-1.5 text-xs text-zinc-200"
                >
                  <option value="crimson">Crimson</option>
                  <option value="purple">Purple</option>
                  <option value="blue">Blue</option>
                  <option value="emerald">Emerald</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setDraft(reorderList(draft, cIdx, -1))}
                  className="rounded-lg border border-white/10 p-1.5"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDraft(reorderList(draft, cIdx, 1))}
                  className="rounded-lg border border-white/10 p-1.5"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDraft(
                      draft.map((c) => (c.id === cat.id ? { ...c, visible: !c.visible } : c))
                    )
                  }
                  className="rounded-lg border border-white/10 px-2 py-1"
                >
                  {cat.visible ? 'Visible' : 'Hidden'}
                </button>
                <button
                  type="button"
                  onClick={() => setDraft(draft.filter((c) => c.id !== cat.id))}
                  className="rounded-lg border border-rose-500/30 p-1.5 text-rose-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Individual Skills */}
            <div className="space-y-2">
              {[...cat.skills]
                .sort((a, b) => a.order - b.order)
                .map((sk, sIdx) => (
                  <div key={sk.id} className="flex flex-wrap items-center gap-2">
                    <input
                      value={sk.name}
                      onChange={(e) =>
                        setDraft(
                          draft.map((c) =>
                            c.id === cat.id
                              ? {
                                  ...c,
                                  skills: c.skills.map((s) =>
                                    s.id === sk.id ? { ...s, name: e.target.value } : s
                                  ),
                                }
                              : c
                          )
                        )
                      }
                      className="flex-1 min-w-[160px] rounded-lg border border-white/12 bg-black/50 px-2.5 py-1.5 text-white"
                    />
                    <input
                      value={sk.level}
                      onChange={(e) =>
                        setDraft(
                          draft.map((c) =>
                            c.id === cat.id
                              ? {
                                  ...c,
                                  skills: c.skills.map((s) =>
                                    s.id === sk.id ? { ...s, level: e.target.value } : s
                                  ),
                                }
                              : c
                          )
                        )
                      }
                      placeholder="Level"
                      className="w-28 rounded-lg border border-white/12 bg-black/50 px-2.5 py-1.5 text-zinc-300"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setDraft(
                          draft.map((c) =>
                            c.id === cat.id
                              ? { ...c, skills: reorderList(c.skills, sIdx, -1) }
                              : c
                          )
                        )
                      }
                      className="rounded border border-white/10 p-1"
                    >
                      <ArrowUp className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft(
                          draft.map((c) =>
                            c.id === cat.id
                              ? { ...c, skills: reorderList(c.skills, sIdx, 1) }
                              : c
                          )
                        )
                      }
                      className="rounded border border-white/10 p-1"
                    >
                      <ArrowDown className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft(
                          draft.map((c) =>
                            c.id === cat.id
                              ? {
                                  ...c,
                                  skills: c.skills.map((s) =>
                                    s.id === sk.id ? { ...s, visible: !s.visible } : s
                                  ),
                                }
                              : c
                          )
                        )
                      }
                      className="rounded border border-white/10 px-2 py-1 text-[10px]"
                    >
                      {sk.visible ? 'Show' : 'Hide'}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft(
                          draft.map((c) =>
                            c.id === cat.id
                              ? { ...c, skills: c.skills.filter((s) => s.id !== sk.id) }
                              : c
                          )
                        )
                      }
                      className="rounded border border-rose-500/30 p-1 text-rose-300"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
            </div>

            <div className="mt-3 flex gap-2">
              <input
                value={newSkillText[cat.id] || ''}
                onChange={(e) => setNewSkillText({ ...newSkillText, [cat.id]: e.target.value })}
                placeholder="Add new skill to this category..."
                className="flex-1 rounded-lg border border-white/12 bg-black/50 px-3 py-1.5 text-white"
              />
              <button
                type="button"
                onClick={() => {
                  const val = (newSkillText[cat.id] || '').trim();
                  if (!val) return;
                  setDraft(
                    draft.map((c) =>
                      c.id === cat.id
                        ? {
                            ...c,
                            skills: [
                              ...c.skills,
                              {
                                id: `sk-${Date.now()}`,
                                name: val,
                                level: 'Proficient',
                                visible: true,
                                order: c.skills.length,
                              },
                            ],
                          }
                        : c
                    )
                  );
                  setNewSkillText({ ...newSkillText, [cat.id]: '' });
                }}
                className="rounded-lg border border-sky-400/40 bg-sky-500/15 px-3 py-1.5 text-sky-200"
              >
                + Add Skill
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ProjectsEditor: React.FC<{
  projects: ProjectItem[];
  media: PortfolioData['media'];
  onSave: (next: ProjectItem[]) => Promise<void>;
  onPortfolioSynced: (next: PortfolioData) => void;
  notify: (m: string, err?: boolean) => void;
}> = ({ projects, media, onSave, onPortfolioSynced, notify }) => {
  const [draft, setDraft] = useState<ProjectItem[]>(() =>
    [...projects].sort((a, b) => a.order - b.order)
  );
  const [saving, setSaving] = useState(false);

  const addProject = () => {
    const num = String(draft.length + 1).padStart(2, '0');
    setDraft([
      ...draft,
      {
        id: `proj-${Date.now()}`,
        code: `PROJECT ${num}`,
        title: 'New Engineering Project',
        category: 'Embedded Systems / IoT',
        description: '',
        problem: '',
        solution: '',
        contribution: '',
        technologies: [],
        hardware: [],
        software: [],
        status: 'Completed',
        images: [],
        videos: [],
        githubUrl: '',
        liveDemoUrl: '',
        featured: false,
        visible: true,
        order: draft.length,
      },
    ]);
  };

  const handleUploadProjectAsset = async (
    projId: string,
    file: File,
    kind: 'image' | 'video'
  ) => {
    try {
      const res = await uploadMediaFile(
        file,
        kind === 'video' ? 'project-video' : 'project-image',
        file.name
      );
      onPortfolioSynced(res.portfolio);
      setDraft((prev) =>
        prev.map((p) => {
          if (p.id !== projId) return p;
          return kind === 'video'
            ? { ...p, videos: [...p.videos, res.item.url] }
            : { ...p, images: [...p.images, res.item.url] };
        })
      );
      notify(`Uploaded ${kind} for project. Click Save Changes to publish.`);
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Upload failed', true);
    }
  };

  return (
    <div>
      <SectionHeader
        title="Projects Showcase"
        subtitle="Manage project details, problem/solution, hardware/software, images, videos & featured toggles."
        onAdd={addProject}
        addLabel="Add Project"
        saving={saving}
        onCancel={() => {
          setDraft([...projects].sort((a, b) => a.order - b.order));
          notify('Reverted Project edits.');
        }}
        onSave={async () => {
          setSaving(true);
          try {
            await onSave(draft);
          } catch (e) {
            notify(e instanceof Error ? e.message : 'Save failed', true);
          } finally {
            setSaving(false);
          }
        }}
      />

      <div className="space-y-5">
        {draft.map((proj, idx) => (
          <div
            key={proj.id}
            className="rounded-2xl border border-white/10 bg-black/40 p-5 space-y-3 text-xs"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-tech text-rose-300">
                {proj.code} — {proj.title}
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setDraft(
                      draft.map((p) => (p.id === proj.id ? { ...p, featured: !p.featured } : p))
                    )
                  }
                  className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 ${
                    proj.featured
                      ? 'border-amber-400/50 bg-amber-500/20 text-amber-200'
                      : 'border-white/10 text-zinc-400'
                  }`}
                >
                  <Star className="h-3 w-3" /> Featured
                </button>
                <button
                  type="button"
                  onClick={() => setDraft(reorderList(draft, idx, -1))}
                  className="rounded-lg border border-white/10 p-1.5"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDraft(reorderList(draft, idx, 1))}
                  className="rounded-lg border border-white/10 p-1.5"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDraft(
                      draft.map((p) => (p.id === proj.id ? { ...p, visible: !p.visible } : p))
                    )
                  }
                  className="rounded-lg border border-white/10 px-2.5 py-1"
                >
                  {proj.visible ? 'Visible' : 'Hidden'}
                </button>
                <button
                  type="button"
                  onClick={() => setDraft(draft.filter((p) => p.id !== proj.id))}
                  className="rounded-lg border border-rose-500/30 p-1.5 text-rose-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <input
                value={proj.code}
                onChange={(e) =>
                  setDraft(draft.map((p) => (p.id === proj.id ? { ...p, code: e.target.value } : p)))
                }
                placeholder="Code (PROJECT 01)"
                className="rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
              />
              <input
                value={proj.title}
                onChange={(e) =>
                  setDraft(draft.map((p) => (p.id === proj.id ? { ...p, title: e.target.value } : p)))
                }
                placeholder="Project Title"
                className="sm:col-span-2 rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
              />
              <input
                value={proj.category}
                onChange={(e) =>
                  setDraft(
                    draft.map((p) => (p.id === proj.id ? { ...p, category: e.target.value } : p))
                  )
                }
                placeholder="Category"
                className="rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
              />
              <select
                value={proj.status}
                onChange={(e) =>
                  setDraft(
                    draft.map((p) =>
                      p.id === proj.id
                        ? { ...p, status: e.target.value as ProjectItem['status'] }
                        : p
                    )
                  )
                }
                className="rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
              >
                <option value="Completed">Completed</option>
                <option value="Prototype Ready">Prototype Ready</option>
                <option value="In Progress">In Progress</option>
                <option value="Research">Research</option>
              </select>
              <input
                value={proj.githubUrl}
                onChange={(e) =>
                  setDraft(
                    draft.map((p) => (p.id === proj.id ? { ...p, githubUrl: e.target.value } : p))
                  )
                }
                placeholder="GitHub URL"
                className="rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
              />
              <input
                value={proj.liveDemoUrl}
                onChange={(e) =>
                  setDraft(
                    draft.map((p) => (p.id === proj.id ? { ...p, liveDemoUrl: e.target.value } : p))
                  )
                }
                placeholder="Live Demo URL (optional)"
                className="sm:col-span-3 rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
              />
            </div>

            <textarea
              rows={2}
              value={proj.description}
              onChange={(e) =>
                setDraft(
                  draft.map((p) => (p.id === proj.id ? { ...p, description: e.target.value } : p))
                )
              }
              placeholder="Overview Description"
              className="w-full rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
            />
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <textarea
                rows={2}
                value={proj.problem}
                onChange={(e) =>
                  setDraft(
                    draft.map((p) => (p.id === proj.id ? { ...p, problem: e.target.value } : p))
                  )
                }
                placeholder="Problem"
                className="rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
              />
              <textarea
                rows={2}
                value={proj.solution}
                onChange={(e) =>
                  setDraft(
                    draft.map((p) => (p.id === proj.id ? { ...p, solution: e.target.value } : p))
                  )
                }
                placeholder="Solution"
                className="rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
              />
              <textarea
                rows={2}
                value={proj.contribution}
                onChange={(e) =>
                  setDraft(
                    draft.map((p) =>
                      p.id === proj.id ? { ...p, contribution: e.target.value } : p
                    )
                  )
                }
                placeholder="My Contribution"
                className="rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <input
                value={proj.technologies.join(', ')}
                onChange={(e) =>
                  setDraft(
                    draft.map((p) =>
                      p.id === proj.id
                        ? {
                            ...p,
                            technologies: e.target.value
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean),
                          }
                        : p
                    )
                  )
                }
                placeholder="Technologies (comma-separated)"
                className="rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
              />
              <input
                value={proj.hardware.join(', ')}
                onChange={(e) =>
                  setDraft(
                    draft.map((p) =>
                      p.id === proj.id
                        ? {
                            ...p,
                            hardware: e.target.value
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean),
                          }
                        : p
                    )
                  )
                }
                placeholder="Hardware (comma-separated)"
                className="rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
              />
              <input
                value={proj.software.join(', ')}
                onChange={(e) =>
                  setDraft(
                    draft.map((p) =>
                      p.id === proj.id
                        ? {
                            ...p,
                            software: e.target.value
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean),
                          }
                        : p
                    )
                  )
                }
                placeholder="Software (comma-separated)"
                className="rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
              />
            </div>

            {/* Project Media Upload & Management */}
            <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-sky-400/35 bg-sky-500/15 px-3 py-1.5 text-sky-200">
                <Upload className="h-3.5 w-3.5" /> Upload Image
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.svg"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleUploadProjectAsset(proj.id, f, 'image');
                    e.target.value = '';
                  }}
                />
              </label>
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-violet-400/35 bg-violet-500/15 px-3 py-1.5 text-violet-200">
                <Upload className="h-3.5 w-3.5" /> Upload Video
                <input
                  type="file"
                  accept=".mp4,.webm,.mov"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleUploadProjectAsset(proj.id, f, 'video');
                    e.target.value = '';
                  }}
                />
              </label>

              {media.filter((m) => m.fileType === 'image').length > 0 && (
                <select
                  value=""
                  onChange={(e) => {
                    if (!e.target.value) return;
                    setDraft(
                      draft.map((p) =>
                        p.id === proj.id ? { ...p, images: [e.target.value, ...p.images] } : p
                      )
                    );
                  }}
                  className="rounded-lg border border-white/15 bg-black/60 px-2.5 py-1.5 text-zinc-200"
                >
                  <option value="">Attach Image from Library...</option>
                  {media
                    .filter((m) => m.fileType === 'image')
                    .map((m) => (
                      <option key={m.id} value={m.url}>
                        {m.originalName}
                      </option>
                    ))}
                </select>
              )}

              <span className="ml-auto font-tech text-[10px] text-zinc-400">
                {proj.images.length} img • {proj.videos.length} vid
              </span>
            </div>

            {proj.images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {proj.images.map((imgUrl, i) => (
                  <div
                    key={imgUrl + i}
                    className="relative h-14 w-20 overflow-hidden rounded-lg border border-white/15"
                  >
                    <img src={imgUrl} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() =>
                        setDraft(
                          draft.map((p) =>
                            p.id === proj.id
                              ? { ...p, images: p.images.filter((_, idx2) => idx2 !== i) }
                              : p
                          )
                        )
                      }
                      className="absolute right-0.5 top-0.5 rounded bg-black/80 px-1 text-[10px] text-rose-300"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const InternshipsEditor: React.FC<{
  internships: InternshipItem[];
  media: PortfolioData['media'];
  onSave: (next: InternshipItem[]) => Promise<void>;
  onPortfolioSynced: (next: PortfolioData) => void;
  notify: (m: string, err?: boolean) => void;
}> = ({ internships, media, onSave, onPortfolioSynced, notify }) => {
  const [draft, setDraft] = useState<InternshipItem[]>(() =>
    [...internships].sort((a, b) => a.order - b.order)
  );
  const [saving, setSaving] = useState(false);

  const addItem = () => {
    setDraft([
      ...draft,
      {
        id: `int-${Date.now()}`,
        organization: 'New Organization',
        role: 'Intern — Embedded Systems',
        duration: '2026',
        division: '',
        certificateNo: '',
        standard: '',
        certifiedDate: '',
        focus: '',
        outcomes: [],
        certificateFileUrl: '',
        certificateFileType: 'other',
        visible: true,
        order: draft.length,
      },
    ]);
  };

  const handleCertUpload = async (internshipId: string, file: File) => {
    try {
      const res = await uploadMediaFile(file, 'certificate', `${file.name} internship certificate`);
      onPortfolioSynced(res.portfolio);
      const nextDraft = draft.map((i) =>
        i.id === internshipId
          ? {
              ...i,
              certificateFileUrl: res.item.url,
              certificateFileType:
                res.item.fileType === 'pdf'
                  ? ('pdf' as const)
                  : res.item.fileType === 'image'
                    ? ('image' as const)
                    : ('other' as const),
            }
          : i
      );
      setDraft(nextDraft);
      await onSave(nextDraft);
      notify('Internship certificate uploaded and saved!');
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Upload failed', true);
    }
  };

  return (
    <div>
      <SectionHeader
        title="Internships Timeline"
        subtitle="Add, edit, delete, reorder, or hide any internship or industrial training."
        onAdd={addItem}
        addLabel="Add Internship"
        saving={saving}
        onCancel={() => {
          setDraft([...internships].sort((a, b) => a.order - b.order));
          notify('Reverted Internships edits.');
        }}
        onSave={async () => {
          setSaving(true);
          try {
            await onSave(draft);
          } catch (e) {
            notify(e instanceof Error ? e.message : 'Save failed', true);
          } finally {
            setSaving(false);
          }
        }}
      />

      <div className="space-y-4">
        {draft.map((item, idx) => (
          <div key={item.id} className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-3 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-tech text-rose-300">
                #{idx + 1} • {item.organization}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setDraft(reorderList(draft, idx, -1))}
                  className="rounded-lg border border-white/10 p-1.5"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDraft(reorderList(draft, idx, 1))}
                  className="rounded-lg border border-white/10 p-1.5"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDraft(
                      draft.map((i) => (i.id === item.id ? { ...i, visible: !i.visible } : i))
                    )
                  }
                  className="rounded-lg border border-white/10 px-2.5 py-1"
                >
                  {item.visible ? 'Visible' : 'Hidden'}
                </button>
                <button
                  type="button"
                  onClick={() => setDraft(draft.filter((i) => i.id !== item.id))}
                  className="rounded-lg border border-rose-500/30 p-1.5 text-rose-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <input
                value={item.organization}
                onChange={(e) =>
                  setDraft(
                    draft.map((i) => (i.id === item.id ? { ...i, organization: e.target.value } : i))
                  )
                }
                placeholder="Organization"
                className="rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
              />
              <input
                value={item.role}
                onChange={(e) =>
                  setDraft(draft.map((i) => (i.id === item.id ? { ...i, role: e.target.value } : i)))
                }
                placeholder="Role"
                className="rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
              />
              <input
                value={item.duration}
                onChange={(e) =>
                  setDraft(
                    draft.map((i) => (i.id === item.id ? { ...i, duration: e.target.value } : i))
                  )
                }
                placeholder="Duration"
                className="rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
              />
              <input
                value={item.division || ''}
                onChange={(e) =>
                  setDraft(
                    draft.map((i) => (i.id === item.id ? { ...i, division: e.target.value } : i))
                  )
                }
                placeholder="Division (optional)"
                className="rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
              />
              <input
                value={item.certificateNo || ''}
                onChange={(e) =>
                  setDraft(
                    draft.map((i) =>
                      i.id === item.id ? { ...i, certificateNo: e.target.value } : i
                    )
                  )
                }
                placeholder="Certificate No (optional)"
                className="rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
              />
              <input
                value={item.standard || ''}
                onChange={(e) =>
                  setDraft(
                    draft.map((i) => (i.id === item.id ? { ...i, standard: e.target.value } : i))
                  )
                }
                placeholder="Standard e.g. ISO 9001:2015"
                className="rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
              />
            </div>

            <textarea
              rows={2}
              value={item.focus}
              onChange={(e) =>
                setDraft(draft.map((i) => (i.id === item.id ? { ...i, focus: e.target.value } : i)))
              }
              placeholder="Technical Focus"
              className="w-full rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
            />

            <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-500/15 px-3 py-1.5 text-rose-200 hover:bg-rose-500/25">
                <Upload className="h-3.5 w-3.5" /> Upload Internship Certificate (JPG/PNG/PDF)
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,.webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleCertUpload(item.id, f);
                    e.target.value = '';
                  }}
                />
              </label>

              {media.filter((m) => m.fileType === 'image' || m.fileType === 'pdf').length > 0 && (
                <select
                  value=""
                  onChange={(e) => {
                    const selected = media.find((m) => m.url === e.target.value);
                    if (!selected) return;
                    setDraft(
                      draft.map((i) =>
                        i.id === item.id
                          ? {
                              ...i,
                              certificateFileUrl: selected.url,
                              certificateFileType:
                                selected.fileType === 'pdf'
                                  ? 'pdf'
                                  : selected.fileType === 'image'
                                    ? 'image'
                                    : 'other',
                            }
                          : i
                      )
                    );
                  }}
                  className="rounded-lg border border-white/15 bg-black/60 px-2.5 py-1.5 text-zinc-200"
                >
                  <option value="">Attach from Media Library...</option>
                  {media
                    .filter((m) => m.fileType === 'image' || m.fileType === 'pdf')
                    .map((m) => (
                      <option key={m.id} value={m.url}>
                        {m.originalName}
                      </option>
                    ))}
                </select>
              )}

              {item.certificateFileUrl ? (
                <div className="ml-auto flex items-center gap-2">
                  <a
                    href={item.certificateFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-tech text-[10px] text-emerald-300 underline"
                  >
                    Certificate Attached ({(item.certificateFileType || 'file').toUpperCase()})
                  </a>
                  <button
                    type="button"
                    onClick={() =>
                      setDraft(
                        draft.map((i) =>
                          i.id === item.id
                            ? { ...i, certificateFileUrl: '', certificateFileType: 'other' }
                            : i
                        )
                      )
                    }
                    className="rounded border border-rose-500/30 px-2 py-0.5 text-[10px] text-rose-300"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <span className="ml-auto font-tech text-[10px] text-zinc-500">
                  No certificate uploaded
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const CertificationsEditor: React.FC<{
  certifications: CertificateItem[];
  media: PortfolioData['media'];
  onSave: (next: CertificateItem[]) => Promise<void>;
  onPortfolioSynced: (next: PortfolioData) => void;
  notify: (m: string, err?: boolean) => void;
}> = ({ certifications, media, onSave, onPortfolioSynced, notify }) => {
  const [draft, setDraft] = useState<CertificateItem[]>(() =>
    [...certifications].sort((a, b) => a.order - b.order)
  );
  const [saving, setSaving] = useState(false);

  const addCertificate = () => {
    setDraft([
      {
        id: `cert-${Date.now()}`,
        name: 'New Certificate',
        organization: 'Issuing Organization',
        issueDate: new Date().toLocaleDateString('en-GB'),
        certificateId: '',
        category: 'Embedded Systems',
        description: '',
        verificationUrl: '',
        fileUrl: '',
        fileType: 'other',
        thumbnailUrl: '',
        featured: false,
        visible: true,
        order: draft.length,
      },
      ...draft.map((c, idx) => ({ ...c, order: idx + 1 })),
    ]);
  };

  const handleCertFileUpload = async (
    certId: string,
    file: File,
    slot: 'file' | 'thumbnail'
  ) => {
    try {
      const res = await uploadMediaFile(
        file,
        slot === 'thumbnail' ? 'certificate-thumb' : 'certificate',
        file.name
      );
      onPortfolioSynced(res.portfolio);
      setDraft((prev) =>
        prev.map((c) => {
          if (c.id !== certId) return c;
          if (slot === 'thumbnail') return { ...c, thumbnailUrl: res.item.url };
          return {
            ...c,
            fileUrl: res.item.url,
            fileType: res.item.fileType === 'pdf' ? 'pdf' : res.item.fileType === 'image' ? 'image' : 'other',
            thumbnailUrl: res.item.fileType === 'image' && !c.thumbnailUrl ? res.item.url : c.thumbnailUrl,
          };
        })
      );
      notify('Certificate file uploaded! Click Save Changes to publish.');
    } catch (e) {
      notify(e instanceof Error ? e.message : 'Certificate upload failed', true);
    }
  };

  return (
    <div>
      <SectionHeader
        title="Certifications Gallery"
        subtitle="Upload JPG, JPEG, PNG, or PDF certificates, set thumbnails, verification URLs & publish."
        onAdd={addCertificate}
        addLabel="Add Certificate"
        saving={saving}
        onCancel={() => {
          setDraft([...certifications].sort((a, b) => a.order - b.order));
          notify('Reverted Certifications edits.');
        }}
        onSave={async () => {
          setSaving(true);
          try {
            await onSave(draft);
          } catch (e) {
            notify(e instanceof Error ? e.message : 'Save failed', true);
          } finally {
            setSaving(false);
          }
        }}
      />

      <div className="space-y-4">
        {draft.map((cert, idx) => (
          <div key={cert.id} className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-3 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-tech text-rose-300">
                #{idx + 1} • {cert.name}
              </span>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    setDraft(
                      draft.map((c) => (c.id === cert.id ? { ...c, featured: !c.featured } : c))
                    )
                  }
                  className={`rounded-lg border px-2.5 py-1 ${
                    cert.featured
                      ? 'border-amber-400/50 bg-amber-500/20 text-amber-200'
                      : 'border-white/10 text-zinc-400'
                  }`}
                >
                  Featured
                </button>
                <button
                  type="button"
                  onClick={() => setDraft(reorderList(draft, idx, -1))}
                  className="rounded-lg border border-white/10 p-1.5"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDraft(reorderList(draft, idx, 1))}
                  className="rounded-lg border border-white/10 p-1.5"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDraft(
                      draft.map((c) => (c.id === cert.id ? { ...c, visible: !c.visible } : c))
                    )
                  }
                  className="rounded-lg border border-white/10 px-2.5 py-1"
                >
                  {cert.visible ? 'Visible' : 'Hidden'}
                </button>
                <button
                  type="button"
                  onClick={() => setDraft(draft.filter((c) => c.id !== cert.id))}
                  className="rounded-lg border border-rose-500/30 p-1.5 text-rose-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <input
                value={cert.name}
                onChange={(e) =>
                  setDraft(draft.map((c) => (c.id === cert.id ? { ...c, name: e.target.value } : c)))
                }
                placeholder="Certificate Name"
                className="rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
              />
              <input
                value={cert.organization}
                onChange={(e) =>
                  setDraft(
                    draft.map((c) =>
                      c.id === cert.id ? { ...c, organization: e.target.value } : c
                    )
                  )
                }
                placeholder="Organization"
                className="rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
              />
              <input
                value={cert.issueDate}
                onChange={(e) =>
                  setDraft(
                    draft.map((c) => (c.id === cert.id ? { ...c, issueDate: e.target.value } : c))
                  )
                }
                placeholder="Issue Date"
                className="rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
              />
              <input
                value={cert.certificateId}
                onChange={(e) =>
                  setDraft(
                    draft.map((c) =>
                      c.id === cert.id ? { ...c, certificateId: e.target.value } : c
                    )
                  )
                }
                placeholder="Certificate ID"
                className="rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
              />
              <input
                value={cert.category}
                onChange={(e) =>
                  setDraft(
                    draft.map((c) => (c.id === cert.id ? { ...c, category: e.target.value } : c))
                  )
                }
                placeholder="Category"
                className="rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
              />
              <input
                value={cert.verificationUrl}
                onChange={(e) =>
                  setDraft(
                    draft.map((c) =>
                      c.id === cert.id ? { ...c, verificationUrl: e.target.value } : c
                    )
                  )
                }
                placeholder="Verification URL"
                className="rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
              />
            </div>

            <textarea
              rows={2}
              value={cert.description}
              onChange={(e) =>
                setDraft(
                  draft.map((c) => (c.id === cert.id ? { ...c, description: e.target.value } : c))
                )
              }
              placeholder="Certificate Description"
              className="w-full rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
            />

            <div className="flex flex-wrap items-center gap-2 border-t border-white/10 pt-3">
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-500/15 px-3 py-1.5 text-rose-200">
                <Upload className="h-3.5 w-3.5" /> Upload Certificate (JPG/PNG/PDF)
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,.webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleCertFileUpload(cert.id, f, 'file');
                    e.target.value = '';
                  }}
                />
              </label>

              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-sky-400/40 bg-sky-500/15 px-3 py-1.5 text-sky-200">
                <Upload className="h-3.5 w-3.5" /> Upload Thumbnail
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void handleCertFileUpload(cert.id, f, 'thumbnail');
                    e.target.value = '';
                  }}
                />
              </label>

              {media.length > 0 && (
                <select
                  value=""
                  onChange={(e) => {
                    const selected = media.find((m) => m.url === e.target.value);
                    if (!selected) return;
                    setDraft(
                      draft.map((c) =>
                        c.id === cert.id
                          ? {
                              ...c,
                              fileUrl: selected.url,
                              fileType:
                                selected.fileType === 'pdf'
                                  ? 'pdf'
                                  : selected.fileType === 'image'
                                    ? 'image'
                                    : 'other',
                            }
                          : c
                      )
                    );
                  }}
                  className="rounded-lg border border-white/15 bg-black/60 px-2.5 py-1.5 text-zinc-200"
                >
                  <option value="">Attach from Media Library...</option>
                  {media.map((m) => (
                    <option key={m.id} value={m.url}>
                      {m.originalName}
                    </option>
                  ))}
                </select>
              )}

              <span className="ml-auto font-tech text-[10px] text-zinc-400">
                {cert.fileUrl ? `File: ${cert.fileType.toUpperCase()}` : 'No file attached'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const WORKSHOP_CATS: ActivityCategory[] = ['Workshops', 'Training'];
const ACHIEVEMENT_CATS: ActivityCategory[] = [
  'Achievements',
  'Hackathons',
  'Awards',
  'Industry Events',
  'Other Activities',
];

const ActivitiesEditor: React.FC<{
  mode: 'workshops' | 'achievements';
  activities: ActivityItem[];
  media: PortfolioData['media'];
  onSave: (next: ActivityItem[]) => Promise<void>;
  notify: (m: string, err?: boolean) => void;
}> = ({ mode, activities, media, onSave, notify }) => {
  const [draft, setDraft] = useState<ActivityItem[]>(() =>
    [...activities].sort((a, b) => a.order - b.order)
  );
  const [saving, setSaving] = useState(false);

  const allowedCats = mode === 'workshops' ? WORKSHOP_CATS : ACHIEVEMENT_CATS;
  const filteredIndices = draft
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => allowedCats.includes(item.category));

  const addItem = () => {
    setDraft([
      ...draft,
      {
        id: `act-${Date.now()}`,
        title: mode === 'workshops' ? 'New Workshop / Training' : 'New Achievement / Hackathon',
        category: allowedCats[0],
        organization: 'Organizer / Institution',
        date: '2026',
        description: '',
        badgeText: mode === 'workshops' ? 'Hands-On' : 'Finalist',
        imageUrl: '',
        linkUrl: '',
        featured: false,
        visible: true,
        order: draft.length,
      },
    ]);
  };

  return (
    <div>
      <SectionHeader
        title={mode === 'workshops' ? 'Workshops & Training' : 'Achievements, Hackathons & Events'}
        subtitle={
          mode === 'workshops'
            ? 'Manage technical workshops and training programs.'
            : 'Manage hackathons, awards, industry events, achievements, and activities.'
        }
        onAdd={addItem}
        addLabel={mode === 'workshops' ? 'Add Workshop' : 'Add Achievement'}
        saving={saving}
        onCancel={() => {
          setDraft([...activities].sort((a, b) => a.order - b.order));
          notify('Reverted changes.');
        }}
        onSave={async () => {
          setSaving(true);
          try {
            await onSave(draft);
          } catch (e) {
            notify(e instanceof Error ? e.message : 'Save failed', true);
          } finally {
            setSaving(false);
          }
        }}
      />

      <div className="space-y-4">
        {filteredIndices.map(({ item, index }) => (
          <div key={item.id} className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-3 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-tech text-rose-300">{item.title}</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setDraft(reorderList(draft, index, -1))}
                  className="rounded-lg border border-white/10 p-1.5"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDraft(reorderList(draft, index, 1))}
                  className="rounded-lg border border-white/10 p-1.5"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDraft(
                      draft.map((a) => (a.id === item.id ? { ...a, visible: !a.visible } : a))
                    )
                  }
                  className="rounded-lg border border-white/10 px-2.5 py-1"
                >
                  {item.visible ? 'Visible' : 'Hidden'}
                </button>
                <button
                  type="button"
                  onClick={() => setDraft(draft.filter((a) => a.id !== item.id))}
                  className="rounded-lg border border-rose-500/30 p-1.5 text-rose-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <input
                value={item.title}
                onChange={(e) =>
                  setDraft(
                    draft.map((a) => (a.id === item.id ? { ...a, title: e.target.value } : a))
                  )
                }
                placeholder="Title"
                className="sm:col-span-2 rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
              />
              <select
                value={item.category}
                onChange={(e) =>
                  setDraft(
                    draft.map((a) =>
                      a.id === item.id
                        ? { ...a, category: e.target.value as ActivityCategory }
                        : a
                    )
                  )
                }
                className="rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
              >
                {allowedCats.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <input
                value={item.organization}
                onChange={(e) =>
                  setDraft(
                    draft.map((a) =>
                      a.id === item.id ? { ...a, organization: e.target.value } : a
                    )
                  )
                }
                placeholder="Organization"
                className="rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
              />
              <input
                value={item.date}
                onChange={(e) =>
                  setDraft(draft.map((a) => (a.id === item.id ? { ...a, date: e.target.value } : a)))
                }
                placeholder="Date"
                className="rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
              />
              <input
                value={item.badgeText || ''}
                onChange={(e) =>
                  setDraft(
                    draft.map((a) => (a.id === item.id ? { ...a, badgeText: e.target.value } : a))
                  )
                }
                placeholder="Badge text (e.g. National Finalist)"
                className="rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
              />
            </div>

            <textarea
              rows={2}
              value={item.description}
              onChange={(e) =>
                setDraft(
                  draft.map((a) => (a.id === item.id ? { ...a, description: e.target.value } : a))
                )
              }
              placeholder="Description"
              className="w-full rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
            />

            {media.filter((m) => m.fileType === 'image').length > 0 && (
              <select
                value={item.imageUrl || ''}
                onChange={(e) =>
                  setDraft(
                    draft.map((a) => (a.id === item.id ? { ...a, imageUrl: e.target.value } : a))
                  )
                }
                className="rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-zinc-200"
              >
                <option value="">No Attached Image</option>
                {media
                  .filter((m) => m.fileType === 'image')
                  .map((m) => (
                    <option key={m.id} value={m.url}>
                      Image: {m.originalName}
                    </option>
                  ))}
              </select>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const ContactEditor: React.FC<{
  contact: ContactInfo;
  onSave: (next: ContactInfo) => Promise<void>;
  notify: (m: string, err?: boolean) => void;
}> = ({ contact, onSave, notify }) => {
  const [draft, setDraft] = useState<ContactInfo>(contact);
  const [saving, setSaving] = useState(false);

  return (
    <div>
      <SectionHeader
        title="Contact Details"
        subtitle="Update public email, phone, WhatsApp, location, and contact callout."
        saving={saving}
        onCancel={() => {
          setDraft(contact);
          notify('Reverted Contact edits.');
        }}
        onSave={async () => {
          setSaving(true);
          try {
            await onSave(draft);
          } catch (e) {
            notify(e instanceof Error ? e.message : 'Save failed', true);
          } finally {
            setSaving(false);
          }
        }}
      />

      <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
        {(
          [
            ['name', 'Display Name'],
            ['email', 'Email Address'],
            ['phone', 'Phone Number'],
            ['whatsapp', 'WhatsApp Number'],
            ['location', 'Location'],
            ['headline', 'Headline'],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block space-y-1">
            <span className="text-zinc-400">{label}</span>
            <input
              value={draft[key]}
              onChange={(e) => setDraft({ ...draft, [key]: e.target.value })}
              className="w-full rounded-xl border border-white/12 bg-black/50 px-3.5 py-2.5 text-sm text-white"
            />
          </label>
        ))}

        <label className="block space-y-1 sm:col-span-2">
          <span className="text-zinc-400">Contact Subtext</span>
          <textarea
            rows={3}
            value={draft.subtext}
            onChange={(e) => setDraft({ ...draft, subtext: e.target.value })}
            className="w-full rounded-xl border border-white/12 bg-black/50 px-3.5 py-2.5 text-sm text-white"
          />
        </label>
      </div>
    </div>
  );
};

const SocialLinksEditor: React.FC<{
  links: SocialLink[];
  onSave: (next: SocialLink[]) => Promise<void>;
  notify: (m: string, err?: boolean) => void;
}> = ({ links, onSave, notify }) => {
  const [draft, setDraft] = useState<SocialLink[]>(() =>
    [...links].sort((a, b) => a.order - b.order)
  );
  const [saving, setSaving] = useState(false);

  return (
    <div>
      <SectionHeader
        title="Social Links"
        subtitle="Manage LinkedIn, GitHub, and additional developer or portfolio profiles."
        onAdd={() =>
          setDraft([
            ...draft,
            {
              id: `soc-${Date.now()}`,
              platform: 'GitHub',
              label: 'New Link',
              url: 'https://',
              displayText: '',
              visible: true,
              order: draft.length,
            },
          ])
        }
        addLabel="Add Social Link"
        saving={saving}
        onCancel={() => {
          setDraft([...links].sort((a, b) => a.order - b.order));
          notify('Reverted Social Links edits.');
        }}
        onSave={async () => {
          setSaving(true);
          try {
            await onSave(draft);
          } catch (e) {
            notify(e instanceof Error ? e.message : 'Save failed', true);
          } finally {
            setSaving(false);
          }
        }}
      />

      <div className="space-y-3">
        {draft.map((soc, idx) => (
          <div key={soc.id} className="rounded-2xl border border-white/10 bg-black/40 p-4 text-xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-tech text-rose-300">{soc.platform}</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setDraft(reorderList(draft, idx, -1))}
                  className="rounded border border-white/10 p-1.5"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDraft(reorderList(draft, idx, 1))}
                  className="rounded border border-white/10 p-1.5"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDraft(
                      draft.map((s) => (s.id === soc.id ? { ...s, visible: !s.visible } : s))
                    )
                  }
                  className="rounded border border-white/10 px-2.5 py-1"
                >
                  {soc.visible ? 'Visible' : 'Hidden'}
                </button>
                <button
                  type="button"
                  onClick={() => setDraft(draft.filter((s) => s.id !== soc.id))}
                  className="rounded border border-rose-500/30 p-1.5 text-rose-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <input
                value={soc.platform}
                onChange={(e) =>
                  setDraft(
                    draft.map((s) => (s.id === soc.id ? { ...s, platform: e.target.value } : s))
                  )
                }
                placeholder="Platform (LinkedIn, GitHub...)"
                className="rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
              />
              <input
                value={soc.url}
                onChange={(e) =>
                  setDraft(draft.map((s) => (s.id === soc.id ? { ...s, url: e.target.value } : s)))
                }
                placeholder="Full URL"
                className="rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
              />
              <input
                value={soc.displayText}
                onChange={(e) =>
                  setDraft(
                    draft.map((s) => (s.id === soc.id ? { ...s, displayText: e.target.value } : s))
                  )
                }
                placeholder="Display text"
                className="rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const WebsiteSettingsEditor: React.FC<{
  portfolio: PortfolioData;
  onSaveSettings: (next: WebsiteSettings) => Promise<void>;
  onPortfolioChange: (next: PortfolioData) => void;
  notify: (m: string, err?: boolean) => void;
}> = ({ portfolio, onSaveSettings, onPortfolioChange, notify }) => {
  const [draft, setDraft] = useState<WebsiteSettings>(portfolio.settings);
  const [saving, setSaving] = useState(false);
  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');

  const sectionKeys: SectionKey[] = [
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

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await changeAdminPassword(curPw, newPw);
      setCurPw('');
      setNewPw('');
      notify('Admin password updated securely.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Password change failed', true);
    }
  };

  const handleExportBackup = () => {
    const blob = new Blob([JSON.stringify(portfolio, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dharshan-portfolio-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Website Settings & Security"
        subtitle="Configure SEO metadata, section visibility, cinema intensity, admin password & backups."
        saving={saving}
        onCancel={() => {
          setDraft(portfolio.settings);
          notify('Reverted Website Settings.');
        }}
        onSave={async () => {
          setSaving(true);
          try {
            await onSaveSettings(draft);
          } catch (e) {
            notify(e instanceof Error ? e.message : 'Save failed', true);
          } finally {
            setSaving(false);
          }
        }}
      />

      <div className="grid grid-cols-1 gap-4 text-xs sm:grid-cols-2">
        <label className="block space-y-1 sm:col-span-2">
          <span className="text-zinc-400">Browser Page Title</span>
          <input
            value={draft.siteTitle}
            onChange={(e) => setDraft({ ...draft, siteTitle: e.target.value })}
            className="w-full rounded-xl border border-white/12 bg-black/50 px-3.5 py-2.5 text-sm text-white"
          />
        </label>

        <label className="block space-y-1 sm:col-span-2">
          <span className="text-zinc-400">Meta Description</span>
          <textarea
            rows={2}
            value={draft.metaDescription}
            onChange={(e) => setDraft({ ...draft, metaDescription: e.target.value })}
            className="w-full rounded-xl border border-white/12 bg-black/50 px-3.5 py-2.5 text-sm text-white"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-zinc-400">Atmospheric Lighting Intensity</span>
          <select
            value={draft.atmosphereIntensity}
            onChange={(e) =>
              setDraft({
                ...draft,
                atmosphereIntensity: e.target.value as WebsiteSettings['atmosphereIntensity'],
              })
            }
            className="w-full rounded-xl border border-white/12 bg-black/50 px-3 py-2.5 text-sm text-white"
          >
            <option value="subtle">Subtle</option>
            <option value="balanced">Balanced</option>
            <option value="cinematic">Cinematic (Recommended)</option>
          </select>
        </label>

        <div className="flex flex-col justify-center gap-2 pt-3">
          <label className="inline-flex items-center gap-2 text-zinc-200">
            <input
              type="checkbox"
              checked={draft.introEnabled}
              onChange={(e) => setDraft({ ...draft, introEnabled: e.target.checked })}
              className="accent-rose-500"
            />
            Enable Cinematic Opening Sequence on First Load
          </label>
          <label className="inline-flex items-center gap-2 text-zinc-200">
            <input
              type="checkbox"
              checked={draft.reducedMotionDefault}
              onChange={(e) => setDraft({ ...draft, reducedMotionDefault: e.target.checked })}
              className="accent-rose-500"
            />
            Default to Reduced Motion Mode
          </label>
        </div>
      </div>

      {/* Section Visibility & Nav Titles */}
      <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
        <p className="mb-3 flex items-center gap-2 font-tech text-xs uppercase tracking-wider text-rose-300">
          <Layers className="h-3.5 w-3.5" /> Section Visibility &amp; Navigation Labels
        </p>
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 text-xs">
          {sectionKeys.map((key) => (
            <div
              key={key}
              className="flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2"
            >
              <input
                value={draft.sectionTitles[key] || key.toUpperCase()}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    sectionTitles: { ...draft.sectionTitles, [key]: e.target.value },
                  })
                }
                className="w-28 bg-transparent font-tech text-xs text-white focus:outline-none"
              />
              <button
                type="button"
                disabled={key === 'home'}
                onClick={() =>
                  setDraft({
                    ...draft,
                    sectionVisibility: {
                      ...draft.sectionVisibility,
                      [key]: !draft.sectionVisibility[key],
                    },
                  })
                }
                className={`rounded-md px-2 py-0.5 font-tech text-[10px] ${
                  draft.sectionVisibility[key] !== false
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {draft.sectionVisibility[key] !== false ? 'SHOW' : 'HIDE'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Admin Security & Backup */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <form
          onSubmit={handlePasswordChange}
          className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-3 text-xs"
        >
          <p className="font-tech text-xs uppercase tracking-wider text-sky-300">
            Change Admin Password
          </p>
          <input
            type="password"
            value={curPw}
            onChange={(e) => setCurPw(e.target.value)}
            placeholder="Current Password"
            required
            className="w-full rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
          />
          <input
            type="password"
            value={newPw}
            onChange={(e) => setNewPw(e.target.value)}
            placeholder="New Password (min 6 chars)"
            minLength={6}
            required
            className="w-full rounded-xl border border-white/12 bg-black/60 px-3 py-2 text-white"
          />
          <button
            type="submit"
            className="rounded-xl border border-sky-400/40 bg-sky-500/15 px-4 py-2 font-semibold text-sky-100 hover:bg-sky-500/25"
          >
            Update Password
          </button>
        </form>

        <div className="rounded-2xl border border-white/10 bg-black/40 p-4 space-y-3 text-xs">
          <p className="font-tech text-xs uppercase tracking-wider text-violet-300">
            Data Backup &amp; Recovery
          </p>
          <p className="text-zinc-400">
            Export a full JSON snapshot of your portfolio content, or restore initial default
            sections (preserving uploaded media).
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExportBackup}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-white hover:bg-white/10"
            >
              <Download className="h-3.5 w-3.5" /> Export JSON Backup
            </button>
            <button
              type="button"
              onClick={async () => {
                if (!window.confirm('Reset portfolio text sections to initial defaults? Uploaded media is preserved.'))
                  return;
                const reset = await resetPortfolioData(true);
                onPortfolioChange(reset);
                notify('Portfolio reset to initial content.');
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/35 bg-rose-500/15 px-3.5 py-2 text-rose-200 hover:bg-rose-500/25"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
