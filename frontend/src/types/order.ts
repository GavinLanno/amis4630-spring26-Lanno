export interface PlaceOrderInput {
  fullName: string;
  addressLine1: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  phoneNumber: string;
}

export interface OrderItem {
  id: number;
  listingId: number;
  address: string;
  imageUrl: string;
  categoryName: string;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: number;
  confirmationNumber: string;
  orderDateUtc: string;
  status: string;
  total: number;
  shippingAddress: string;
  items: OrderItem[];
}
