import { Link } from 'react-router-dom';
import { useCartContext } from '../../contexts/CartContext';
import styles from './CartBadge.module.css';

export function CartBadge() {
  const { cartItemCount, state } = useCartContext();

  const cartLabel = state.isLoading
    ? 'Shopping cart is loading'
    : `Shopping cart with ${cartItemCount} items`;

  return (
    <Link
      to="/cart"
      className={styles.cartButton}
      aria-label={cartLabel}
    >
      Considerations ({state.isLoading ? '...' : cartItemCount})
    </Link>
  );
}
