import { useNavigate } from 'react-router-dom';
import type { Listing } from '../types/Listing';
import ListingGrid from '../components/ListingGrid';

interface ListingsPageProps {
  listings: Listing[];
}

function ListingsPage({ listings }: ListingsPageProps) {
  const navigate = useNavigate();

  const handleSelect = (id: number) => {
    navigate(`/listings/${id}`);
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Available Properties</h1>
        <p className="page-subtitle">
          {listings.length > 0
            ? `${listings.length} listings found`
            : 'No listings available'}
        </p>
      </div>
      <ListingGrid listings={listings} onSelectListing={handleSelect} />
    </>
  );
}

export default ListingsPage;