import { useEffect, useMemo, useState } from 'react';
import {
  createListing,
  deleteListing,
  fetchAdminListings,
  fetchAllOrders,
  updateListing,
  updateOrderStatus,
} from '../services/adminService';
import type { Listing } from '../types/Listing';
import type { ListingInput, OrderStatus } from '../types/admin';
import type { Order } from '../types/order';
import styles from './AdminPage.module.css';

const statusOptions: OrderStatus[] = ['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

const categoryNameToId: Record<string, number> = {
  House: 1,
  Condo: 2,
  Townhouse: 3,
  Luxury: 4,
  Apartment: 5,
};

const categoryEntries = [
  { id: 1, name: 'House' },
  { id: 2, name: 'Condo' },
  { id: 3, name: 'Townhouse' },
  { id: 4, name: 'Luxury' },
  { id: 5, name: 'Apartment' },
];

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

function toInputFromListing(listing?: Listing): ListingInput {
  if (!listing) {
    return {
      address: '',
      description: '',
      price: 0,
      categoryId: 1,
      sellerName: '',
      imageURL: '',
    };
  }

  return {
    address: listing.address,
    description: listing.description,
    price: listing.price,
    categoryId: categoryNameToId[listing.category] ?? 1,
    sellerName: listing.sellerName,
    imageURL: listing.imageURL,
  };
}

function AdminPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingListing, setIsSavingListing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [listingMessage, setListingMessage] = useState('');
  const [editingListingId, setEditingListingId] = useState<number | null>(null);
  const [form, setForm] = useState<ListingInput>(toInputFromListing());

  useEffect(() => {
    let isMounted = true;

    async function loadAdminData() {
      setIsLoading(true);
      setErrorMessage('');

      try {
        const [listingResult, orderResult] = await Promise.all([
          fetchAdminListings(),
          fetchAllOrders(),
        ]);

        if (!isMounted) {
          return;
        }

        setListings(listingResult);
        setOrders(orderResult);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : 'Could not load admin dashboard data.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadAdminData();

    return () => {
      isMounted = false;
    };
  }, []);

  const sortedOrders = useMemo(
    () => [...orders].sort((a, b) => Date.parse(b.orderDateUtc) - Date.parse(a.orderDateUtc)),
    [orders],
  );

  function handleFieldChange<K extends keyof ListingInput>(field: K, value: ListingInput[K]) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function resetForm() {
    setEditingListingId(null);
    setForm(toInputFromListing());
  }

  function startEditingListing(listing: Listing) {
    setEditingListingId(listing.id);
    setForm(toInputFromListing(listing));
    setListingMessage('');
    setErrorMessage('');
  }

  async function handleSubmitListing(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.address.trim() || !form.description.trim() || !form.sellerName.trim()) {
      setListingMessage('Address, description, and seller are required.');
      return;
    }

    if (form.price <= 0) {
      setListingMessage('Price must be greater than zero.');
      return;
    }

    setIsSavingListing(true);
    setListingMessage('');
    setErrorMessage('');

    try {
      if (editingListingId) {
        const updatedListing = await updateListing(editingListingId, form);
        setListings((current) => current.map((item) => (item.id === updatedListing.id ? updatedListing : item)));
        setListingMessage('Listing updated successfully.');
      } else {
        const createdListing = await createListing(form);
        setListings((current) => [createdListing, ...current]);
        setListingMessage('Listing created successfully.');
      }

      resetForm();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not save listing.');
    } finally {
      setIsSavingListing(false);
    }
  }

  async function handleDeleteListing(id: number) {
    setErrorMessage('');
    setListingMessage('');

    try {
      await deleteListing(id);
      setListings((current) => current.filter((item) => item.id !== id));

      if (editingListingId === id) {
        resetForm();
      }

      setListingMessage('Listing removed from storefront.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not delete listing.');
    }
  }

  async function handleOrderStatusChange(orderId: number, status: OrderStatus) {
    setErrorMessage('');

    try {
      const updatedOrder = await updateOrderStatus(orderId, status);
      setOrders((current) => current.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not update order status.');
    }
  }

  if (isLoading) {
    return (
      <section className={styles.page} aria-labelledby="admin-page-title">
        <h1 id="admin-page-title" className={styles.title}>Admin Dashboard</h1>
        <p className={styles.message}>Loading admin data...</p>
      </section>
    );
  }

  return (
    <section className={styles.page} aria-labelledby="admin-page-title">
      <header className={styles.header}>
        <h1 id="admin-page-title" className={styles.title}>Admin Dashboard</h1>
        <p className={styles.message}>Manage products and orders from one admin console.</p>
      </header>

      {errorMessage ? <p className={styles.errorMessage} role="alert">{errorMessage}</p> : null}
      {listingMessage ? <p className={styles.successMessage}>{listingMessage}</p> : null}

      <div className={styles.grid}>
        <section className={styles.panel} aria-labelledby="product-management-title">
          <h2 id="product-management-title" className={styles.panelTitle}>Product Management</h2>

          <form className={styles.form} onSubmit={handleSubmitListing}>
            <label className={styles.label} htmlFor="listing-address">Address</label>
            <input
              id="listing-address"
              className={styles.input}
              type="text"
              value={form.address}
              onChange={(event) => handleFieldChange('address', event.target.value)}
              aria-label="Listing address"
            />

            <label className={styles.label} htmlFor="listing-description">Description</label>
            <textarea
              id="listing-description"
              className={styles.textarea}
              value={form.description}
              onChange={(event) => handleFieldChange('description', event.target.value)}
              rows={3}
              aria-label="Listing description"
            />

            <div className={styles.formRow}>
              <div>
                <label className={styles.label} htmlFor="listing-price">Price</label>
                <input
                  id="listing-price"
                  className={styles.input}
                  type="number"
                  value={form.price}
                  onChange={(event) => handleFieldChange('price', Number(event.target.value))}
                  min={1}
                  aria-label="Listing price"
                />
              </div>
              <div>
                <label className={styles.label} htmlFor="listing-category">Category</label>
                <select
                  id="listing-category"
                  className={styles.input}
                  value={form.categoryId}
                  onChange={(event) => handleFieldChange('categoryId', Number(event.target.value))}
                  aria-label="Listing category"
                >
                  {categoryEntries.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <label className={styles.label} htmlFor="listing-seller">Seller Name</label>
            <input
              id="listing-seller"
              className={styles.input}
              type="text"
              value={form.sellerName}
              onChange={(event) => handleFieldChange('sellerName', event.target.value)}
              aria-label="Listing seller name"
            />

            <label className={styles.label} htmlFor="listing-image">Image URL</label>
            <input
              id="listing-image"
              className={styles.input}
              type="text"
              value={form.imageURL}
              onChange={(event) => handleFieldChange('imageURL', event.target.value)}
              aria-label="Listing image URL"
            />

            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.primaryButton}
                disabled={isSavingListing}
                aria-label={editingListingId ? 'Update listing' : 'Create listing'}
              >
                {editingListingId ? 'Update Listing' : 'Create Listing'}
              </button>
              {editingListingId ? (
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={resetForm}
                  aria-label="Cancel listing edit"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>

          <ul className={styles.list}>
            {listings.map((listing) => (
              <li key={listing.id} className={styles.listItem}>
                <div>
                  <p className={styles.itemTitle}>{listing.address}</p>
                  <p className={styles.itemMeta}>{listing.category} - {formatCurrency(listing.price)}</p>
                </div>
                <div className={styles.itemActions}>
                  <button
                    type="button"
                    className={styles.secondaryButton}
                    onClick={() => startEditingListing(listing)}
                    aria-label={`Edit listing ${listing.address}`}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className={styles.dangerButton}
                    onClick={() => void handleDeleteListing(listing.id)}
                    aria-label={`Delete listing ${listing.address}`}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.panel} aria-labelledby="order-management-title">
          <h2 id="order-management-title" className={styles.panelTitle}>All Orders</h2>
          <ul className={styles.list}>
            {sortedOrders.map((order) => (
              <li key={order.id} className={styles.listItem}>
                <div>
                  <p className={styles.itemTitle}>{order.confirmationNumber}</p>
                  <p className={styles.itemMeta}>{formatUtcDate(order.orderDateUtc)} - {formatCurrency(order.total)}</p>
                </div>
                <label className={styles.statusLabel}>
                  <span className={styles.statusLabelText}>Status</span>
                  <select
                    className={styles.input}
                    value={order.status}
                    onChange={(event) => void handleOrderStatusChange(order.id, event.target.value as OrderStatus)}
                    aria-label={`Update status for order ${order.confirmationNumber}`}
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </label>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </section>
  );
}

export default AdminPage;
