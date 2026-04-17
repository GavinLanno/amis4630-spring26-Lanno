import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AuthPage from './AuthPage';

const mockNavigate = vi.fn();
const mockClearError = vi.fn();
const mockLogin = vi.fn(async () => true);
const mockRegister = vi.fn(async () => true);

const mockAuthContextValue = {
  state: {
    accessToken: null,
    expiresAtUtc: null,
    userId: null,
    role: null,
    isAuthenticated: false,
    isLoading: false,
    errorMessage: '',
  },
  clearError: mockClearError,
  login: mockLogin,
  register: mockRegister,
};

vi.mock('../contexts/AuthContext', () => ({
  useAuthContext: () => mockAuthContextValue,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('AuthPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthContextValue.state.errorMessage = '';
    mockAuthContextValue.state.isLoading = false;
    mockAuthContextValue.state.isAuthenticated = false;
  });

  it('shows an error when login is submitted with empty fields', async () => {
    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>,
    );

    const submitButton = screen.getByRole('button', { name: 'Sign in to your account' });
    const form = submitButton.closest('form');

    expect(form).not.toBeNull();

    fireEvent.submit(form as HTMLFormElement);

    const alert = await screen.findByRole('alert');
    expect(alert.textContent).toContain('User ID is required.');
    expect(mockLogin).not.toHaveBeenCalled();
  });
});
