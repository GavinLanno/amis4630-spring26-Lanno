# Buckeye Sublease User Documentation

This document provides draft user-facing documentation for Buckeye Sublease. It is structured so screenshots can be added before submission.

## Information To Confirm Before Final Submission

- Admin access is seeded by the backend with these default values unless environment variables override them:
  - User ID: `admin`
  - Email: `admin@buckeye.local`
  - Password: `AdminPass1`
- If your deployed environment uses different admin credentials, replace the admin login details in this document before submitting it.

---

## User Guide

### 1. How to Browse Products

Buckeye Sublease opens on the home page, which displays the available property listings.

1. Open the application in your browser.
2. Review the list of available properties on the home page.
3. Look at the top of the page for the total number of listings shown.
4. Click any listing card to open its detail page.
5. On the detail page, review the property image, address, description, category, seller name, and price.
6. Use the back button or the site navigation to return to the main listing page and continue browsing.

**Screenshot placeholders**

- [Screenshot Placeholder: Home page showing available property listings]
- [Screenshot Placeholder: Listing detail page for one selected property]

### 2. How to Add Items to Cart

Users can add listings to the cart from the product listing area and then manage quantities from the cart page.

1. Browse to the home page and find a property you want to save.
2. Click the `Add to Cart` button on the listing.
3. Wait for the button to confirm the item was added successfully.
4. Click the cart icon in the navigation bar to open the cart page.
5. Review the selected listings in the cart.
6. Use the `+` and `-` buttons to increase or decrease quantity.
7. Click `Remove` to delete a single item from the cart.
8. Click `Clear Cart` if you want to remove all items.
9. Click `Back to Listings` to continue shopping.

**Screenshot placeholders**

- [Screenshot Placeholder: Listing page with Add to Cart button]
- [Screenshot Placeholder: Cart page showing selected items and quantity controls]

### 3. How to Create an Account and Login

The site uses a combined authentication page for both registration and login.

#### Create an Account

1. Click `Login` in the navigation bar.
2. On the authentication page, click `Register`.
3. Enter a `User ID`.
4. Enter your `Email`.
5. Enter a password with at least 8 characters.
6. Enter the same password again in `Confirm Password`.
7. Click `Create Account`.
8. Wait for the success message that confirms the account was created.
9. After registration, switch to the login form if needed.

#### Login

1. Stay on the authentication page or return to it by clicking `Login` in the navigation bar.
2. Make sure `Login` is selected.
3. Enter your `User ID`.
4. Enter your password.
5. Click `Login`.
6. After a successful login, you will be returned to the home page.
7. Confirm login success by checking that the navigation bar now shows `Orders` and `Logout`.
8. If you are using an admin account, the navigation bar will also show `Admin`.

**Screenshot placeholders**

- [Screenshot Placeholder: Authentication page in Register mode]
- [Screenshot Placeholder: Authentication page in Login mode]
- [Screenshot Placeholder: Navigation bar after successful login]

### 4. How to Place an Order

Users must be logged in before they can complete checkout.

1. Add one or more items to the cart.
2. Open the cart page using the cart icon in the navigation bar.
3. Review the cart contents and total price.
4. Click `Proceed to Checkout`.
5. If you are not logged in, the system will send you to the authentication page.
6. Log in, then return to the cart and click `Proceed to Checkout` again if needed.
7. On the checkout page, complete the shipping form:
   - Full Name
   - Address Line 1
   - City
   - State / Province
   - Postal Code
   - Country
   - Phone Number
8. Review the order summary shown on the right side of the checkout page.
9. Click `Place Order`.
10. Wait for the system to process the order and open the order confirmation page.

**Screenshot placeholders**

- [Screenshot Placeholder: Cart page with Proceed to Checkout button]
- [Screenshot Placeholder: Checkout page with shipping form and order summary]
- [Screenshot Placeholder: Order confirmation page after order placement]

### 5. How to View Order History

Order history is available only to authenticated users.

1. Log in to your account.
2. Click `Orders` in the navigation bar.
3. Review the order history page.
4. Use the `Active` filter to view orders that are still in progress.
5. Use the `All` filter to view every order linked to your account.
6. Review each order card for:
   - Confirmation number
   - Order status
   - Order date and time
   - Shipping address
   - Order total
7. Click `View Confirmation` on any order to open its confirmation page again.

**Screenshot placeholders**

- [Screenshot Placeholder: Order history page with Active and All filters]
- [Screenshot Placeholder: Order confirmation page opened from order history]

---

## Admin Guide

### 1. How to Manage Products

Only users with the `Admin` role can access the admin dashboard.

1. Log in with an admin account.
2. Confirm that the `Admin` button appears in the navigation bar.
3. Click `Admin` to open the admin dashboard.
4. In the `Product Management` section, enter the listing details:
   - Address
   - Description
   - Price
   - Category
   - Seller Name
   - Image URL
5. Click `Create Listing` to add a new product.
6. Scroll through the product list below the form to review existing listings.
7. Click `Edit` beside a listing to load its values into the form.
8. Update the fields you want to change.
9. Click `Update Listing` to save the changes.
10. Click `Cancel` if you want to stop editing without saving.
11. Click `Delete` beside a listing to remove it from the storefront.
12. Watch for success or error messages at the top of the admin page after each action.

**Screenshot placeholders**

- [Screenshot Placeholder: Admin dashboard product management section]
- [Screenshot Placeholder: Product form filled out for creating or editing a listing]
- [Screenshot Placeholder: Product list with Edit and Delete actions]

### 2. How to Update Order Status

Admins can update order progress from the same dashboard.

1. Log in with an admin account.
2. Open the `Admin` dashboard.
3. Scroll to the `All Orders` section.
4. Review the order list, which displays confirmation number, order date, and total.
5. Find the order you want to update.
6. Open the `Status` dropdown beside that order.
7. Select the new order status.
8. Confirm the updated value remains visible after the change is saved.

Available status values:

- `Placed`
- `Processing`
- `Shipped`
- `Delivered`
- `Cancelled`

**Screenshot placeholders**

- [Screenshot Placeholder: Admin dashboard All Orders section]
- [Screenshot Placeholder: Status dropdown expanded for an order]
- [Screenshot Placeholder: Order showing updated status]

---

## Suggested Screenshot Capture List

Use this checklist when collecting final images for the document:

1. Home page with multiple listings visible
2. Listing detail page
3. Add to Cart button in use
4. Cart page with items and quantity controls
5. Register form
6. Login form
7. Checkout page
8. Order confirmation page
9. Order history page
10. Admin dashboard product management section
11. Admin dashboard order status section
