import type { Order, OrderItem, PlaceOrderInput } from '../types/order';
import { API_BASE_URL, resolveAssetUrl } from '../config';
import { apiRequest } from './apiRequest';
import { getValidAccessToken } from './authStorage';

interface ProblemDetails {
  detail?: string;
  title?: string;
}

const fallbackMessagesByStatus: Record<number, string> = {
  401: 'Please log in before placing your order.',
  403: 'Your session is authenticated but not authorized for order placement. Please log in again.',
  404: 'Order endpoint not found. Restart the backend so the latest API routes are loaded.',
  405: 'Order endpoint is unavailable for this action. Verify the backend is running the latest build.',
  500: 'The server failed while placing your order. Please try again.',
};

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

function mapOrderItem(item: OrderItemResponse): OrderItem {
  return {
    id: item.id,
    listingId: item.listingId,
    address: item.address,
    imageUrl: resolveAssetUrl(item.imageURL),
    categoryName: item.categoryName,
    price: item.price,
    quantity: item.quantity,
    lineTotal: item.lineTotal,
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
    items: order.items.map(mapOrderItem),
  };
}

async function parseErrorMessage(response: Response): Promise<string> {
  const fallbackMessage = fallbackMessagesByStatus[response.status] ?? 'Order request failed.';

  try {
    const contentType = response.headers.get('content-type') ?? '';

    if (!contentType.includes('json')) {
      const textPayload = (await response.text()).trim();
      return textPayload.length > 0 ? textPayload : fallbackMessage;
    }

    const data = (await response.json()) as ProblemDetails;

    return data.detail ?? data.title ?? 'Order request failed.';
  } catch {
    return fallbackMessage;
  }
}

export async function placeOrder(input: PlaceOrderInput): Promise<Order> {
  const accessToken = getValidAccessToken();

  if (!accessToken) {
    throw new Error('Please log in before placing your order.');
  }

  const response = await apiRequest(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = (await response.json()) as OrderResponse;
  return mapOrder(payload);
}

export async function fetchMyOrders(): Promise<Order[]> {
  const accessToken = getValidAccessToken();

  if (!accessToken) {
    throw new Error('Please log in to view order history.');
  }

  const response = await apiRequest(`${API_BASE_URL}/orders/mine`, {
    method: 'GET',
  });

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response));
  }

  const payload = (await response.json()) as OrderResponse[];
  return payload.map(mapOrder);
}
