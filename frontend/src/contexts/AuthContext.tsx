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
import type { AuthState } from '../types/auth';

const DEFAULT_REGISTER_ROLE = 'user';

interface LoginInput {
  userId: string;
  password: string;
}

interface RegisterInput extends LoginInput {
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

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  useEffect(() => {
    const session = readStoredAuthSession();

    if (!session) {
      return;
    }

    if (isSessionExpired(session.expiresAtUtc)) {
      clearStoredAuthSession();
      return;
    }

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

      const session = {
        accessToken: result.accessToken,
        expiresAtUtc: result.expiresAtUtc,
        userId,
      };

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
    async ({ userId, password, confirmPassword }: RegisterInput) => {
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
