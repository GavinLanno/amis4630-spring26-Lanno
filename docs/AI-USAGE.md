# AI Usage Log: Auth UI Implementation

Date: 2026-04-16
Scope: Frontend auth page and navbar login entry for Buckeye Sublease.

## Request Summary

The user requested:
- A plan for register and login UX.
- A Login button in the top navigation, positioned to the left of the Considerations button.
- A login/register page that matches the landing page theme.
- Start implementation.

## Key Product Decisions Confirmed During Chat

- Single combined auth page (Login/Register toggle) instead of separate pages.
- Registration role is hidden from users and sent as user.
- Redirect to home page after successful login.
- Keep existing guest cart flow intact.

## What Was Implemented

### 1) Routing and App Wiring

- Added auth route support and redirects:
	- /auth
	- /login -> /auth
	- /register -> /auth
- Added AuthProvider at app shell level and kept CartProvider.

File:
- frontend/src/App.tsx

### 2) Navbar Login Placement

- Added Login action to navbar and placed it directly left of Considerations.
- Added Logout action when authenticated.
- Adjusted navbar spacing and responsive behavior.

Files:
- frontend/src/components/Navbar.tsx
- frontend/src/App.css
- frontend/src/components/CartBadge/CartBadge.module.css

### 3) Combined Auth Page (Themed)

- Added a single auth page with mode toggle:
	- Login form
	- Register form
- Includes loading, local validation, API error display, success feedback, and aria labels.
- Styled to match existing theme tokens (typography, palette, radius/shadow language).

Files:
- frontend/src/pages/AuthPage.tsx
- frontend/src/pages/AuthPage.module.css

### 4) Auth State Management

- Added feature-level auth state using Context + useReducer.
- Added session restoration on app load.
- Added login, register, logout, and clear-error actions.
- Added localStorage-based session persistence.

Files:
- frontend/src/contexts/AuthContext.tsx
- frontend/src/reducers/authReducer.ts
- frontend/src/types/auth.ts
- frontend/src/services/authStorage.ts

### 5) Backend API Integration

- Wired frontend auth service to backend endpoints:
	- POST /api/auth/register
	- POST /api/auth/token
- Added resilient token response mapping for both camelCase and PascalCase fields.

File:
- frontend/src/services/authService.ts

### 6) Auth Token Usage for Cart Calls

- Updated cart API service to attach Authorization: Bearer token when a valid session exists.
- Preserves guest header behavior (X-Session-Id) for non-authenticated users.

File:
- frontend/src/services/cartService.ts

## Test Coverage Added

Added new tests to cover auth behavior:

- Reducer behavior:
	- frontend/src/reducers/authReducer.test.ts
- Storage behavior:
	- frontend/src/services/authStorage.test.ts
- Service behavior:
	- frontend/src/services/authService.test.ts

Existing tests remained green.

## Validation Performed

Commands executed in frontend:
- npm run lint
- npm test -- --run

Result summary:
- Lint: pass
- Tests: 6 files passed, 22 tests passed

Manual browser checks:
- /auth route loads auth page.
- Navbar shows Login to the left of Considerations.
- Theme and visual language match landing page style.

## Known Environment Notes

- Backend auth requires JWT_SIGNING_KEY to be configured.
- Local image loading may show certificate trust errors in browser tooling if HTTPS dev cert is untrusted.

## Out of Scope for This Chat

- Refresh token flow.
- Server-side logout/invalidation endpoint.
- Persistent auth user storage improvements in backend.
- Role management UI.

## Quick File Index (Created or Updated)

- frontend/src/App.tsx
- frontend/src/App.css
- frontend/src/components/Navbar.tsx
- frontend/src/components/CartBadge/CartBadge.module.css
- frontend/src/pages/AuthPage.tsx
- frontend/src/pages/AuthPage.module.css
- frontend/src/contexts/AuthContext.tsx
- frontend/src/reducers/authReducer.ts
- frontend/src/services/authService.ts
- frontend/src/services/authStorage.ts
- frontend/src/services/cartService.ts
- frontend/src/types/auth.ts
- frontend/src/reducers/authReducer.test.ts
- frontend/src/services/authStorage.test.ts
- frontend/src/services/authService.test.ts

