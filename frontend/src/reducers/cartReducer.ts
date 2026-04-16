import type { CartAction, CartState } from '../types/cart';

export const initialCartState: CartState = {
  cartId: null,
  sessionId: null,
  items: [],
  isLoading: true,
  isSyncing: false,
  errorMessage: '',
};

export function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'LOAD_CART_REQUEST':
      return {
        ...state,
        isLoading: true,
        errorMessage: '',
      };

    case 'LOAD_CART_SUCCESS':
      return {
        ...state,
        cartId: action.payload.cartId,
        sessionId: action.payload.sessionId,
        items: action.payload.items,
        isLoading: false,
        isSyncing: false,
        errorMessage: '',
      };

    case 'LOAD_CART_FAILURE':
      return {
        ...state,
        isLoading: false,
        isSyncing: false,
        errorMessage: action.payload.message,
      };

    case 'APPLY_OPTIMISTIC_CART':
      return {
        ...state,
        cartId: action.payload.cartId,
        sessionId: action.payload.sessionId,
        items: action.payload.items,
        isSyncing: true,
        errorMessage: '',
      };

    case 'SYNC_CART_SUCCESS':
      return {
        ...state,
        cartId: action.payload.cartId,
        sessionId: action.payload.sessionId,
        items: action.payload.items,
        isLoading: false,
        isSyncing: false,
        errorMessage: '',
      };

    case 'SYNC_CART_FAILURE':
      return {
        ...state,
        cartId: action.payload.snapshot.cartId,
        sessionId: action.payload.snapshot.sessionId,
        items: action.payload.snapshot.items,
        isLoading: false,
        isSyncing: false,
        errorMessage: action.payload.message,
      };

    case 'CLEAR_CART_ERROR':
      return {
        ...state,
        errorMessage: '',
      };
  }

  const exhaustiveCheck: never = action;
  return exhaustiveCheck;
}
