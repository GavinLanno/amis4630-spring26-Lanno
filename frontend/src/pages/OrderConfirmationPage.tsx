import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { fetchMyOrders } from '../services/ordersService';
import type { Order } from '../types/order';
import styles from './OrderConfirmationPage.module.css';

interface OrderNavigationState {
  order?: Order;
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
}

function formatUtcDate(utcDate: string): string {
  return new Date(utcDate).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function OrderConfirmationPage() {
  const { id } = useParams();
  const location = useLocation();
  const locationState = location.state as OrderNavigationState | null;

  const [order, setOrder] = useState<Order | null>(locationState?.order ?? null);
  const [isLoading, setIsLoading] = useState(!locationState?.order);
  const [errorMessage, setErrorMessage] = useState('');

  const orderId = useMemo(() => Number(id), [id]);

  useEffect(() => {
    if (order || Number.isNaN(orderId)) {
      return;
    }

    let isMounted = true;

    async function loadOrder() {
      setIsLoading(true);

      try {
        const history = await fetchMyOrders();
        const matchedOrder = history.find((item) => item.id === orderId);

        if (!isMounted) {
          return;
        }

        if (!matchedOrder) {
          setErrorMessage('Order confirmation could not be found.');
          return;
        }

        setOrder(matchedOrder);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Could not load your order confirmation.',
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadOrder();

    return () => {
      isMounted = false;
    };
  }, [order, orderId]);

  if (isLoading) {
    return (
      <section className={styles.stateCard} aria-labelledby="order-confirmation-title">
        <h1 id="order-confirmation-title" className={styles.title}>Preparing your confirmation</h1>
        <p className={styles.message}>Loading your placed order details.</p>
      </section>
    );
  }

  if (errorMessage || !order) {
    return (
      <section className={styles.stateCard} aria-labelledby="order-confirmation-title">
        <h1 id="order-confirmation-title" className={styles.title}>Order confirmation unavailable</h1>
        <p className={styles.message}>{errorMessage || 'We could not find this order.'}</p>
        <div className={styles.actions}>
          <Link to="/orders" className={styles.actionButton} aria-label="View order history">
            View Order History
          </Link>
          <Link to="/" className={styles.actionButton} aria-label="Continue shopping">
            Continue Shopping
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.page} aria-labelledby="order-confirmation-title">
      <header className={styles.header}>
        <h1 id="order-confirmation-title" className={styles.title}>Order Confirmed</h1>
        <p className={styles.message}>
          Confirmation number <strong>{order.confirmationNumber}</strong>
        </p>
      </header>

      <div className={styles.card}>
        <div className={styles.infoGrid}>
          <p><span className={styles.label}>Placed</span> {formatUtcDate(order.orderDateUtc)}</p>
          <p><span className={styles.label}>Status</span> {order.status}</p>
          <p><span className={styles.label}>Shipping</span> {order.shippingAddress}</p>
          <p><span className={styles.label}>Total</span> {formatCurrency(order.total)}</p>
        </div>

        <h2 className={styles.sectionTitle}>Items</h2>
        <ul className={styles.itemList}>
          {order.items.map((item) => (
            <li key={item.id} className={styles.item}>
              <div>
                <p className={styles.itemName}>{item.address}</p>
                <p className={styles.itemMeta}>{item.categoryName} • Qty {item.quantity}</p>
              </div>
              <p className={styles.itemPrice}>{formatCurrency(item.lineTotal)}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.actions}>
        <Link to="/orders" className={styles.actionButton} aria-label="View order history">
          View Order History
        </Link>
        <Link to="/" className={styles.actionButton} aria-label="Continue shopping">
          Continue Shopping
        </Link>
      </div>
    </section>
  );
}

export default OrderConfirmationPage;
