import type { Listing } from '../types/Listing';
import ListingCard from './ListingCard';
import '../App.css';

interface ListingGridProps {
  listings: Listing[];
  onSelectListing: (id: number) => void;
}

function ListingGrid({ listings, onSelectListing }: ListingGridProps) {
  if (listings.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⌂</div>
        <h2 className="empty-state-title">No Properties Available</h2>
        <p className="empty-state-message">
          There are no listings at this time. Please check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="listing-grid">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          onClick={onSelectListing}
        />
      ))}
    </div>
  );
}

export default ListingGrid;