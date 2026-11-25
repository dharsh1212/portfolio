import express from 'express';
import cors from 'cors';
import multer from 'multer';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createInitialPortfolioData } from './seedData.ts';
import type { MediaCategory, MediaItem, PortfolioData } from '../src/types/portfolio.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const UPLOADS_DIR = path.join(ROOT_DIR, 'uploads');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const PORTFOLIO_FILE = path.join(DATA_DIR, 'portfolio.json');
const AUTH_FILE = path.join(DATA_DIR, 'auth.json');

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

interface AuthConfig {
  salt: string;
  passwordHash: string;
  tokenSecret: string;
  isDefaultPassword: boolean;
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

function loadOrInitAuth(): AuthConfig {
  if (fs.existsSync(AUTH_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(AUTH_FILE, 'utf-8')) as AuthConfig;
    } catch {
      // fall through and re-initialize
    }
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const tokenSecret = crypto.randomBytes(32).toString('hex');
  const defaultPassword = process.env.ADMIN_PASSWORD || 'dharshan@2026';
  const cfg: AuthConfig = {
    salt,
    passwordHash: hashPassword(defaultPassword, salt),
    tokenSecret,
    isDefaultPassword: true,
  };
  fs.writeFileSync(AUTH_FILE, JSON.stringify(cfg, null, 2), 'utf-8');
  return cfg;
}

function loadOrInitPortfolio(): PortfolioData {
  if (fs.existsSync(PORTFOLIO_FILE)) {
    try {
      const raw = JSON.parse(fs.readFileSync(PORTFOLIO_FILE, 'utf-8')) as PortfolioData;
      return raw;
    } catch {
      // fall back to initial seed
    }
  }
  const seed = createInitialPortfolioData();
  fs.writeFileSync(PORTFOLIO_FILE, JSON.stringify(seed, null, 2), 'utf-8');
  return seed;
}

function savePortfolio(data: PortfolioData): PortfolioData {
  const next: PortfolioData = {
    ...data,
    updatedAt: new Date().toISOString(),
  };
  fs.writeFileSync(PORTFOLIO_FILE, JSON.stringify(next, null, 2), 'utf-8');
  return next;
}

function signToken(secret: string): string {
  const payload = Buffer.from(
    JSON.stringify({ role: 'admin', iat: Date.now(), exp: Date.now() + 7 * 24 * 60 * 60 * 1000 })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyToken(token: string, secret: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  if (sig.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as {
      exp: number;
    };
    return typeof decoded.exp === 'number' && decoded.exp > Date.now();
  } catch {
    return false;
  }
}

let authConfig = loadOrInitAuth();
let portfolioData = loadOrInitPortfolio();

const ALLOWED_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.gif',
  '.svg',
  '.pdf',
  '.mp4',
  '.webm',
  '.mov',
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 48);
    const unique = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${safeBase}${ext}`;
    cb(null, unique);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      cb(new Error(`Unsupported file type: ${ext}`));
      return;
    }
    cb(null, true);
  },
});

function detectFileType(mime: string, filename: string): MediaItem['fileType'] {
  const ext = path.extname(filename).toLowerCase();
  if (mime.startsWith('image/') || ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext)) {
    return 'image';
  }
  if (mime.startsWith('video/') || ['.mp4', '.webm', '.mov'].includes(ext)) {
    return 'video';
  }
  if (mime === 'application/pdf' || ext === '.pdf') {
    return 'pdf';
  }
  return 'other';
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '15mb' }));

// Static uploaded assets
app.use('/uploads', express.static(UPLOADS_DIR));

function requireAdmin(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
): void {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!token || !verifyToken(token, authConfig.tokenSecret)) {
    res.status(401).json({ error: 'Unauthorized. Please sign in to the Admin Studio.' });
    return;
  }
  next();
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, updatedAt: portfolioData.updatedAt });
});

app.get('/api/portfolio', (_req, res) => {
  res.json(portfolioData);
});

app.get('/api/auth/status', (_req, res) => {
  res.json({ isDefaultPassword: authConfig.isDefaultPassword });
});

app.post('/api/auth/login', (req, res) => {
  const { password } = req.body as { password?: string };
  if (!password) {
    res.status(400).json({ error: 'Password is required.' });
    return;
  }
  const candidate = hashPassword(password, authConfig.salt);
  const valid =
    candidate.length === authConfig.passwordHash.length &&
    crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(authConfig.passwordHash));
  if (!valid) {
    res.status(401).json({ error: 'Invalid admin password.' });
    return;
  }
  const token = signToken(authConfig.tokenSecret);
  res.json({ token, isDefaultPassword: authConfig.isDefaultPassword });
});

app.get('/api/auth/verify', requireAdmin, (_req, res) => {
  res.json({ authenticated: true, isDefaultPassword: authConfig.isDefaultPassword });
});

app.post('/api/auth/change-password', requireAdmin, (req, res) => {
  const { currentPassword, newPassword } = req.body as {
    currentPassword?: string;
    newPassword?: string;
  };
  if (!currentPassword || !newPassword || newPassword.length < 6) {
    res.status(400).json({ error: 'New password must be at least 6 characters.' });
    return;
  }
  const candidate = hashPassword(currentPassword, authConfig.salt);
  if (
    candidate.length !== authConfig.passwordHash.length ||
    !crypto.timingSafeEqual(Buffer.from(candidate), Buffer.from(authConfig.passwordHash))
  ) {
    res.status(401).json({ error: 'Current password is incorrect.' });
    return;
  }
  const newSalt = crypto.randomBytes(16).toString('hex');
  authConfig = {
    ...authConfig,
    salt: newSalt,
    passwordHash: hashPassword(newPassword, newSalt),
    isDefaultPassword: false,
  };
  fs.writeFileSync(AUTH_FILE, JSON.stringify(authConfig, null, 2), 'utf-8');
  res.json({ ok: true });
});

app.put('/api/portfolio', requireAdmin, (req, res) => {
  const body = req.body as Partial<PortfolioData>;
  portfolioData = savePortfolio({
    ...portfolioData,
    ...body,
    media: Array.isArray(body.media) ? body.media : portfolioData.media,
  });
  res.json(portfolioData);
});

app.post('/api/portfolio/reset', requireAdmin, (req, res) => {
  const { keepMedia = true } = (req.body || {}) as { keepMedia?: boolean };
  const seed = createInitialPortfolioData();
  portfolioData = savePortfolio({
    ...seed,
    media: keepMedia ? portfolioData.media : [],
  });
  res.json(portfolioData);
});

app.post('/api/media/upload', requireAdmin, upload.single('file'), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded.' });
    return;
  }
  const category = (req.body.category as MediaCategory) || 'other';
  const altText = (req.body.altText as string) || req.file.originalname;
  const item: MediaItem = {
    id: `media-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`,
    filename: req.file.filename,
    originalName: req.file.originalname,
    url: `/uploads/${req.file.filename}`,
    mimeType: req.file.mimetype,
    fileType: detectFileType(req.file.mimetype, req.file.originalname),
    size: req.file.size,
    category,
    altText,
    uploadedAt: new Date().toISOString(),
  };
  portfolioData = savePortfolio({
    ...portfolioData,
    media: [item, ...portfolioData.media],
  });
  res.json({ item, portfolio: portfolioData });
});

function replaceUrlReferences(data: PortfolioData, oldUrl: string, newUrl: string): PortfolioData {
  const swap = (u: string) => (u === oldUrl ? newUrl : u);
  return {
    ...data,
    profile: {
      ...data.profile,
      profilePhotoUrl: swap(data.profile.profilePhotoUrl),
      portraitSourceUrl: swap(data.profile.portraitSourceUrl),
      resumeUrl: swap(data.profile.resumeUrl),
    },
    projects: data.projects.map((p) => ({
      ...p,
      images: p.images.map(swap),
      videos: p.videos.map(swap),
    })),
    certifications: data.certifications.map((c) => ({
      ...c,
      fileUrl: swap(c.fileUrl),
      thumbnailUrl: swap(c.thumbnailUrl),
    })),
    internships: data.internships.map((i) => ({
      ...i,
      certificateFileUrl: i.certificateFileUrl ? swap(i.certificateFileUrl) : i.certificateFileUrl,
    })),
    activities: data.activities.map((a) => ({
      ...a,
      imageUrl: a.imageUrl ? swap(a.imageUrl) : a.imageUrl,
    })),
  };
}

app.post('/api/media/:id/replace', requireAdmin, upload.single('file'), (req, res) => {
  const { id } = req.params;
  if (!req.file) {
    res.status(400).json({ error: 'No replacement file uploaded.' });
    return;
  }
  const existing = portfolioData.media.find((m) => m.id === id);
  if (!existing) {
    fs.unlinkSync(req.file.path);
    res.status(404).json({ error: 'Media item not found.' });
    return;
  }

  const oldPath = path.join(UPLOADS_DIR, existing.filename);
  if (fs.existsSync(oldPath)) {
    try {
      fs.unlinkSync(oldPath);
    } catch {
      // ignore unlink error
    }
  }

  const oldUrl = existing.url;
  const newUrl = `/uploads/${req.file.filename}`;
  const updatedItem: MediaItem = {
    ...existing,
    filename: req.file.filename,
    originalName: req.file.originalname,
    url: newUrl,
    mimeType: req.file.mimetype,
    fileType: detectFileType(req.file.mimetype, req.file.originalname),
    size: req.file.size,
    uploadedAt: new Date().toISOString(),
  };

  let updated = replaceUrlReferences(portfolioData, oldUrl, newUrl);
  updated = {
    ...updated,
    media: updated.media.map((m) => (m.id === id ? updatedItem : m)),
  };
  portfolioData = savePortfolio(updated);
  res.json({ item: updatedItem, portfolio: portfolioData });
});

app.delete('/api/media/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const existing = portfolioData.media.find((m) => m.id === id);
  if (!existing) {
    res.status(404).json({ error: 'Media item not found.' });
    return;
  }
  const filePath = path.join(UPLOADS_DIR, existing.filename);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch {
      // ignore
    }
  }
  const cleaned = replaceUrlReferences(portfolioData, existing.url, '');
  portfolioData = savePortfolio({
    ...cleaned,
    media: cleaned.media.filter((m) => m.id !== id),
  });
  res.json({ ok: true, portfolio: portfolioData });
});

app.post('/api/media/:id/assign', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { targetType, targetId, slot } = req.body as {
    targetType:
      | 'portrait'
      | 'profile-photo'
      | 'resume'
      | 'project'
      | 'internship'
      | 'certificate'
      | 'activity';
    targetId?: string;
    slot?: 'image' | 'video' | 'file' | 'thumbnail';
  };
  const mediaItem = portfolioData.media.find((m) => m.id === id);
  if (!mediaItem) {
    res.status(404).json({ error: 'Media item not found.' });
    return;
  }

  let next = { ...portfolioData };
  if (targetType === 'portrait') {
    next.profile = {
      ...next.profile,
      profilePhotoUrl: mediaItem.url,
      portraitSourceUrl: mediaItem.url,
    };
  } else if (targetType === 'profile-photo') {
    next.profile = { ...next.profile, profilePhotoUrl: mediaItem.url };
  } else if (targetType === 'resume') {
    next.profile = { ...next.profile, resumeUrl: mediaItem.url };
  } else if (targetType === 'project' && targetId) {
    next.projects = next.projects.map((p) => {
      if (p.id !== targetId) return p;
      if (slot === 'video' || mediaItem.fileType === 'video') {
        return {
          ...p,
          videos: p.videos.includes(mediaItem.url) ? p.videos : [...p.videos, mediaItem.url],
        };
      }
      return {
        ...p,
        images: p.images.includes(mediaItem.url) ? p.images : [mediaItem.url, ...p.images],
      };
    });
  } else if (targetType === 'internship' && targetId) {
    next.internships = next.internships.map((i) =>
      i.id === targetId
        ? {
            ...i,
            certificateFileUrl: mediaItem.url,
            certificateFileType:
              mediaItem.fileType === 'pdf'
                ? 'pdf'
                : mediaItem.fileType === 'image'
                  ? 'image'
                  : 'other',
          }
        : i
    );
  } else if (targetType === 'certificate' && targetId) {
    next.certifications = next.certifications.map((c) => {
      if (c.id !== targetId) return c;
      if (slot === 'thumbnail') {
        return { ...c, thumbnailUrl: mediaItem.url };
      }
      return {
        ...c,
        fileUrl: mediaItem.url,
        fileType: mediaItem.fileType === 'pdf' ? 'pdf' : mediaItem.fileType === 'image' ? 'image' : 'other',
        thumbnailUrl: mediaItem.fileType === 'image' && !c.thumbnailUrl ? mediaItem.url : c.thumbnailUrl,
      };
    });
  } else if (targetType === 'activity' && targetId) {
    next.activities = next.activities.map((a) =>
      a.id === targetId ? { ...a, imageUrl: mediaItem.url } : a
    );
  }

  portfolioData = savePortfolio(next);
  res.json({ portfolio: portfolioData });
});

if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get('/{*splat}', (_req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

// Multer & generic error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(400).json({ error: err.message || 'Server error' });
});

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`Portfolio backend running on http://localhost:${PORT}`);
});
