import type { CartItem, CartSnapshot } from '../types/cart';
import { apiRequest } from './apiRequest';

const API_BASE_URL = '/api';
const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_BASE_URL ?? 'https://localhost:7000';
const SESSION_HEADER_NAME = 'X-Session-Id';

interface ProblemDetails {
  detail?: string;
  title?: string;
}

interface CartItemResponse {
  id: number;
  listingId: number;
  address: string;
  imageURL: string;
  price: number;
  categoryName: string;
  quantity: number;
  lineTotal: number;
}

interface CartResponse {
  id: number;
  cartItems: CartItemResponse[];
  cartTotal: number;
}

async function parseErrorMessage(response: Response): Promise<string> {
  try {
    const data = (await response.json()) as ProblemDetails;
    const message = data.detail ?? data.title ?? 'Request failed.';

    if (response.status === 404) {
      return 'This listing is no longer available.';
    }

    return message;
  } catch {
    if (response.status === 404) {
      return 'This listing is no longer available.';
    }

    return 'Request failed.';
  }
}

async function requestCart(
  input: RequestInfo | URL,
  sessionId: string | null,
  init?: RequestInit,
): Promise<CartSnapshot> {
  const headers = new Headers(init?.headers);

  if (sessionId) {
    headers.set(SESSION_HEADER_NAME, sessionId);
  }

  const response = await apiRequest(input, {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const data = (await response.json()) as CartResponse;
  const resolvedSessionId = response.headers.get(SESSION_HEADER_NAME) ?? sessionId;

  return mapCartResponse(data, resolvedSessionId);
}

function toAbsoluteImageUrl(imageUrl: string): string {
  if (imageUrl.startsWith('/')) {
    return imageUrl;
  }

  try {
    const parsedImageUrl = new URL(imageUrl);
    const parsedBackendUrl = new URL(BACKEND_BASE_URL);

    if (parsedImageUrl.origin === parsedBackendUrl.origin) {
      return `${parsedImageUrl.pathname}${parsedImageUrl.search}`;
    }

    return imageUrl;
  } catch {
    return `${BACKEND_BASE_URL}${imageUrl}`;
  }
}

function mapCartItem(item: CartItemResponse): CartItem {
  return {
    id: item.id,
    listingId: item.listingId,
    listingName: item.address,
    price: item.price,
    quantity: item.quantity,
    imageUrl: toAbsoluteImageUrl(item.imageURL),
    categoryName: item.categoryName,
    lineTotal: item.lineTotal,
  };
}

export function mapCartResponse(
  data: CartResponse,
  sessionId: string | null = null,
): CartSnapshot {
  return {
    cartId: data.id > 0 ? data.id : null,
    sessionId,
    items: data.cartItems.map(mapCartItem),
  };
}

export async function fetchCart(sessionId: string | null): Promise<CartSnapshot> {
  return requestCart(`${API_BASE_URL}/cart`, sessionId);
}

export async function addCartItem(
  listingId: number,
  quantity: number,
  sessionId: string | null,
): Promise<CartSnapshot> {
  return requestCart(`${API_BASE_URL}/cart`, sessionId, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      listingId,
      quantity,
    }),
  });
}

export async function updateCartItem(
  cartItemId: number,
  quantity: number,
  sessionId: string | null,
): Promise<CartSnapshot> {
  return requestCart(`${API_BASE_URL}/cart/${cartItemId}`, sessionId, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      quantity,
    }),
  });
}

export async function removeCartItem(
  cartItemId: number,
  sessionId: string | null,
): Promise<CartSnapshot> {
  return requestCart(`${API_BASE_URL}/cart/${cartItemId}`, sessionId, {
    method: 'DELETE',
  });
}

export async function clearCart(sessionId: string | null): Promise<CartSnapshot> {
  return requestCart(`${API_BASE_URL}/cart/clear`, sessionId, {
    method: 'DELETE',
  });
}
