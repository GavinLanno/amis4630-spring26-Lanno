import { useMemo, useState, type FormEvent } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../contexts/AuthContext';
import styles from './AuthPage.module.css';

type AuthMode = 'login' | 'register';

function AuthPage() {
  const navigate = useNavigate();
  const { state, clearError, login, register } = useAuthContext();

  const [mode, setMode] = useState<AuthMode>('login');
  const [userId, setUserId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [localErrorMessage, setLocalErrorMessage] = useState('');

  const title = useMemo(
    () => (mode === 'login' ? 'Welcome Back' : 'Create Your Account'),
    [mode],
  );

  const subtitle = useMemo(
    () =>
      mode === 'login'
        ? 'Sign in to sync your saved considerations across sessions.'
        : 'Register once to keep your Buckeye sublease picks tied to your account.',
    [mode],
  );

  if (state.isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  function resetFeedback() {
    setSuccessMessage('');
    setLocalErrorMessage('');
    clearError();
  }

  function handleModeChange(nextMode: AuthMode) {
    if (nextMode === mode) {
      return;
    }

    setMode(nextMode);
    resetFeedback();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    resetFeedback();

    if (!userId.trim()) {
      setLocalErrorMessage('User ID is required.');
      return;
    }

    if (mode === 'login') {
      const didLoginSucceed = await login({
        userId: userId.trim(),
        password,
      });

      if (didLoginSucceed) {
        navigate('/', { replace: true });
      }

      return;
    }

    if (!email.trim()) {
      setLocalErrorMessage('Email is required.');
      return;
    }

    if (password.length < 8) {
      setLocalErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    const didRegisterSucceed = await register({
      userId: userId.trim(),
      email: email.trim(),
      password,
      confirmPassword,
    });

    if (didRegisterSucceed) {
      setMode('login');
      setPassword('');
      setConfirmPassword('');
      setSuccessMessage('Account created. Sign in with your new credentials.');
    }
  }

  return (
    <section className={styles.authPage} aria-labelledby="auth-page-title">
      <div className={styles.authCard}>
        <aside className={styles.brandPanel} aria-label="Buckeye Sublease membership details">
          <div>
            <h1 id="auth-page-title" className={styles.brandTitle}>
              Buckeye Sublease Clubhouse
            </h1>
            <p className={styles.brandSubtitle}>
              Build your shortlist, keep your favorite places organized, and return anytime.
            </p>
          </div>

          <div className={styles.brandStats}>
            <article className={styles.brandStat}>
              <p className={styles.brandStatLabel}>Sync</p>
              <p className={styles.brandStatValue}>Account Cart</p>
            </article>
            <article className={styles.brandStat}>
              <p className={styles.brandStatLabel}>Speed</p>
              <p className={styles.brandStatValue}>Quick Access</p>
            </article>
            <article className={styles.brandStat}>
              <p className={styles.brandStatLabel}>Focus</p>
              <p className={styles.brandStatValue}>Student Picks</p>
            </article>
          </div>
        </aside>

        <div className={styles.formPanel}>
          <header className={styles.formHeader}>
            <h2 className={styles.formTitle}>{title}</h2>
            <p className={styles.formSubtitle}>{subtitle}</p>
          </header>

          <div className={styles.modeSwitch} role="group" aria-label="Authentication mode">
            <button
              type="button"
              className={`${styles.modeButton} ${mode === 'login' ? styles.modeButtonActive : ''}`}
              onClick={() => handleModeChange('login')}
              aria-label="Switch to login"
              aria-pressed={mode === 'login'}
            >
              Login
            </button>
            <button
              type="button"
              className={`${styles.modeButton} ${mode === 'register' ? styles.modeButtonActive : ''}`}
              onClick={() => handleModeChange('register')}
              aria-label="Switch to register"
              aria-pressed={mode === 'register'}
            >
              Register
            </button>
          </div>

          <form className={styles.form} onSubmit={(event) => void handleSubmit(event)}>
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="auth-user-id">
                User ID
              </label>
              <input
                id="auth-user-id"
                className={styles.input}
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                type="text"
                autoComplete="username"
                placeholder="example: buckeye123"
                required
                aria-label="User ID"
              />
            </div>

            {mode === 'register' ? (
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="auth-email">
                  Email
                </label>
                <input
                  id="auth-email"
                  className={styles.input}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  required
                  aria-label="Email"
                />
              </div>
            ) : null}


            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="auth-password">
                Password
              </label>
              <input
                id="auth-password"
                className={styles.input}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                placeholder="Enter your password"
                required
                minLength={8}
                aria-label="Password"
              />
            </div>

            
            {mode === 'register' ? (
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="auth-confirm-password">
                  Confirm Password
                </label>
                <input
                  id="auth-confirm-password"
                  className={styles.input}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  type="password"
                  autoComplete="new-password"
                  placeholder="Confirm your password"
                  required
                  minLength={8}
                  aria-label="Confirm password"
                />
              </div>
            ) : null}

            <p className={styles.helperText}>
              {mode === 'register'
                ? 'New accounts are created with a standard user role.'
                : 'Use your registered credentials to access your account cart.'}
            </p>

            {state.errorMessage || localErrorMessage ? (
              <div className={styles.feedbackError} role="alert" aria-live="polite">
                {state.errorMessage || localErrorMessage}
              </div>
            ) : null}

            {successMessage ? (
              <div className={styles.feedbackSuccess} role="status" aria-live="polite">
                {successMessage}
              </div>
            ) : null}

            <div className={styles.actions}>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={state.isLoading}
                aria-label={mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
              >
                {state.isLoading
                  ? 'Please wait...'
                  : mode === 'login'
                    ? 'Login'
                    : 'Create Account'}
              </button>

              {state.errorMessage || localErrorMessage ? (
                <button
                  type="button"
                  className={styles.dismissButton}
                  onClick={resetFeedback}
                  aria-label="Dismiss authentication error"
                >
                  Dismiss
                </button>
              ) : null}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default AuthPage;
