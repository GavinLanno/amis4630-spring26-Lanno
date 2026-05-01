import type { Listing } from '../types/Listing';
import { AddToCartButton } from './AddToCartButton/AddToCartButton';
import '../App.css';

interface ListingCardProps {
  listing: Listing;
  onClick: (id: number) => void;
}

function ListingCard({ listing, onClick }: ListingCardProps) {
  const formattedPrice = listing.price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  const formattedDate = new Date(listing.postedDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="listing-card" onClick={() => onClick(listing.id)}>
      <div className="listing-card-image-wrapper">
        <img
          src={listing.imageURL}
          alt={listing.address}
          className="listing-card-image"
          onError={(event) => {
            (event.target as HTMLImageElement).src =
              'https://placehold.co/400x240/e8e0d5/9a8778?text=No+Image';
          }}
        />
        <span className="listing-card-category">{listing.category}</span>
      </div>
      <div className="listing-card-body">
        <p className="listing-card-price">{formattedPrice}</p>
        <p className="listing-card-address">{listing.address}</p>
        <p className="listing-card-description">{listing.description}</p>
        <div className="listing-card-footer">
          <span className="listing-card-seller">{listing.sellerName}</span>
          <span className="listing-card-date">{formattedDate}</span>
        </div>
        <div className="listing-card-actions">
          <AddToCartButton
            listing={{
              id: listing.id,
              name: listing.address,
              price: listing.price,
              imageUrl: listing.imageURL,
              categoryName: listing.category,
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default ListingCard;
