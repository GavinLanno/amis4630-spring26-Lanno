import type { Listing } from './Listing';
import type { Order } from './order';

export type OrderStatus = 'Placed' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface ListingInput {
  address: string;
  description: string;
  price: number;
  categoryId: number;
  sellerName: string;
  imageURL: string;
}

export interface AdminListing extends Listing {
  categoryId?: number;
}

export type AdminOrder = Order;