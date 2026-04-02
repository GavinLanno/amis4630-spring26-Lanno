import '../App.css';
import { CartBadge } from './CartBadge/CartBadge';

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-logo">
          <span className="navbar-logo-icon">Home</span>
          <span className="navbar-logo-text">Buckeye Sublease</span>
        </div>
        <div className="navbar-tagline">Premium Real Estate For Buckeyes</div>
        <CartBadge />
      </div>
    </nav>
  );
}

export default Navbar;
