import type { Listing } from '../types/Listing';

const API_BASE_URL = '/api';
const DEV_BACKEND_ORIGIN =
  import.meta.env.VITE_BACKEND_BASE_URL ?? 'https://localhost:7000';

interface ListingResponse {
  id: number;
  address: string;
  description: string;
  price: number;
  categoryName: string;
  sellerName: string;
  postedDate: string;
  imageURL: string;
}

function mapListingResponse(listing: ListingResponse): Listing {
  return {
    id: listing.id,
    address: listing.address,
    description: listing.description,
    price: listing.price,
    category: listing.categoryName,
    sellerName: listing.sellerName,
    postedDate: listing.postedDate,
    imageURL: toProxyFriendlyImageUrl(listing.imageURL),
  };
}

function toProxyFriendlyImageUrl(imageUrl: string): string {
  if (imageUrl.startsWith('/')) {
    return imageUrl;
  }

  try {
    const parsedImageUrl = new URL(imageUrl);
    const parsedBackendUrl = new URL(DEV_BACKEND_ORIGIN);

    if (parsedImageUrl.origin === parsedBackendUrl.origin) {
      return `${parsedImageUrl.pathname}${parsedImageUrl.search}`;
    }
  } catch {
    return imageUrl;
  }

  return imageUrl;
}

export async function fetchListings(): Promise<Listing[]> {
  const response = await fetch(`${API_BASE_URL}/listings`);

  if (!response.ok) {
    throw new Error('Failed to fetch listings');
  }

  const data = (await response.json()) as ListingResponse[];

  return data.map(mapListingResponse);
}
