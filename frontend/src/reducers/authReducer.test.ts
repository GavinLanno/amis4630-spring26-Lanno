import { describe, expect, it } from 'vitest';
import { authReducer, initialAuthState } from './authReducer';

describe('authReducer', () => {
  it('handles START_AUTH_REQUEST by enabling loading and clearing errors', () => {
    const state = {
      ...initialAuthState,
      errorMessage: 'previous error',
    };

    const result = authReducer(state, {
      type: 'START_AUTH_REQUEST',
    });

    expect(result.isLoading).toBe(true);
    expect(result.errorMessage).toBe('');
  });

  it('handles LOGIN_SUCCESS by storing session details and setting authenticated state', () => {
    const result = authReducer(initialAuthState, {
      type: 'LOGIN_SUCCESS',
      payload: {
        accessToken: 'token-123',
        expiresAtUtc: '2030-01-01T00:00:00.000Z',
        userId: 'buckeye-user',
      },
    });

    expect(result.accessToken).toBe('token-123');
    expect(result.expiresAtUtc).toBe('2030-01-01T00:00:00.000Z');
    expect(result.userId).toBe('buckeye-user');
    expect(result.isAuthenticated).toBe(true);
    expect(result.isLoading).toBe(false);
    expect(result.errorMessage).toBe('');
  });

  it('handles AUTH_FAILURE by preserving auth state and exposing the error message', () => {
    const state = {
      ...initialAuthState,
      isLoading: true,
      isAuthenticated: true,
      accessToken: 'existing-token',
      userId: 'existing-user',
    };

    const result = authReducer(state, {
      type: 'AUTH_FAILURE',
      payload: {
        message: 'Invalid credentials',
      },
    });

    expect(result.isLoading).toBe(false);
    expect(result.isAuthenticated).toBe(true);
    expect(result.accessToken).toBe('existing-token');
    expect(result.userId).toBe('existing-user');
    expect(result.errorMessage).toBe('Invalid credentials');
  });

  it('handles LOGOUT by resetting to initial auth state', () => {
    const state = {
      accessToken: 'token-123',
      expiresAtUtc: '2030-01-01T00:00:00.000Z',
      userId: 'buckeye-user',
      isAuthenticated: true,
      isLoading: false,
      errorMessage: '',
    };

    const result = authReducer(state, {
      type: 'LOGOUT',
    });

    expect(result).toEqual(initialAuthState);
  });
});
