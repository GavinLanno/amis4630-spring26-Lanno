export interface AuthSession {
  accessToken: string;
  expiresAtUtc: string;
  userId: string;
  role: 'User' | 'Admin';
}

export interface AuthState {
  accessToken: string | null;
  expiresAtUtc: string | null;
  userId: string | null;
  role: 'User' | 'Admin' | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  errorMessage: string;
}

interface StartAuthRequestAction {
  type: 'START_AUTH_REQUEST';
}

interface LoginSuccessAction {
  type: 'LOGIN_SUCCESS';
  payload: AuthSession;
}

interface RegisterSuccessAction {
  type: 'REGISTER_SUCCESS';
}

interface AuthFailureAction {
  type: 'AUTH_FAILURE';
  payload: {
    message: string;
  };
}

interface RestoreSessionAction {
  type: 'RESTORE_SESSION';
  payload: AuthSession;
}

interface LogoutAction {
  type: 'LOGOUT';
}

interface ClearAuthErrorAction {
  type: 'CLEAR_AUTH_ERROR';
}

export type AuthAction =
  | StartAuthRequestAction
  | LoginSuccessAction
  | RegisterSuccessAction
  | AuthFailureAction
  | RestoreSessionAction
  | LogoutAction
  | ClearAuthErrorAction;
