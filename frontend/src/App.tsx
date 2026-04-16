import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import type { Listing } from './types/Listing';
import Navbar from './components/Navbar';
import ListingsPage from './pages/ListingsPage';
import ListingDetailPage from './pages/Listingdetailpage.tsx';
import CartPage from './pages/CartPage';
import AuthPage from './pages/AuthPage';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './contexts/AuthContext';
import { fetchListings } from './services/listingsService';

function App() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Fetch all listings once at the app level and pass down
  useEffect(() => {
    fetchListings()
      .then((data) => {
        setListings(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not connect to the API. Is your .NET server running?');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="status-screen">Loading listings...</div>;
  if (error)   return <div className="status-screen error">{error}</div>;

  return (
    <AuthProvider>
      <CartProvider>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<ListingsPage listings={listings} />} />
              <Route path="/home" element={<Navigate to="/" replace />} />
              <Route path="/listings" element={<Navigate to="/" replace />} />
              <Route path="/listings/:id" element={<ListingDetailPage listings={listings} />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/login" element={<Navigate to="/auth" replace />} />
              <Route path="/register" element={<Navigate to="/auth" replace />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;