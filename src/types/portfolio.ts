export type SectionKey =
  | 'home'
  | 'about'
  | 'education'
  | 'skills'
  | 'projects'
  | 'internships'
  | 'certifications'
  | 'achievements'
  | 'contact';

export type MediaCategory =
  | 'profile'
  | 'portrait'
  | 'project-image'
  | 'project-video'
  | 'certificate'
  | 'certificate-thumb'
  | 'workshop'
  | 'achievement'
  | 'logo'
  | 'resume'
  | 'other';

export interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  mimeType: string;
  fileType: 'image' | 'video' | 'pdf' | 'other';
  size: number;
  category: MediaCategory;
  altText?: string;
  uploadedAt: string;
}

export interface PortraitCalibration {
  leftEyeX: number; // percentage 0..100
  leftEyeY: number; // percentage 0..100
  rightEyeX: number; // percentage 0..100
  rightEyeY: number; // percentage 0..100
  mouthY: number; // percentage 0..100
  shoulderY: number; // percentage 0..100
  zoom: number; // 0.8..1.6
  offsetX: number; // -30..30
  offsetY: number; // -30..30
  rimColor: 'crimson-purple' | 'electric-blue' | 'violet-gold';
  enableBlinking: boolean;
  enableBreathing: boolean;
  enableGaze: boolean;
  enableRimLight: boolean;
}

export interface HeroProfile {
  name: string;
  subtitle: string;
  positioning: string;
  focusAreas: string[];
  tagline: string;
  ctaPrimary: string;
  ctaSecondary: string;
  profilePhotoUrl: string;
  portraitSourceUrl: string;
  portraitCalibration: PortraitCalibration;
  resumeUrl: string;
  availabilityBadge: string;
}

export interface AboutInfo {
  name: string;
  course: string;
  institution: string;
  cgpa: string;
  semester: string;
  batch: string;
  registerNumber: string;
  status: string;
  location: string;
  summary: string;
  targetOpportunities: string[];
  visible: boolean;
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  period: string;
  scoreLabel: string;
  semesterOrLevel: string;
  registerNumber?: string;
  location?: string;
  details: string;
  highlights: string[];
  visible: boolean;
  order: number;
}

export interface SkillItem {
  id: string;
  name: string;
  level: string;
  note?: string;
  visible: boolean;
  order: number;
}

export interface SkillCategory {
  id: string;
  name: string;
  accent: 'crimson' | 'purple' | 'blue' | 'emerald';
  description: string;
  skills: SkillItem[];
  visible: boolean;
  order: number;
}

export interface ProjectItem {
  id: string;
  code: string;
  title: string;
  category: string;
  description: string;
  problem: string;
  solution: string;
  contribution: string;
  technologies: string[];
  hardware: string[];
  software: string[];
  status: 'Completed' | 'In Progress' | 'Prototype Ready' | 'Research';
  images: string[];
  videos: string[];
  githubUrl: string;
  liveDemoUrl: string;
  featured: boolean;
  visible: boolean;
  order: number;
}

export interface InternshipItem {
  id: string;
  organization: string;
  role: string;
  duration: string;
  division?: string;
  certifiedDate?: string;
  certificateNo?: string;
  standard?: string;
  location?: string;
  focus: string;
  outcomes: string[];
  certificateFileUrl?: string;
  certificateFileType?: 'image' | 'pdf' | 'other';
  visible: boolean;
  order: number;
}

export interface CertificateItem {
  id: string;
  name: string;
  organization: string;
  issueDate: string;
  certificateId: string;
  category: string;
  description: string;
  verificationUrl: string;
  fileUrl: string;
  fileType: 'image' | 'pdf' | 'other';
  thumbnailUrl: string;
  featured: boolean;
  visible: boolean;
  order: number;
}

export type ActivityCategory =
  | 'Achievements'
  | 'Hackathons'
  | 'Workshops'
  | 'Training'
  | 'Awards'
  | 'Industry Events'
  | 'Other Activities';

export interface ActivityItem {
  id: string;
  title: string;
  category: ActivityCategory;
  organization: string;
  date: string;
  description: string;
  badgeText?: string;
  imageUrl?: string;
  linkUrl?: string;
  featured: boolean;
  visible: boolean;
  order: number;
}

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  location: string;
  headline: string;
  subtext: string;
  visible: boolean;
}

export interface SocialLink {
  id: string;
  platform: string;
  label: string;
  url: string;
  displayText: string;
  visible: boolean;
  order: number;
}

export interface WebsiteSettings {
  siteTitle: string;
  metaDescription: string;
  introEnabled: boolean;
  reducedMotionDefault: boolean;
  atmosphereIntensity: 'subtle' | 'balanced' | 'cinematic';
  sectionTitles: Record<SectionKey, string>;
  sectionVisibility: Record<SectionKey, boolean>;
}

export interface PortfolioData {
  profile: HeroProfile;
  about: AboutInfo;
  education: EducationItem[];
  skillCategories: SkillCategory[];
  projects: ProjectItem[];
  internships: InternshipItem[];
  certifications: CertificateItem[];
  activities: ActivityItem[];
  contact: ContactInfo;
  socialLinks: SocialLink[];
  media: MediaItem[];
  settings: WebsiteSettings;
  updatedAt: string;
}
