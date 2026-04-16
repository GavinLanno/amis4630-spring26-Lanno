import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import './App.css';
import type { Listing } from './types/Listing';
import Navbar from './components/Navbar';
import ListingsPage from './pages/ListingsPage';
import ListingDetailPage from './pages/Listingdetailpage.tsx';
//import { CartProvider } from "./contexts/CartContext";

function App() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Fetch all listings once at the app level and pass down
  useEffect(() => {
    fetch('https://localhost:7000/api/listings')
      .then((response) => {
        if (!response.ok) throw new Error('Failed to fetch listings');
        return response.json();
      })
      .then((data: Listing[]) => {
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
    <>
      <head> 
        <title>Buckeye Sublease</title> 
        <link rel="icon" href="HouseFavicon.png"/>
      </head>

      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<ListingsPage listings={listings} />} />
            <Route path="/listings/:id" element={<ListingDetailPage listings={listings} />} />
          </Routes>
        </main>
      </div>
    </>
  );
}

export default App;