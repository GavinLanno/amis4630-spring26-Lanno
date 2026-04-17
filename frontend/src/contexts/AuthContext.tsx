import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import { authReducer, initialAuthState } from '../reducers/authReducer';
import { createToken, registerUser } from '../services/authService';
import {
  clearStoredAuthSession,
  isSessionExpired,
  persistAuthSession,
  readStoredAuthSession,
} from '../services/authStorage';
import type { AuthSession, AuthState } from '../types/auth';

const DEFAULT_REGISTER_ROLE = 'User';
const NAME_IDENTIFIER_CLAIM = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';
const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

interface LoginInput {
  userId: string;
  password: string;
}

interface RegisterInput extends LoginInput {
  email: string;
  confirmPassword: string;
}

interface AuthContextValue {
  state: AuthState;
  login: (input: LoginInput) => Promise<boolean>;
  register: (input: RegisterInput) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function decodeJwtPayload(accessToken: string): Record<string, unknown> {
  const tokenParts = accessToken.split('.');

  if (tokenParts.length < 2) {
    throw new Error('Authentication token format is invalid.');
  }

  const payloadSegment = tokenParts[1];
  const base64 = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
  const paddedBase64 = `${base64}${'='.repeat((4 - (base64.length % 4)) % 4)}`;
  const json = atob(paddedBase64);

  return JSON.parse(json) as Record<string, unknown>;
}

function normalizeRole(rawRole: unknown): AuthSession['role'] {
  if (typeof rawRole !== 'string') {
    throw new Error('Authentication token is missing a valid role claim.');
  }

  const normalizedRole = rawRole.trim().toLowerCase();

  if (normalizedRole === 'admin') {
    return 'Admin';
  }

  if (normalizedRole === 'user') {
    return 'User';
  }

  throw new Error('Authentication token contains an unsupported role claim.');
}

function buildAuthSession(accessToken: string, expiresAtUtc: string, fallbackUserId: string): AuthSession {
  const payload = decodeJwtPayload(accessToken);
  const claimUserId = payload[NAME_IDENTIFIER_CLAIM];
  const claimRole = payload[ROLE_CLAIM] ?? payload.role;

  return {
    accessToken,
    expiresAtUtc,
    userId: typeof claimUserId === 'string' && claimUserId.trim().length > 0 ? claimUserId : fallbackUserId,
    role: normalizeRole(claimRole),
  };
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  useEffect(() => {
    const storedSession = readStoredAuthSession();

    if (!storedSession) {
      return;
    }

    if (isSessionExpired(storedSession.expiresAtUtc)) {
      clearStoredAuthSession();
      return;
    }

    let session: AuthSession;

    try {
      session = buildAuthSession(
        storedSession.accessToken,
        storedSession.expiresAtUtc,
        storedSession.userId,
      );
    } catch {
      clearStoredAuthSession();
      return;
    }

    persistAuthSession(session);

    dispatch({
      type: 'RESTORE_SESSION',
      payload: session,
    });
  }, []);

  const login = useCallback(async ({ userId, password }: LoginInput) => {
    dispatch({ type: 'START_AUTH_REQUEST' });

    try {
      const result = await createToken({
        userId,
        password,
      });

      const session = buildAuthSession(result.accessToken, result.expiresAtUtc, userId);

      persistAuthSession(session);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: session,
      });

      return true;
    } catch (error) {
      dispatch({
        type: 'AUTH_FAILURE',
        payload: {
          message:
            error instanceof Error
              ? error.message
              : 'Could not sign in with those credentials.',
        },
      });

      return false;
    }
  }, []);

  const register = useCallback(
    async ({ userId, email, password, confirmPassword }: RegisterInput) => {
      if (password !== confirmPassword) {
        dispatch({
          type: 'AUTH_FAILURE',
          payload: {
            message: 'Passwords do not match.',
          },
        });
        return false;
      }

      dispatch({ type: 'START_AUTH_REQUEST' });

      try {
        await registerUser({
          userId,
          email,
          password,
          role: DEFAULT_REGISTER_ROLE,
        });

        dispatch({ type: 'REGISTER_SUCCESS' });
        return true;
      } catch (error) {
        dispatch({
          type: 'AUTH_FAILURE',
          payload: {
            message:
              error instanceof Error
                ? error.message
                : 'Could not create your account.',
          },
        });
        return false;
      }
    },
    [],
  );

  const logout = useCallback(() => {
    clearStoredAuthSession();
    dispatch({ type: 'LOGOUT' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_AUTH_ERROR' });
  }, []);

  const value = useMemo(
    () => ({
      state,
      login,
      register,
      logout,
      clearError,
    }),
    [clearError, login, logout, register, state],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider.');
  }

  return context;
}
