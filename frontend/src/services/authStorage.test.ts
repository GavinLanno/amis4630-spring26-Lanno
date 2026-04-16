import { beforeEach, describe, expect, it } from 'vitest';
import {
  clearStoredAuthSession,
  getValidAccessToken,
  isSessionExpired,
  persistAuthSession,
  readStoredAuthSession,
} from './authStorage';

describe('authStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('persists and reads back a valid auth session', () => {
    persistAuthSession({
      accessToken: 'access-123',
      expiresAtUtc: '2030-01-01T00:00:00.000Z',
      userId: 'buckeye-user',
    });

    expect(readStoredAuthSession()).toEqual({
      accessToken: 'access-123',
      expiresAtUtc: '2030-01-01T00:00:00.000Z',
      userId: 'buckeye-user',
    });
  });

  it('returns null and clears storage for malformed JSON', () => {
    window.localStorage.setItem('buckeyeAuthSession', '{bad-json}');

    const result = readStoredAuthSession();

    expect(result).toBeNull();
    expect(window.localStorage.getItem('buckeyeAuthSession')).toBeNull();
  });

  it('returns null and clears storage when session shape is invalid', () => {
    window.localStorage.setItem(
      'buckeyeAuthSession',
      JSON.stringify({
        token: 'missing-required-fields',
      }),
    );

    const result = readStoredAuthSession();

    expect(result).toBeNull();
    expect(window.localStorage.getItem('buckeyeAuthSession')).toBeNull();
  });

  it('returns valid access token for non-expired session', () => {
    persistAuthSession({
      accessToken: 'future-token',
      expiresAtUtc: new Date(Date.now() + 60_000).toISOString(),
      userId: 'future-user',
    });

    expect(getValidAccessToken()).toBe('future-token');
  });

  it('returns null and clears storage for expired session', () => {
    persistAuthSession({
      accessToken: 'expired-token',
      expiresAtUtc: new Date(Date.now() - 60_000).toISOString(),
      userId: 'expired-user',
    });

    expect(getValidAccessToken()).toBeNull();
    expect(readStoredAuthSession()).toBeNull();
  });

  it('evaluates expiration correctly for parseable and invalid dates', () => {
    expect(isSessionExpired(new Date(Date.now() - 1_000).toISOString())).toBe(true);
    expect(isSessionExpired(new Date(Date.now() + 1_000).toISOString())).toBe(false);
    expect(isSessionExpired('not-a-date')).toBe(true);
  });

  it('clears stored auth session explicitly', () => {
    persistAuthSession({
      accessToken: 'token',
      expiresAtUtc: '2030-01-01T00:00:00.000Z',
      userId: 'user',
    });

    clearStoredAuthSession();

    expect(readStoredAuthSession()).toBeNull();
  });
});
