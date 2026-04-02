import type { CartItem, CartSnapshot } from '../types/cart';

const API_BASE_URL = 'https://localhost:7000/api';
const BACKEND_BASE_URL = 'https://localhost:7000';

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
  init?: RequestInit,
): Promise<CartSnapshot> {
  const response = await fetch(input, init);

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const data = (await response.json()) as CartResponse;

  return mapCartResponse(data);
}

function toAbsoluteImageUrl(imageUrl: string): string {
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  return `${BACKEND_BASE_URL}${imageUrl}`;
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

export function mapCartResponse(data: CartResponse): CartSnapshot {
  return {
    cartId: data.id > 0 ? data.id : null,
    items: data.cartItems.map(mapCartItem),
  };
}

export async function fetchCart(): Promise<CartSnapshot> {
  return requestCart(`${API_BASE_URL}/cart`);
}

export async function addCartItem(
  listingId: number,
  quantity: number,
): Promise<CartSnapshot> {
  return requestCart(`${API_BASE_URL}/cart`, {
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
): Promise<CartSnapshot> {
  return requestCart(`${API_BASE_URL}/cart/${cartItemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      quantity,
    }),
  });
}

export async function removeCartItem(cartItemId: number): Promise<CartSnapshot> {
  return requestCart(`${API_BASE_URL}/cart/${cartItemId}`, {
    method: 'DELETE',
  });
}

export async function clearCart(): Promise<CartSnapshot> {
  return requestCart(`${API_BASE_URL}/cart/clear`, {
    method: 'DELETE',
  });
}
