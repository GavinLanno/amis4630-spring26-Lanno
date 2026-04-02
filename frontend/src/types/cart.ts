export interface CartItem {
  id: number;
  listingId: number;
  listingName: string;
  price: number;
  quantity: number;
  imageUrl: string;
  categoryName: string;
  lineTotal: number;
}

export interface CartSnapshot {
  cartId: number | null;
  items: CartItem[];
}

export interface CartState extends CartSnapshot {
  isLoading: boolean;
  isSyncing: boolean;
  errorMessage: string;
}

interface LoadCartRequestAction {
  type: 'LOAD_CART_REQUEST';
}

interface LoadCartSuccessAction {
  type: 'LOAD_CART_SUCCESS';
  payload: CartSnapshot;
}

interface LoadCartFailureAction {
  type: 'LOAD_CART_FAILURE';
  payload: {
    message: string;
  };
}

interface ApplyOptimisticCartAction {
  type: 'APPLY_OPTIMISTIC_CART';
  payload: CartSnapshot;
}

interface SyncCartSuccessAction {
  type: 'SYNC_CART_SUCCESS';
  payload: CartSnapshot;
}

interface SyncCartFailureAction {
  type: 'SYNC_CART_FAILURE';
  payload: {
    message: string;
    snapshot: CartSnapshot;
  };
}

interface ClearCartErrorAction {
  type: 'CLEAR_CART_ERROR';
}

export type CartAction =
  | LoadCartRequestAction
  | LoadCartSuccessAction
  | LoadCartFailureAction
  | ApplyOptimisticCartAction
  | SyncCartSuccessAction
  | SyncCartFailureAction
  | ClearCartErrorAction;
