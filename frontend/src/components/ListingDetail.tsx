import type { Listing } from '../types/Listing';
import '../App.css';

interface ListingDetailProps {
  listing: Listing;
  onBack: () => void;
}

function ListingDetail({ listing, onBack }: ListingDetailProps) {
  const formattedPrice = listing.price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  const formattedDate = new Date(listing.postedDate).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="listing-detail">
      <button className="back-button" onClick={onBack}>
        ← Back to Listings
      </button>

      <div className="detail-image-wrapper">
        <img
          src={listing.imageURL}
          alt={listing.address}
          className="detail-image"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://placehold.co/900x400/e8e0d5/9a8778?text=No+Image';
          }}
        />
        <span className="detail-category">{listing.category}</span>
      </div>

      <div className="detail-body">
        <div className="detail-header">
          <h2 className="detail-price">{formattedPrice}</h2>
          <h3 className="detail-address">{listing.address}</h3>
        </div>

        <p className="detail-description">{listing.description}</p>

        <div className="detail-meta">
          <div className="detail-meta-item">
            <span className="detail-meta-label">Listed by</span>
            <span className="detail-meta-value">{listing.sellerName}</span>
          </div>
          <div className="detail-meta-item">
            <span className="detail-meta-label">Posted</span>
            <span className="detail-meta-value">{formattedDate}</span>
          </div>
          <div className="detail-meta-item">
            <span className="detail-meta-label">Category</span>
            <span className="detail-meta-value">{listing.category}</span>
          </div>
        </div>

        <button className="contact-button">Contact Seller</button>
      </div>
    </div>
  );
}

export default ListingDetail;
