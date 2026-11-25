import React, { useRef, useState } from 'react';
import {
  Check,
  FileText,
  Film,
  Image as ImageIcon,
  Link2,
  RefreshCw,
  RotateCcw,
  Save,
  Sliders,
  Trash2,
  Upload,
} from 'lucide-react';
import type {
  HeroProfile,
  MediaCategory,
  MediaItem,
  PortfolioData,
} from '../../types/portfolio';
import {
  assignMediaToTarget,
  deleteMediaFile,
  replaceMediaFile,
  uploadMediaFile,
} from '../../lib/api';
import { AnimatedPortrait } from '../AnimatedPortrait';

interface ProfileEditorProps {
  profile: HeroProfile;
  media: MediaItem[];
  onSaveProfile: (next: HeroProfile) => Promise<void>;
  onPortfolioSynced: (next: PortfolioData) => void;
  notify: (msg: string, isError?: boolean) => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({
  profile,
  media,
  onSaveProfile,
  onPortfolioSynced,
  notify,
}) => {
  const [draft, setDraft] = useState<HeroProfile>(profile);
  const [focusInput, setFocusInput] = useState(profile.focusAreas.join(', '));
  const [showGuides, setShowGuides] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const portraitInputRef = useRef<HTMLInputElement | null>(null);
  const resumeInputRef = useRef<HTMLInputElement | null>(null);

  const handlePhotoUpload = async (file: File) => {
    setUploading(true);
    try {
      const res = await uploadMediaFile(file, 'portrait', `${draft.name} portrait source`);
      onPortfolioSynced(res.portfolio);
      const updatedDraft: HeroProfile = {
        ...draft,
        profilePhotoUrl: res.item.url,
        portraitSourceUrl: res.item.url,
      };
      setDraft(updatedDraft);
      await onSaveProfile(updatedDraft);
      notify('New profile photo uploaded and activated as animated digital portrait!');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Photo upload failed', true);
    } finally {
      setUploading(false);
    }
  };

  const handleResumeUpload = async (file: File) => {
    setUploading(true);
    try {
      const res = await uploadMediaFile(file, 'resume', `${draft.name} Resume`);
      onPortfolioSynced(res.portfolio);
      const updatedDraft: HeroProfile = {
        ...draft,
        resumeUrl: res.item.url,
      };
      setDraft(updatedDraft);
      await onSaveProfile(updatedDraft);
      notify('Resume uploaded and linked to portfolio.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Resume upload failed', true);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const cleanedFocus = focusInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      await onSaveProfile({ ...draft, focusAreas: cleanedFocus });
      notify('Profile & Animated Portrait settings saved.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to save profile', true);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setDraft(profile);
    setFocusInput(profile.focusAreas.join(', '));
    notify('Reverted unsaved profile edits.');
  };

  const imageMedia = media.filter((m) => m.fileType === 'image');
  const activePortraitSrc = draft.portraitSourceUrl || draft.profilePhotoUrl;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-cinema text-2xl font-bold text-white">
            Profile &amp; Animated Digital Portrait
          </h2>
          <p className="text-xs text-zinc-400">
            Upload your real photograph to power the identity-locked animated portrait and calibrate
            natural blink &amp; breathing anchors.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 px-4 py-2 text-xs text-zinc-300 hover:bg-white/5"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-violet-600 px-5 py-2 text-xs font-semibold text-white disabled:opacity-60"
          >
            <Save className="h-3.5 w-3.5" /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Live Animated Portrait Preview + Calibration */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 xl:col-span-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-tech text-xs uppercase tracking-wider text-rose-300">
              Live Digital Portrait Preview
            </span>
            <label className="inline-flex cursor-pointer items-center gap-1.5 font-tech text-[11px] text-zinc-300">
              <input
                type="checkbox"
                checked={showGuides}
                onChange={(e) => setShowGuides(e.target.checked)}
                className="accent-rose-500"
              />
              Show Calibration Guides
            </label>
          </div>

          <div className="flex justify-center">
            <AnimatedPortrait
              imageUrl={activePortraitSrc}
              name={draft.name}
              calibration={draft.portraitCalibration}
              showCalibrationGuides={showGuides}
              compact
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <input
              ref={portraitInputRef}
              type="file"
              accept=".jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handlePhotoUpload(file);
                e.target.value = '';
              }}
            />
            <button
              type="button"
              onClick={() => portraitInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-500/40 bg-rose-600/20 px-4 py-2.5 font-tech text-xs text-rose-100 hover:bg-rose-600/35"
            >
              <Upload className="h-3.5 w-3.5" />
              {uploading ? 'Uploading...' : 'Upload New Photo'}
            </button>

            {imageMedia.length > 0 && (
              <select
                aria-label="Pick portrait from Media Library"
                value=""
                onChange={(e) => {
                  if (!e.target.value) return;
                  setDraft({
                    ...draft,
                    profilePhotoUrl: e.target.value,
                    portraitSourceUrl: e.target.value,
                  });
                }}
                className="rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-xs text-zinc-200"
              >
                <option value="">Use from Media Library...</option>
                {imageMedia.map((m) => (
                  <option key={m.id} value={m.url}>
                    {m.originalName}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Calibration Sliders */}
          <div className="mt-5 space-y-3 border-t border-white/10 pt-4">
            <p className="flex items-center gap-1.5 font-tech text-[11px] uppercase tracking-wider text-sky-300">
              <Sliders className="h-3.5 w-3.5" /> Facial Anchor Calibration (Identity Locked)
            </p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <label className="space-y-1">
                <span className="text-zinc-400">
                  Left Eye X ({draft.portraitCalibration.leftEyeX}%)
                </span>
                <input
                  type="range"
                  min={20}
                  max={60}
                  value={draft.portraitCalibration.leftEyeX}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      portraitCalibration: {
                        ...draft.portraitCalibration,
                        leftEyeX: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-rose-500"
                />
              </label>
              <label className="space-y-1">
                <span className="text-zinc-400">
                  Left Eye Y ({draft.portraitCalibration.leftEyeY}%)
                </span>
                <input
                  type="range"
                  min={15}
                  max={65}
                  value={draft.portraitCalibration.leftEyeY}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      portraitCalibration: {
                        ...draft.portraitCalibration,
                        leftEyeY: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-rose-500"
                />
              </label>
              <label className="space-y-1">
                <span className="text-zinc-400">
                  Right Eye X ({draft.portraitCalibration.rightEyeX}%)
                </span>
                <input
                  type="range"
                  min={40}
                  max={80}
                  value={draft.portraitCalibration.rightEyeX}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      portraitCalibration: {
                        ...draft.portraitCalibration,
                        rightEyeX: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-rose-500"
                />
              </label>
              <label className="space-y-1">
                <span className="text-zinc-400">
                  Right Eye Y ({draft.portraitCalibration.rightEyeY}%)
                </span>
                <input
                  type="range"
                  min={15}
                  max={65}
                  value={draft.portraitCalibration.rightEyeY}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      portraitCalibration: {
                        ...draft.portraitCalibration,
                        rightEyeY: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-rose-500"
                />
              </label>
              <label className="space-y-1">
                <span className="text-zinc-400">
                  Breathing Line ({draft.portraitCalibration.shoulderY}%)
                </span>
                <input
                  type="range"
                  min={55}
                  max={92}
                  value={draft.portraitCalibration.shoulderY}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      portraitCalibration: {
                        ...draft.portraitCalibration,
                        shoulderY: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-violet-500"
                />
              </label>
              <label className="space-y-1">
                <span className="text-zinc-400">
                  Crop Zoom ({draft.portraitCalibration.zoom.toFixed(2)}x)
                </span>
                <input
                  type="range"
                  min={0.85}
                  max={1.6}
                  step={0.02}
                  value={draft.portraitCalibration.zoom}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      portraitCalibration: {
                        ...draft.portraitCalibration,
                        zoom: Number(e.target.value),
                      },
                    })
                  }
                  className="w-full accent-sky-400"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-3 pt-2 text-xs text-zinc-300">
              {(
                [
                  ['enableBlinking', 'Natural Blink'],
                  ['enableBreathing', 'Subtle Breathing'],
                  ['enableGaze', 'Eye Catchlight'],
                  ['enableRimLight', 'Rim Lighting'],
                ] as const
              ).map(([key, label]) => (
                <label key={key} className="inline-flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={draft.portraitCalibration[key]}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        portraitCalibration: {
                          ...draft.portraitCalibration,
                          [key]: e.target.checked,
                        },
                      })
                    }
                    className="accent-rose-500"
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Hero Identity Form Fields */}
        <div className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 xl:col-span-7">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="block space-y-1.5 text-xs">
              <span className="text-zinc-400">Display Name</span>
              <input
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                className="w-full rounded-xl border border-white/12 bg-black/50 px-3.5 py-2.5 text-sm text-white"
              />
            </label>
            <label className="block space-y-1.5 text-xs">
              <span className="text-zinc-400">Subtitle</span>
              <input
                value={draft.subtitle}
                onChange={(e) => setDraft({ ...draft, subtitle: e.target.value })}
                className="w-full rounded-xl border border-white/12 bg-black/50 px-3.5 py-2.5 text-sm text-white"
              />
            </label>
          </div>

          <label className="block space-y-1.5 text-xs">
            <span className="text-zinc-400">Positioning Line</span>
            <input
              value={draft.positioning}
              onChange={(e) => setDraft({ ...draft, positioning: e.target.value })}
              className="w-full rounded-xl border border-white/12 bg-black/50 px-3.5 py-2.5 text-sm text-white"
            />
          </label>

          <label className="block space-y-1.5 text-xs">
            <span className="text-zinc-400">Supporting Focus Areas (comma-separated)</span>
            <input
              value={focusInput}
              onChange={(e) => setFocusInput(e.target.value)}
              className="w-full rounded-xl border border-white/12 bg-black/50 px-3.5 py-2.5 text-sm text-white"
            />
          </label>

          <label className="block space-y-1.5 text-xs">
            <span className="text-zinc-400">Hero Tagline</span>
            <textarea
              rows={3}
              value={draft.tagline}
              onChange={(e) => setDraft({ ...draft, tagline: e.target.value })}
              className="w-full rounded-xl border border-white/12 bg-black/50 px-3.5 py-2.5 text-sm text-white"
            />
          </label>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="block space-y-1.5 text-xs">
              <span className="text-zinc-400">Availability Badge</span>
              <input
                value={draft.availabilityBadge}
                onChange={(e) => setDraft({ ...draft, availabilityBadge: e.target.value })}
                className="w-full rounded-xl border border-white/12 bg-black/50 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="block space-y-1.5 text-xs">
              <span className="text-zinc-400">Primary CTA Label</span>
              <input
                value={draft.ctaPrimary}
                onChange={(e) => setDraft({ ...draft, ctaPrimary: e.target.value })}
                className="w-full rounded-xl border border-white/12 bg-black/50 px-3 py-2 text-sm text-white"
              />
            </label>
            <label className="block space-y-1.5 text-xs">
              <span className="text-zinc-400">Rim Light Theme</span>
              <select
                value={draft.portraitCalibration.rimColor}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    portraitCalibration: {
                      ...draft.portraitCalibration,
                      rimColor: e.target.value as 'crimson-purple' | 'electric-blue' | 'violet-gold',
                    },
                  })
                }
                className="w-full rounded-xl border border-white/12 bg-black/50 px-3 py-2 text-sm text-white"
              >
                <option value="crimson-purple">Crimson &amp; Purple</option>
                <option value="electric-blue">Electric Blue</option>
                <option value="violet-gold">Violet &amp; Amber</option>
              </select>
            </label>
          </div>

          {/* Resume Upload */}
          <div className="rounded-xl border border-white/10 bg-black/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold text-white">Resume / CV PDF</p>
                <p className="text-[11px] text-zinc-400">
                  {draft.resumeUrl ? `Linked: ${draft.resumeUrl}` : 'No resume linked yet'}
                </p>
              </div>
              <div className="flex gap-2">
                <input
                  ref={resumeInputRef}
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void handleResumeUpload(file);
                    e.target.value = '';
                  }}
                />
                <button
                  type="button"
                  onClick={() => resumeInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-sky-400/40 bg-sky-500/15 px-3 py-1.5 text-xs text-sky-200 hover:bg-sky-500/25"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Upload Resume PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface MediaLibraryManagerProps {
  portfolio: PortfolioData;
  onPortfolioSynced: (next: PortfolioData) => void;
  notify: (msg: string, isError?: boolean) => void;
}

const MEDIA_CATEGORIES: MediaCategory[] = [
  'profile',
  'portrait',
  'project-image',
  'project-video',
  'certificate',
  'certificate-thumb',
  'workshop',
  'achievement',
  'logo',
  'resume',
  'other',
];

export const MediaLibraryManager: React.FC<MediaLibraryManagerProps> = ({
  portfolio,
  onPortfolioSynced,
  notify,
}) => {
  const [filterCat, setFilterCat] = useState<'all' | MediaCategory>('all');
  const [uploadCat, setUploadCat] = useState<MediaCategory>('project-image');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [assignModalItem, setAssignModalItem] = useState<MediaItem | null>(null);
  const [assignTargetType, setAssignTargetType] = useState<
    'portrait' | 'profile-photo' | 'resume' | 'project' | 'internship' | 'certificate' | 'activity'
  >('portrait');
  const [assignTargetId, setAssignTargetId] = useState('');
  const [assignSlot, setAssignSlot] = useState<'image' | 'video' | 'file' | 'thumbnail'>('image');

  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      let latest = portfolio;
      for (const file of Array.from(files)) {
        const res = await uploadMediaFile(file, uploadCat, file.name);
        latest = res.portfolio;
      }
      onPortfolioSynced(latest);
      notify(`Uploaded ${files.length} file(s) to Media Library.`);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Upload failed', true);
    } finally {
      setUploading(false);
    }
  };

  const handleReplace = async (id: string, file: File) => {
    setBusyId(id);
    try {
      const res = await replaceMediaFile(id, file);
      onPortfolioSynced(res.portfolio);
      notify('Media file replaced and all portfolio references updated automatically.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Replace failed', true);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (id: string) => {
    setBusyId(id);
    try {
      const res = await deleteMediaFile(id);
      onPortfolioSynced(res.portfolio);
      notify('Media item deleted.');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Delete failed', true);
    } finally {
      setBusyId(null);
    }
  };

  const handleAssignSubmit = async () => {
    if (!assignModalItem) return;
    setBusyId(assignModalItem.id);
    try {
      const res = await assignMediaToTarget(assignModalItem.id, {
        targetType: assignTargetType,
        targetId: assignTargetId || undefined,
        slot: assignSlot,
      });
      onPortfolioSynced(res.portfolio);
      notify('Media linked to target section!');
      setAssignModalItem(null);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Assign failed', true);
    } finally {
      setBusyId(null);
    }
  };

  const items =
    filterCat === 'all'
      ? portfolio.media
      : portfolio.media.filter((m) => m.category === filterCat);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-cinema text-2xl font-bold text-white">Reusable Media Library</h2>
          <p className="text-xs text-zinc-400">
            Upload, preview, replace, delete, and assign photos, videos, certificates, and PDFs
            across any portfolio section.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={uploadCat}
            onChange={(e) => setUploadCat(e.target.value as MediaCategory)}
            aria-label="Upload category"
            className="rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-xs text-zinc-200"
          >
            {MEDIA_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>

          <input
            ref={uploadInputRef}
            type="file"
            multiple
            accept=".jpg,.jpeg,.png,.webp,.gif,.svg,.pdf,.mp4,.webm,.mov"
            className="hidden"
            onChange={(e) => {
              void handleUploadFiles(e.target.files);
              e.target.value = '';
            }}
          />
          <button
            type="button"
            onClick={() => uploadInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-violet-600 px-4 py-2 text-xs font-semibold text-white"
          >
            <Upload className="h-3.5 w-3.5" />
            {uploading ? 'Uploading...' : 'Upload Files'}
          </button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setFilterCat('all')}
          className={`rounded-full border px-3 py-1 font-tech text-[11px] ${
            filterCat === 'all'
              ? 'border-rose-500/60 bg-rose-500/20 text-white'
              : 'border-white/10 bg-white/[0.03] text-zinc-400'
          }`}
        >
          All ({portfolio.media.length})
        </button>
        {MEDIA_CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setFilterCat(c)}
            className={`rounded-full border px-3 py-1 font-tech text-[11px] ${
              filterCat === c
                ? 'border-violet-400/60 bg-violet-500/20 text-white'
                : 'border-white/10 bg-white/[0.03] text-zinc-400'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-white/[0.02] p-12 text-center">
          <ImageIcon className="mx-auto h-10 w-10 text-zinc-500" />
          <p className="mt-3 text-sm text-zinc-300">No media files in this filter yet.</p>
          <p className="mt-1 text-xs text-zinc-500">
            Upload JPG, JPEG, PNG, PDF, MP4, or WebM assets using the button above.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
            >
              <div className="relative aspect-[16/10] bg-black">
                {item.fileType === 'image' ? (
                  <img
                    src={item.url}
                    alt={item.altText || item.originalName}
                    className="h-full w-full object-cover"
                  />
                ) : item.fileType === 'video' ? (
                  <video src={item.url} controls className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-zinc-400">
                    {item.fileType === 'pdf' ? (
                      <FileText className="h-10 w-10 text-rose-400" />
                    ) : (
                      <Film className="h-10 w-10 text-sky-400" />
                    )}
                    <span className="mt-2 font-tech text-[10px] uppercase">
                      {item.fileType}
                    </span>
                  </div>
                )}
                <span className="absolute left-2.5 top-2.5 rounded-md border border-white/15 bg-black/75 px-2 py-0.5 font-tech text-[10px] uppercase text-zinc-200">
                  {item.category}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-4">
                <p className="truncate text-xs font-semibold text-white" title={item.originalName}>
                  {item.originalName}
                </p>
                <p className="mt-1 font-tech text-[10px] text-zinc-400">
                  {item.fileType.toUpperCase()} • {formatBytes(item.size)} •{' '}
                  {new Date(item.uploadedAt).toLocaleDateString()}
                </p>

                <div className="mt-4 flex flex-wrap gap-2 pt-2 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => {
                      setAssignModalItem(item);
                      setAssignTargetId(portfolio.projects[0]?.id || '');
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-sky-400/35 bg-sky-500/15 px-2.5 py-1.5 font-tech text-[10px] text-sky-200 hover:bg-sky-500/25"
                  >
                    <Link2 className="h-3 w-3" /> Use in Section
                  </button>

                  <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-white/15 bg-white/5 px-2.5 py-1.5 font-tech text-[10px] text-zinc-200 hover:bg-white/10">
                    <RefreshCw className="h-3 w-3" /> Replace
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) void handleReplace(item.id, f);
                        e.target.value = '';
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    disabled={busyId === item.id}
                    onClick={() => void handleDelete(item.id)}
                    className="ml-auto inline-flex items-center gap-1 rounded-lg border border-rose-500/35 bg-rose-500/15 px-2.5 py-1.5 font-tech text-[10px] text-rose-200 hover:bg-rose-500/30"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign Media Modal */}
      {assignModalItem && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md"
          onClick={() => setAssignModalItem(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="glass-panel w-full max-w-md rounded-2xl border border-white/15 p-6"
          >
            <h3 className="font-cinema text-lg font-bold text-white">Use Media in Section</h3>
            <p className="mt-1 truncate text-xs text-zinc-400">{assignModalItem.originalName}</p>

            <div className="mt-4 space-y-3 text-xs">
              <label className="block space-y-1">
                <span className="text-zinc-400">Target Section</span>
                <select
                  value={assignTargetType}
                  onChange={(e) => {
                    const v = e.target.value as typeof assignTargetType;
                    setAssignTargetType(v);
                    if (v === 'project') setAssignTargetId(portfolio.projects[0]?.id || '');
                    if (v === 'internship') setAssignTargetId(portfolio.internships[0]?.id || '');
                    if (v === 'certificate')
                      setAssignTargetId(portfolio.certifications[0]?.id || '');
                    if (v === 'activity') setAssignTargetId(portfolio.activities[0]?.id || '');
                  }}
                  className="w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-white"
                >
                  <option value="portrait">Animated Digital Portrait &amp; Profile Photo</option>
                  <option value="resume">Resume / CV PDF</option>
                  <option value="project">Project Showcase</option>
                  <option value="internship">Internship Certificate</option>
                  <option value="certificate">Certification Gallery</option>
                  <option value="activity">Workshop / Achievement</option>
                </select>
              </label>

              {assignTargetType === 'internship' && (
                <label className="block space-y-1">
                  <span className="text-zinc-400">Select Internship</span>
                  <select
                    value={assignTargetId}
                    onChange={(e) => setAssignTargetId(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-white"
                  >
                    {portfolio.internships.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.organization} — {i.role}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {assignTargetType === 'project' && (
                <>
                  <label className="block space-y-1">
                    <span className="text-zinc-400">Select Project</span>
                    <select
                      value={assignTargetId}
                      onChange={(e) => setAssignTargetId(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-white"
                    >
                      {portfolio.projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.code}: {p.title}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block space-y-1">
                    <span className="text-zinc-400">Slot</span>
                    <select
                      value={assignSlot}
                      onChange={(e) => setAssignSlot(e.target.value as typeof assignSlot)}
                      className="w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-white"
                    >
                      <option value="image">Project Image</option>
                      <option value="video">Project Video</option>
                    </select>
                  </label>
                </>
              )}

              {assignTargetType === 'certificate' && (
                <>
                  <label className="block space-y-1">
                    <span className="text-zinc-400">Select Certificate</span>
                    <select
                      value={assignTargetId}
                      onChange={(e) => setAssignTargetId(e.target.value)}
                      className="w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-white"
                    >
                      {portfolio.certifications.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block space-y-1">
                    <span className="text-zinc-400">Slot</span>
                    <select
                      value={assignSlot}
                      onChange={(e) => setAssignSlot(e.target.value as typeof assignSlot)}
                      className="w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-white"
                    >
                      <option value="file">Certificate Document (JPG/PNG/PDF)</option>
                      <option value="thumbnail">Certificate Thumbnail</option>
                    </select>
                  </label>
                </>
              )}

              {assignTargetType === 'activity' && (
                <label className="block space-y-1">
                  <span className="text-zinc-400">Select Workshop / Achievement</span>
                  <select
                    value={assignTargetId}
                    onChange={(e) => setAssignTargetId(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-black/60 px-3 py-2 text-white"
                  >
                    {portfolio.activities.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.category}: {a.title}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setAssignModalItem(null)}
                className="rounded-xl border border-white/15 px-4 py-2 text-xs text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleAssignSubmit()}
                className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white"
              >
                <Check className="h-3.5 w-3.5" /> Assign Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