## Notes for Future Follow-Up

- Add component-level tests for AuthPage interactions (mode toggle and form submission UX).
- Consider protecting selected routes once auth requirements are finalized.
- Decide long-term token storage strategy and session expiration UX.

---

# AI Usage Log: Backend Auth Deliverables Implementation

Date: 2026-04-16
Scope: Close backend auth rubric gaps (login route, validation, seeded admin, refresh tokens).

## Request Summary

The user asked to verify auth deliverables, mark missing items, create a plan, then start implementation.

## Gaps Identified Before Coding

- Missing POST /api/auth/login endpoint (only /api/auth/token existed).
- Missing password policy enforcement (min 8, uppercase, digit).
- Missing email format validation.
- No persistent seeded admin user (auth users were in-memory).
- No refresh token mechanism.

## What Was Implemented

### 1) Login Route Compatibility

- Added login route alias to the token issuance action.
- Existing /api/auth/token behavior preserved for compatibility.

Primary file:
- backend/HelloWorldApi/Controllers/AuthController.cs

### 2) Registration Validation

- Added FluentValidation-based validator for register payload.
- Enforced:
	- valid email format
	- password minimum length 8
	- at least one uppercase
	- at least one digit
- Integrated validator into registration flow with ProblemDetails 400 output.

Primary files:
- backend/HelloWorldApi/Validators/RegisterRequestValidator.cs
- backend/HelloWorldApi/DTOs/RegisterRequestDto.cs
- backend/HelloWorldApi/Controllers/AuthController.cs
- backend/HelloWorldApi/Program.cs

### 3) Persistent Auth Users + Seeded Admin

- Replaced in-memory auth store with EF-backed AuthUsers table.
- Added startup seeding for one local admin user:
	- UserId: admin
	- Email: admin@buckeye.local
	- Password: AdminPass1
	- Role: Admin
- Added race-safe seed handling for parallel startup in tests.

Primary files:
- backend/HelloWorldApi/Models/AuthUser.cs
- backend/HelloWorldApi/Data/LisitngContext.cs
- backend/HelloWorldApi/Program.cs

### 4) Refresh Token Mechanism

- Added RefreshToken entity and DB table.
- Issued refresh token on login/token creation.
- Added POST /api/auth/refresh with token rotation.
- Added JWT jti claim to ensure refreshed access tokens are distinct.

Primary files:
- backend/HelloWorldApi/Models/RefreshToken.cs
- backend/HelloWorldApi/DTOs/RefreshTokenRequestDto.cs
- backend/HelloWorldApi/DTOs/TokenResponseDto.cs
- backend/HelloWorldApi/Controllers/AuthController.cs
- backend/HelloWorldApi/Data/LisitngContext.cs

### 5) Schema and Test Updates

- Added migration for AuthUsers and RefreshTokens:
	- 20260416063818_AddAuthUsersAndRefreshTokens
- Added/updated unit and integration tests for:
	- email/password validation
	- login route + seeded admin login
	- refresh token rotation and reuse rejection
- Updated integration test factory to use isolated temp SQLite DB.

Primary files:
- backend/HelloWorldApi/Migrations/20260416063818_AddAuthUsersAndRefreshTokens.cs
- backend/HelloWorldApi.Tests/Unit/AuthControllerTests.cs
- backend/HelloWorldApi.Tests/Integration/AuthIntegrationTests.cs
- backend/HelloWorldApi.Tests/Integration/TestApiFactory.cs

## Validation Evidence

Command run:
- dotnet test workshop-4-lab.sln

Result:
- Passed (12 total, 12 passed, 0 failed)

## Notes and Constraints Encountered

- EF migration generation initially failed due to file lock on HelloWorldApi.exe; resolved by stopping the lingering process.
- sqlite3 CLI was not available in this environment for direct DB querying.
- Local admin seed exists in startup logic; direct manual DB verification command was skipped by user in-session.

---

# AI Usage Log: Order Placement and History Implementation

Date: 2026-04-17
Scope: Implement end-to-end order placement from cart, confirmation flow, and authenticated order history.

## Request Summary

