import { useParams, useNavigate } from 'react-router-dom';
import type { Listing } from '../types/Listing';
import ListingDetail from '../components/ListingDetail';

interface ListingDetailPageProps {
  listings: Listing[];
}

function ListingDetailPage({ listings }: ListingDetailPageProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const listing = listings.find((l) => l.id === Number(id));

  // Handle case where id doesn't match any listing
  if (!listing) {
    return (
      <div className="not-found">
        <h2>Listing not found</h2>
        <p>The property you're looking for doesn't exist or has been removed.</p>
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back to Listings
        </button>
      </div>
    );
  }

  return (
    <ListingDetail
      listing={listing}
      onBack={() => navigate('/')}
    />
  );
}

export default ListingDetailPage;