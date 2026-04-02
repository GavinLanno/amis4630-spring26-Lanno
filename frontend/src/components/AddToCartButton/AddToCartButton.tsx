import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { useCartContext } from '../../contexts/CartContext';
import styles from './AddToCartButton.module.css';

interface AddToCartButtonListing {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  categoryName?: string;
}

interface AddToCartButtonProps {
  listing: AddToCartButtonListing;
}

export function AddToCartButton({ listing }: AddToCartButtonProps) {
  const { addToCart, state } = useCartContext();
  const [isAdded, setIsAdded] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  async function handleAddToCart(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    setErrorMessage('');

    const wasAdded = await addToCart({
      listingId: listing.id,
      listingName: listing.name,
      price: listing.price,
      imageUrl: listing.imageUrl,
      categoryName: listing.categoryName,
      quantity: 1,
    });

    if (!wasAdded) {
      setErrorMessage(state.errorMessage || 'This listing is no longer available.');
      return;
    }

    setIsAdded(true);

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setIsAdded(false);
      timeoutRef.current = null;
    }, 1500);
  }

  return (
    <>
      <button
        type="button"
        className={styles.button}
        onClick={(event) => {
          void handleAddToCart(event);
        }}
        aria-label={`Add ${listing.name} to cart`}
        disabled={state.isLoading}
      >
        {state.isLoading ? 'Loading Cart...' : isAdded ? 'Successfully Added' : 'Add to Cart'}
      </button>
      {errorMessage ? (
        <p role="alert" aria-label={`Cart error for ${listing.name}`}>
          {errorMessage}
        </p>
      ) : null}
    </>
  );
}
