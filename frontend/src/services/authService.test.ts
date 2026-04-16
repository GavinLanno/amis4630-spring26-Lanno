import { afterEach, describe, expect, it, vi } from 'vitest';
import { createToken, registerUser } from './authService';

describe('authService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates a token using the auth endpoint and maps PascalCase response fields', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          AccessToken: 'jwt-token',
          ExpiresAtUtc: '2030-01-01T00:00:00.000Z',
        }),
        {
          status: 200,
        },
      ),
    );

    const result = await createToken({
      userId: 'buckeye-user',
      password: 'secure-password',
    });

    expect(result).toEqual({
      accessToken: 'jwt-token',
      expiresAtUtc: '2030-01-01T00:00:00.000Z',
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/auth/token',
      expect.objectContaining({
        method: 'POST',
      }),
    );
  });

  it('throws a parsed problem details message when token creation fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          detail: 'Invalid user ID or password.',
        }),
        {
          status: 401,
        },
      ),
    );

    await expect(
      createToken({
        userId: 'bad-user',
        password: 'bad-password',
      }),
    ).rejects.toThrow('Invalid user ID or password.');
  });

  it('registers users with role included in request payload', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, {
        status: 201,
      }),
    );

    await registerUser({
      userId: 'new-buckeye',
      email: 'new-buckeye@example.com',
      password: 'secure-password',
      role: 'user',
    });

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/auth/register',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          userId: 'new-buckeye',
          email: 'new-buckeye@example.com',
          password: 'secure-password',
          role: 'user',
        }),
      }),
    );
  });
});
