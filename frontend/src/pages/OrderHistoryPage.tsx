import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMyOrders } from '../services/ordersService';
import type { Order } from '../types/order';
import styles from './OrderHistoryPage.module.css';

type HistoryFilter = 'active' | 'all';

const activeStatuses = new Set(['placed', 'pendingpayment', 'processing', 'shipped']);

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

function OrderHistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [filter, setFilter] = useState<HistoryFilter>('active');

  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const result = await fetchMyOrders();

        if (!isMounted) {
          return;
        }

        setOrders(result);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Could not load your order history.',
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredOrders = useMemo(() => {
    if (filter === 'all') {
      return orders;
    }

    return orders.filter((order) => activeStatuses.has(order.status.toLowerCase()));
  }, [filter, orders]);

  if (isLoading) {
    return (
      <section className={styles.stateCard} aria-labelledby="order-history-title">
        <h1 id="order-history-title" className={styles.title}>Order History</h1>
        <p className={styles.message}>Loading your orders...</p>
      </section>
    );
  }

  if (errorMessage) {
    return (
      <section className={styles.stateCard} aria-labelledby="order-history-title">
        <h1 id="order-history-title" className={styles.title}>Order History</h1>
        <p className={styles.message}>{errorMessage}</p>
      </section>
    );
  }

  return (
    <section className={styles.page} aria-labelledby="order-history-title">
      <header className={styles.header}>
        <div>
          <h1 id="order-history-title" className={styles.title}>My Orders</h1>
          <p className={styles.message}>Review your completed and active orders.</p>
        </div>

        <div className={styles.filterGroup} role="group" aria-label="Order status filter">
          <button
            type="button"
            className={`${styles.filterButton} ${filter === 'active' ? styles.filterButtonActive : ''}`}
            onClick={() => setFilter('active')}
            aria-label="Show active orders"
            aria-pressed={filter === 'active'}
          >
            Active
          </button>
          <button
            type="button"
            className={`${styles.filterButton} ${filter === 'all' ? styles.filterButtonActive : ''}`}
            onClick={() => setFilter('all')}
            aria-label="Show all orders"
            aria-pressed={filter === 'all'}
          >
            All
          </button>
        </div>
      </header>

      {filteredOrders.length === 0 ? (
        <div className={styles.stateCard}>
          <p className={styles.message}>No orders match this filter yet.</p>
          <Link to="/" className={styles.linkButton} aria-label="Browse listings">
            Browse Listings
          </Link>
        </div>
      ) : (
        <ul className={styles.orderList}>
          {filteredOrders.map((order) => (
            <li key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <p className={styles.orderConfirmation}>{order.confirmationNumber}</p>
                <p className={styles.orderStatus}>{order.status}</p>
              </div>
              <p className={styles.orderMeta}>{formatUtcDate(order.orderDateUtc)}</p>
              <p className={styles.orderMeta}>Shipping: {order.shippingAddress}</p>
              <p className={styles.orderTotal}>{formatCurrency(order.total)}</p>
              <Link
                to={`/orders/confirmation/${order.id}`}
                state={{ order }}
                className={styles.linkButton}
                aria-label={`View confirmation for order ${order.confirmationNumber}`}
              >
                View Confirmation
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default OrderHistoryPage;
