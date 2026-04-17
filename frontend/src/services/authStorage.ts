import type { AuthSession } from '../types/auth';

export const AUTH_SESSION_STORAGE_KEY = 'buckeyeAuthSession';

function isValidSessionShape(value: unknown): value is AuthSession {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.accessToken === 'string'
    && typeof record.expiresAtUtc === 'string'
    && typeof record.userId === 'string'
    && (record.role === 'User' || record.role === 'Admin')
  );
}

export function readStoredAuthSession(): AuthSession | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawValue = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);

  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown;

    if (!isValidSessionShape(parsedValue)) {
      clearStoredAuthSession();
      return null;
    }

    return parsedValue;
  } catch {
    clearStoredAuthSession();
    return null;
  }
}

export function persistAuthSession(session: AuthSession): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(AUTH_SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredAuthSession(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_SESSION_STORAGE_KEY);
}

export function isSessionExpired(expiresAtUtc: string): boolean {
  const expiresAt = Date.parse(expiresAtUtc);

  if (Number.isNaN(expiresAt)) {
    return true;
  }

  return expiresAt <= Date.now();
}

export function getValidAccessToken(): string | null {
  const session = readStoredAuthSession();

  if (!session) {
    return null;
  }

  if (isSessionExpired(session.expiresAtUtc)) {
    clearStoredAuthSession();
    return null;
  }

  return session.accessToken;
}
