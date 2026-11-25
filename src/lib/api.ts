import type { MediaCategory, MediaItem, PortfolioData } from '../types/portfolio';

const TOKEN_KEY = 'dharshan_portfolio_admin_token';

export function getStoredToken(): string {
  return sessionStorage.getItem(TOKEN_KEY) || '';
}

export function setStoredToken(token: string): void {
  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(TOKEN_KEY);
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body.error) msg = body.error;
    } catch {
      // ignore json parse error
    }
    throw new Error(msg);
  }
  return (await res.json()) as T;
}

function authHeaders(): HeadersInit {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchPortfolio(): Promise<PortfolioData> {
  const res = await fetch('/api/portfolio', { cache: 'no-store' });
  return handleResponse<PortfolioData>(res);
}

export async function savePortfolioData(data: PortfolioData): Promise<PortfolioData> {
  const res = await fetch('/api/portfolio', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(data),
  });
  return handleResponse<PortfolioData>(res);
}

export async function checkAuthStatus(): Promise<{ isDefaultPassword: boolean }> {
  const res = await fetch('/api/auth/status');
  return handleResponse<{ isDefaultPassword: boolean }>(res);
}

export async function verifySession(): Promise<{
  authenticated: boolean;
  isDefaultPassword: boolean;
}> {
  const token = getStoredToken();
  if (!token) return { authenticated: false, isDefaultPassword: true };
  const res = await fetch('/api/auth/verify', { headers: authHeaders() });
  if (!res.ok) {
    setStoredToken('');
    return { authenticated: false, isDefaultPassword: true };
  }
  return handleResponse<{ authenticated: boolean; isDefaultPassword: boolean }>(res);
}

export async function loginAdmin(password: string): Promise<{
  token: string;
  isDefaultPassword: boolean;
}> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const data = await handleResponse<{ token: string; isDefaultPassword: boolean }>(res);
  setStoredToken(data.token);
  return data;
}

export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string
): Promise<{ ok: boolean }> {
  const res = await fetch('/api/auth/change-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  return handleResponse<{ ok: boolean }>(res);
}

export async function uploadMediaFile(
  file: File,
  category: MediaCategory,
  altText?: string
): Promise<{ item: MediaItem; portfolio: PortfolioData }> {
  const form = new FormData();
  form.append('file', file);
  form.append('category', category);
  if (altText) form.append('altText', altText);

  const res = await fetch('/api/media/upload', {
    method: 'POST',
    headers: authHeaders(),
    body: form,
  });
  return handleResponse<{ item: MediaItem; portfolio: PortfolioData }>(res);
}

export async function replaceMediaFile(
  id: string,
  file: File
): Promise<{ item: MediaItem; portfolio: PortfolioData }> {
  const form = new FormData();
  form.append('file', file);
  const res = await fetch(`/api/media/${encodeURIComponent(id)}/replace`, {
    method: 'POST',
    headers: authHeaders(),
    body: form,
  });
  return handleResponse<{ item: MediaItem; portfolio: PortfolioData }>(res);
}

export async function deleteMediaFile(
  id: string
): Promise<{ ok: boolean; portfolio: PortfolioData }> {
  const res = await fetch(`/api/media/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return handleResponse<{ ok: boolean; portfolio: PortfolioData }>(res);
}

export async function assignMediaToTarget(
  id: string,
  payload: {
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
  }
): Promise<{ portfolio: PortfolioData }> {
  const res = await fetch(`/api/media/${encodeURIComponent(id)}/assign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify(payload),
  });
  return handleResponse<{ portfolio: PortfolioData }>(res);
}

export async function resetPortfolioData(keepMedia = true): Promise<PortfolioData> {
  const res = await fetch('/api/portfolio/reset', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
    },
    body: JSON.stringify({ keepMedia }),
  });
  return handleResponse<PortfolioData>(res);
}
