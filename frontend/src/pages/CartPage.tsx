import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartContext } from '../contexts/CartContext';
import { useAuthContext } from '../contexts/AuthContext';
import { submitCheckout } from '../services/checkoutService';
import styles from './CartPage.module.css';

function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

function CartPage() {
  const navigate = useNavigate();
  const { state: authState } = useAuthContext();
  const {
    state,
    cartTotal,
    clearCart,
    clearError,
    removeItem,
    updateQuantity,
  } = useCartContext();
  const [checkoutMessage, setCheckoutMessage] = useState('');

  function handleQuantityChange(listingId: number, quantity: number) {
    const nextQuantity = Math.min(99, Math.max(1, quantity));

    void updateQuantity(listingId, nextQuantity);
  }

  function handleRemove(listingId: number) {
    void removeItem(listingId);
  }

  function handleClearCart() {
    void clearCart();
  }

  async function handleCheckout() {
    if (!authState.isAuthenticated) {
      navigate('/auth');
      return;
    }

    try {
      const message = await submitCheckout();
      setCheckoutMessage(message);
      clearError();
    } catch (error) {
      if (error instanceof Error) {
        setCheckoutMessage(error.message);
        return;
      }

      setCheckoutMessage('Checkout failed. Please try again.');
    }
  }

  if (state.isLoading) {
    return (
      <section className={styles.emptyState} aria-labelledby="cart-page-title">
        <h1 id="cart-page-title" className={styles.title}>
          Loading your cart
        </h1>
        <p className={styles.emptyMessage}>
          Syncing your saved cart items from the API.
        </p>
      </section>
    );
  }

  if (state.items.length === 0) {
    return (
      <section className={styles.emptyState} aria-labelledby="cart-page-title">
        <h1 id="cart-page-title" className={styles.title}>
          Your cart is empty
        </h1>
        <p className={styles.emptyMessage}>
          Add a few Buckeye Marketplace listings to start building your cart.
        </p>
        {state.errorMessage ? (
          <div className={styles.checkoutPlaceholder} role="alert">
            <p className={styles.checkoutMessage}>{state.errorMessage}</p>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={clearError}
              aria-label="Dismiss cart error"
            >
              Dismiss
            </button>
          </div>
        ) : null}
        <Link
          to="/"
          className={styles.browseLink}
          aria-label="Browse available products"
        >
          Browse products
        </Link>
      </section>
    );
  }

  return (
    <div className={styles.page}>
      <section className={styles.header} aria-labelledby="cart-page-title">
        <h1 id="cart-page-title" className={styles.title}>
          Your Considerations
        </h1>
        <p className={styles.subtitle}>
          Review your selected listings before checkout.
        </p>
        {state.isSyncing ? (
          <p className={styles.subtitle}>Saving cart changes to the backend...</p>
        ) : null}
        {state.errorMessage ? (
          <div className={styles.checkoutPlaceholder} role="alert">
            <p className={styles.checkoutMessage}>{state.errorMessage}</p>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={clearError}
              aria-label="Dismiss cart error"
            >
              Dismiss
            </button>
          </div>
        ) : null}
      </section>

      <section className={styles.cartCard} aria-label="Cart items">
        <ul className={styles.itemList}>
          {state.items.map((item) => (
            <li key={item.listingId} className={styles.item}>
              <div className={styles.itemDetails}>
                <h2 className={styles.itemName}>{item.listingName}</h2>
                <p className={styles.itemPrice}>{formatCurrency(item.price)} each</p>
              </div>

              <div className={styles.itemActions}>
                <div
                  className={styles.quantitySelector}
                  aria-label={`Quantity selector for ${item.listingName}`}
                >
                  <button
                    type="button"
                    className={styles.quantityButton}
                    onClick={() => handleQuantityChange(item.listingId, item.quantity - 1)}
                    disabled={item.quantity === 1 || state.isSyncing}
                    aria-label={`Decrease quantity for ${item.listingName}`}
                  >
                    -
                  </button>
                  <span className={styles.quantityValue} aria-live="polite">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    className={styles.quantityButton}
                    onClick={() => handleQuantityChange(item.listingId, item.quantity + 1)}
                    disabled={state.isSyncing}
                    aria-label={`Increase quantity for ${item.listingName}`}
                  >
                    +
                  </button>
                </div>

                <p className={styles.lineTotal}>
                  Line total: {formatCurrency(item.lineTotal)}
                </p>

                <button
                  type="button"
                  className={styles.removeButton}
                  onClick={() => handleRemove(item.listingId)}
                  disabled={state.isSyncing}
                  aria-label={`Remove ${item.listingName} from cart`}
                >
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>

        <div className={styles.summary}>
          <div className={styles.totalRow}>
            <span className={styles.totalLabel}>Cart total</span>
            <span className={styles.totalValue}>{formatCurrency(cartTotal)}</span>
          </div>

          <div className={styles.summaryActions}>
            <Link
              to="/"
              className={styles.secondaryButton}
              aria-label="Back to listings"
            >
              Back to Listings
            </Link>

            <button
              type="button"
              className={styles.secondaryButton}
              onClick={handleClearCart}
              disabled={state.isSyncing}
              aria-label="Clear cart"
            >
              Clear Cart
            </button>

            <button
              type="button"
              className={styles.checkoutButton}
              onClick={() => {
                void handleCheckout();
              }}
              aria-label="Proceed to checkout"
            >
              {authState.isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
            </button>
          </div>
        </div>
      </section>

      <section id="checkout" className={styles.checkoutPlaceholder}>
        <h2 className={styles.checkoutTitle}>Checkout</h2>
        {checkoutMessage ? (
          <p className={styles.checkoutMessage}>{checkoutMessage}</p>
        ) : (
          <p className={styles.checkoutMessage}>
            Checkout form coming in Part 5.
          </p>
        )}
      </section>
    </div>
  );
}

export default CartPage;
