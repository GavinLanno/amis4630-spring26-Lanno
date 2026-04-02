import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from 'react';
import { cartReducer, initialCartState } from '../reducers/cartReducer';
import {
  addCartItem as addCartItemRequest,
  clearCart as clearCartRequest,
  fetchCart,
  removeCartItem as removeCartItemRequest,
  updateCartItem as updateCartItemRequest,
} from '../services/cartService';
import type { CartItem, CartSnapshot, CartState } from '../types/cart';

interface AddToCartInput {
  listingId: number;
  listingName: string;
  price: number;
  imageUrl?: string;
  categoryName?: string;
  quantity?: number;
}

interface CartContextValue {
  state: CartState;
  cartItemCount: number;
  cartTotal: number;
  addToCart: (item: AddToCartInput) => Promise<boolean>;
  updateQuantity: (listingId: number, quantity: number) => Promise<boolean>;
  removeItem: (listingId: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  clearError: () => void;
}

interface CartProviderProps {
  children: ReactNode;
}

const CartContext = createContext<CartContextValue | null>(null);

function cloneItems(items: CartItem[]): CartItem[] {
  return items.map((item) => ({ ...item }));
}

function createSnapshot(state: CartState): CartSnapshot {
  return {
    cartId: state.cartId,
    items: cloneItems(state.items),
  };
}

function recalculateItem(item: CartItem): CartItem {
  return {
    ...item,
    lineTotal: item.price * item.quantity,
  };
}

function buildOptimisticAddCart(
  state: CartState,
  item: AddToCartInput,
): CartSnapshot {
  const quantityToAdd = item.quantity ?? 1;
  const existingItem = state.items.find(
    (cartItem) => cartItem.listingId === item.listingId,
  );

  if (existingItem) {
    return {
      cartId: state.cartId,
      items: state.items.map((cartItem) =>
        cartItem.listingId === item.listingId
          ? recalculateItem({
              ...cartItem,
              quantity: cartItem.quantity + quantityToAdd,
            })
          : cartItem,
      ),
    };
  }

  return {
    cartId: state.cartId,
    items: [
      ...cloneItems(state.items),
      recalculateItem({
        id: item.listingId,
        listingId: item.listingId,
        listingName: item.listingName,
        price: item.price,
        quantity: quantityToAdd,
        imageUrl: item.imageUrl ?? '',
        categoryName: item.categoryName ?? '',
        lineTotal: item.price * quantityToAdd,
      }),
    ],
  };
}

function buildOptimisticQuantityCart(
  state: CartState,
  listingId: number,
  quantity: number,
): CartSnapshot {
  return {
    cartId: state.cartId,
    items: state.items.map((item) =>
      item.listingId === listingId
        ? recalculateItem({
            ...item,
            quantity,
          })
        : item,
    ),
  };
}

function buildOptimisticRemoveCart(
  state: CartState,
  listingId: number,
): CartSnapshot {
  return {
    cartId: state.cartId,
    items: state.items.filter((item) => item.listingId !== listingId),
  };
}

export function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, initialCartState);

  useEffect(() => {
    let isMounted = true;

    async function loadCart() {
      dispatch({ type: 'LOAD_CART_REQUEST' });

      try {
        const cart = await fetchCart();

        if (!isMounted) {
          return;
        }

        dispatch({
          type: 'LOAD_CART_SUCCESS',
          payload: cart,
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        dispatch({
          type: 'LOAD_CART_FAILURE',
          payload: {
            message:
              error instanceof Error
                ? error.message
                : 'Could not load your cart from the API.',
          },
        });
      }
    }

    void loadCart();

    return () => {
      isMounted = false;
    };
  }, []);

  const addToCart = useCallback(
    async (item: AddToCartInput) => {
      const snapshot = createSnapshot(state);
      const optimisticCart = buildOptimisticAddCart(state, item);

      dispatch({
        type: 'APPLY_OPTIMISTIC_CART',
        payload: optimisticCart,
      });

      try {
        const cart = await addCartItemRequest(
          item.listingId,
          item.quantity ?? 1,
        );

        dispatch({
          type: 'SYNC_CART_SUCCESS',
          payload: cart,
        });
        return true;
      } catch (error) {
        dispatch({
          type: 'SYNC_CART_FAILURE',
          payload: {
            message:
              error instanceof Error
                ? error.message
                : 'Could not add the item to your cart.',
            snapshot,
          },
        });
        return false;
      }
    },
    [state],
  );

  const updateQuantity = useCallback(
    async (listingId: number, quantity: number) => {
      const cartItem = state.items.find((item) => item.listingId === listingId);

      if (!cartItem) {
        return false;
      }

      const snapshot = createSnapshot(state);
      const optimisticCart = buildOptimisticQuantityCart(state, listingId, quantity);

      dispatch({
        type: 'APPLY_OPTIMISTIC_CART',
        payload: optimisticCart,
      });

      try {
        const cart = await updateCartItemRequest(cartItem.id, quantity);

        dispatch({
          type: 'SYNC_CART_SUCCESS',
          payload: cart,
        });
        return true;
      } catch (error) {
        dispatch({
          type: 'SYNC_CART_FAILURE',
          payload: {
            message:
              error instanceof Error
                ? error.message
                : 'Could not update the quantity.',
            snapshot,
          },
        });
        return false;
      }
    },
    [state],
  );

  const removeItem = useCallback(
    async (listingId: number) => {
      const cartItem = state.items.find((item) => item.listingId === listingId);

      if (!cartItem) {
        return false;
      }

      const snapshot = createSnapshot(state);
      const optimisticCart = buildOptimisticRemoveCart(state, listingId);

      dispatch({
        type: 'APPLY_OPTIMISTIC_CART',
        payload: optimisticCart,
      });

      try {
        const cart = await removeCartItemRequest(cartItem.id);

        dispatch({
          type: 'SYNC_CART_SUCCESS',
          payload: cart,
        });
        return true;
      } catch (error) {
        dispatch({
          type: 'SYNC_CART_FAILURE',
          payload: {
            message:
              error instanceof Error
                ? error.message
                : 'Could not remove the item from your cart.',
            snapshot,
          },
        });
        return false;
      }
    },
    [state],
  );

  const clearCart = useCallback(async () => {
    const snapshot = createSnapshot(state);

    dispatch({
      type: 'APPLY_OPTIMISTIC_CART',
      payload: {
        cartId: state.cartId,
        items: [],
      },
    });

    try {
      const cart = await clearCartRequest();

      dispatch({
        type: 'SYNC_CART_SUCCESS',
        payload: cart,
      });
      return true;
    } catch (error) {
      dispatch({
        type: 'SYNC_CART_FAILURE',
        payload: {
          message:
            error instanceof Error
              ? error.message
              : 'Could not clear the cart.',
          snapshot,
        },
      });
      return false;
    }
  }, [state]);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_CART_ERROR' });
  }, []);

  const cartItemCount = useMemo(
    () => state.items.reduce((total, item) => total + item.quantity, 0),
    [state.items],
  );

  const cartTotal = useMemo(
    () => state.items.reduce((total, item) => total + item.lineTotal, 0),
    [state.items],
  );

  const value = useMemo(
    () => ({
      state,
      cartItemCount,
      cartTotal,
      addToCart,
      updateQuantity,
      removeItem,
      clearCart,
      clearError,
    }),
    [
      addToCart,
      cartItemCount,
      cartTotal,
      clearCart,
      clearError,
      removeItem,
      state,
      updateQuantity,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext(): CartContextValue {
  const context = useContext(CartContext);

  if (context === null) {
    throw new Error('useCartContext must be used within a CartProvider.');
  }

  return context;
}
