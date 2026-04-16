import '../App.css';
import { Link } from 'react-router-dom';
import { CartBadge } from './CartBadge/CartBadge';
import { useAuthContext } from '../contexts/AuthContext';

function Navbar() {
  const { logout, state } = useAuthContext();

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-logo">
          <span className="navbar-logo-icon">Home</span>
          <span className="navbar-logo-text">Buckeye Sublease</span>
        </div>
        <div className="navbar-tagline">Premium Real Estate For Buckeyes</div>
        <div className="navbar-actions">
          {state.isAuthenticated ? (
            <button
              type="button"
              className="navbar-auth-button"
              onClick={logout}
              aria-label="Log out of your account"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/auth"
              className="navbar-auth-button"
              aria-label="Open login and registration page"
            >
              Login
            </Link>
          )}
          <CartBadge />
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
