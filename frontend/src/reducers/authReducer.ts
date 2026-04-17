import type { AuthAction, AuthState } from '../types/auth';

export const initialAuthState: AuthState = {
  accessToken: null,
  expiresAtUtc: null,
  userId: null,
  role: null,
  isAuthenticated: false,
  isLoading: false,
  errorMessage: '',
};

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'START_AUTH_REQUEST':
      return {
        ...state,
        isLoading: true,
        errorMessage: '',
      };

    case 'LOGIN_SUCCESS':
      return {
        ...state,
        accessToken: action.payload.accessToken,
        expiresAtUtc: action.payload.expiresAtUtc,
        userId: action.payload.userId,
        role: action.payload.role,
        isAuthenticated: true,
        isLoading: false,
        errorMessage: '',
      };

    case 'REGISTER_SUCCESS':
      return {
        ...state,
        isLoading: false,
        errorMessage: '',
      };

    case 'AUTH_FAILURE':
      return {
        ...state,
        isLoading: false,
        errorMessage: action.payload.message,
      };

    case 'RESTORE_SESSION':
      return {
        ...state,
        accessToken: action.payload.accessToken,
        expiresAtUtc: action.payload.expiresAtUtc,
        userId: action.payload.userId,
        role: action.payload.role,
        isAuthenticated: true,
        isLoading: false,
        errorMessage: '',
      };

    case 'LOGOUT':
      return {
        ...initialAuthState,
      };

    case 'CLEAR_AUTH_ERROR':
      return {
        ...state,
        errorMessage: '',
      };
  }

  const exhaustiveCheck: never = action;
  return exhaustiveCheck;
}