The user requested implementation start after planning for:
- POST /api/orders to place an order from cart.
- Order and OrderItem persistence with shipping details and totals.
- Cart clear on successful order placement.
- Confirmation number generation.
- Frontend checkout page and order confirmation page.
- GET /api/orders/mine using JWT subject ownership (no user id in URL).

## Key Decisions Confirmed During Chat

- Initial order status: Placed.
- Shipping fields: FullName, AddressLine1, City, StateProvince, PostalCode, Country, PhoneNumber.
- Confirmation number strategy: derived from order id plus timestamp.
- Checkout UX: dedicated /checkout page plus separate confirmation page.
- History behavior: include all statuses from backend, default active filter in UI.

## What Was Implemented

### 1) Backend Domain and Data Schema

- Added Order and OrderItem entities.
- Added AuthUser to Orders relationship.
- Added DbSet registrations and indexes for Orders and OrderItems.
- Added migration to create Orders and OrderItems tables.

Primary files:
- backend/HelloWorldApi/Models/Order.cs
- backend/HelloWorldApi/Models/OrderItem.cs
- backend/HelloWorldApi/Models/AuthUser.cs
- backend/HelloWorldApi/Data/LisitngContext.cs
- backend/HelloWorldApi/Migrations/20260417035620_AddOrdersAndOrderItems.cs

### 2) Backend API Endpoints

- Added OrdersController.
- Implemented POST /api/orders:
	- Resolves user from JWT NameIdentifier claim.
	- Loads authenticated user cart with items.
	- Validates non-empty cart.
	- Snapshots cart items to OrderItems with price and line totals.
	- Creates order with status and shipping address.
	- Generates confirmation number after persistence.
	- Clears cart items in same order placement flow.
- Implemented GET /api/orders/mine:
	- Derives user from JWT claim only.
	- Returns only current user's orders.

Primary files:
- backend/HelloWorldApi/Controllers/OrdersController.cs
- backend/HelloWorldApi/DTOs/PlaceOrderRequestDto.cs
- backend/HelloWorldApi/DTOs/OrderDto.cs

### 3) Frontend Checkout and Order UX

- Updated cart checkout action to route to /checkout.
- Added checkout page with:
	- shipping address form
	- validation and error states
	- order summary from cart context
- Added order confirmation page.
- Added order history page with default active filter and all toggle.
- Added routes for /checkout, /orders, and /orders/confirmation/:id.
- Added Orders link in navbar for authenticated users.

Primary files:
- frontend/src/pages/CartPage.tsx
- frontend/src/pages/CheckoutPage.tsx
- frontend/src/pages/CheckoutPage.module.css
- frontend/src/pages/OrderConfirmationPage.tsx
- frontend/src/pages/OrderConfirmationPage.module.css
- frontend/src/pages/OrderHistoryPage.tsx
- frontend/src/pages/OrderHistoryPage.module.css
- frontend/src/App.tsx
- frontend/src/components/Navbar.tsx

### 4) Frontend Service and Types

- Added order types for request/response mapping.
- Added orders service for:
	- placeOrder()
	- fetchMyOrders()
- Reused authenticated API request pattern for bearer token attachment.

Primary files:
- frontend/src/types/order.ts
- frontend/src/services/ordersService.ts

### 5) Test Coverage Added

- Added backend integration tests for order placement and ownership isolation.
- Added frontend service tests for orders API mapping/error handling.
- Added frontend checkout page validation test.

Primary files:
- backend/HelloWorldApi.Tests/Integration/OrdersIntegrationTests.cs
- frontend/src/services/ordersService.test.ts
- frontend/src/pages/CheckoutPage.test.tsx

## Validation Evidence

Commands run:
- dotnet test ../HelloWorldApi.Tests/HelloWorldApi.Tests.csproj (from backend/HelloWorldApi)
- npm test -- --run (from frontend)

Result summary:
- Backend tests: passed (22 total, 22 passed, 0 failed)
- Frontend tests: passed (26 total, 26 passed, 0 failed)
- Workspace diagnostics: no errors reported for frontend or backend folders

## Notes

- Migration generation required JWT_SIGNING_KEY to be set for startup configuration.
- Implementation kept ownership checks claim-scoped to prevent BOLA risk on history endpoint.
