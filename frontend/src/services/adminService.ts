import { apiRequest } from './apiRequest';
import type { Listing } from '../types/Listing';
import type { ListingInput, OrderStatus } from '../types/admin';
import type { Order } from '../types/order';

const API_BASE_URL = '/api';

interface ProblemDetails {
  detail?: string;
  title?: string;
}

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

interface OrderItemResponse {
  id: number;
  listingId: number;
  address: string;
  imageURL: string;
  categoryName: string;
  price: number;
  quantity: number;
  lineTotal: number;
}

interface OrderResponse {
  id: number;
  confirmationNumber: string;
  orderDateUtc: string;
  status: string;
  total: number;
  shippingAddress: string;
  items: OrderItemResponse[];
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
    imageURL: listing.imageURL,
  };
}

function mapOrder(order: OrderResponse): Order {
  return {
    id: order.id,
    confirmationNumber: order.confirmationNumber,
    orderDateUtc: order.orderDateUtc,
    status: order.status,
    total: order.total,
    shippingAddress: order.shippingAddress,
    items: order.items.map((item) => ({
      id: item.id,
      listingId: item.listingId,
      address: item.address,
      imageUrl: item.imageURL,
      categoryName: item.categoryName,
      price: item.price,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    })),
  };
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const contentType = response.headers.get('content-type') ?? '';

    if (!contentType.includes('json')) {
      return (await response.text()).trim() || 'Request failed.';
    }

    const payload = (await response.json()) as ProblemDetails;
    return payload.detail ?? payload.title ?? 'Request failed.';
  } catch {
    return 'Request failed.';
  }
}

export async function fetchAdminListings(): Promise<Listing[]> {
  const response = await apiRequest(`${API_BASE_URL}/listings`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = (await response.json()) as ListingResponse[];
  return payload.map(mapListingResponse);
}

export async function createListing(input: ListingInput): Promise<Listing> {
  const response = await apiRequest(`${API_BASE_URL}/listings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = (await response.json()) as ListingResponse;
  return mapListingResponse(payload);
}

export async function updateListing(id: number, input: ListingInput): Promise<Listing> {
  const response = await apiRequest(`${API_BASE_URL}/listings/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = (await response.json()) as ListingResponse;
  return mapListingResponse(payload);
}

export async function deleteListing(id: number): Promise<void> {
  const response = await apiRequest(`${API_BASE_URL}/listings/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }
}

export async function fetchAllOrders(): Promise<Order[]> {
  const response = await apiRequest(`${API_BASE_URL}/orders`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = (await response.json()) as OrderResponse[];
  return payload.map(mapOrder);
}

export async function updateOrderStatus(orderId: number, status: OrderStatus): Promise<Order> {
  const response = await apiRequest(`${API_BASE_URL}/orders/${orderId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = (await response.json()) as OrderResponse;
  return mapOrder(payload);
}