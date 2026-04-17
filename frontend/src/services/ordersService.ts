import type { Order, OrderItem, PlaceOrderInput } from '../types/order';
import { apiRequest } from './apiRequest';
import { getValidAccessToken } from './authStorage';

const API_BASE_URL = '/api';

interface ProblemDetails {
  detail?: string;
  title?: string;
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

function mapOrderItem(item: OrderItemResponse): OrderItem {
  return {
    id: item.id,
    listingId: item.listingId,
    address: item.address,
    imageUrl: item.imageURL,
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
  try {
    const data = (await response.json()) as ProblemDetails;

    if (response.status === 401) {
      return 'Please log in before placing your order.';
    }

    return data.detail ?? data.title ?? 'Order request failed.';
  } catch {
    return response.status === 401
      ? 'Please log in before placing your order.'
      : 'Order request failed.';
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
