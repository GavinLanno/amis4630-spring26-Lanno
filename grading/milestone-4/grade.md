# Lab Evaluation Report

**Student Repository**: `GavinLanno-amis4630-spring26-Lanno`  
**Date**: 2026-05-04  
**Rubric**: `grading/milestone-4/rubric.md`

## 0. Build & Run Status

| Component           | Build | Runs | Notes                                                    |
| ------------------- | ----- | ---- | -------------------------------------------------------- |
| Backend (.NET)      | ✅    | ✅   | `dotnet build` succeeded (1 non-critical deprecation warning ASPDEPR005). Server runs on http://localhost:5000. |
| Frontend (React/TS) | ❌    | ✅   | `npm run build` fails — `tsc -b` type error in CheckoutPage.test.tsx (shippingAddress type mismatch). `vite build` alone succeeds. Dev server runs on http://localhost:5173. |
| API Endpoints       | —     | ✅   | GET /api/listings → 200 (8 items); GET /api/cart → 200 (empty cart); POST /api/auth/login → 200 (admin login OK); GET /health → 200 |
| Backend Tests       | —     | ✅   | 27 passed, 0 failed |
| Frontend Tests      | —     | ✅   | 37 passed (11 files), 0 failed |

```
Frontend tsc error:
src/pages/CheckoutPage.test.tsx:84:7 - error TS2322: Type '{ fullName: string; addressLine1: string; 
city: string; stateProvince: string; postalCode: string; country: string; phoneNumber: string; }' 
is not assignable to type 'string'.
```

## 1. Project Structure

| Expected                                        | Found                                                                                                   | Status |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------ |
| Backend .NET project (`backend/HelloWorldApi/`) | `backend/HelloWorldApi/HelloWorldApi.csproj`                                                            | ✅     |
| Frontend React/TS project (`frontend/`)         | `frontend/package.json`, `frontend/src/`                                                                | ✅     |
| Cart model entities                             | `backend/HelloWorldApi/Models/Cart.cs`, `CartItem.cs`                                                   | ✅     |
| Cart controller                                 | `backend/HelloWorldApi/Controllers/CartController.cs`                                                   | ✅     |
| Cart DTOs                                       | `backend/HelloWorldApi/DTOs/CartDto.cs`, `AddToCartDto.cs`, `CartItemDtos.cs`, `UpdateCartItemsDtos.cs` | ✅     |
| Cart context (frontend)                         | `frontend/src/contexts/CartContext.tsx`                                                                 | ✅     |
| Cart reducer (frontend)                         | `frontend/src/reducers/cartReducer.ts`                                                                  | ✅     |
| Cart service (frontend)                         | `frontend/src/services/cartService.ts`                                                                  | ✅     |
| Cart types (frontend)                           | `frontend/src/types/cart.ts`                                                                            | ✅     |
| Cart page (frontend)                            | `frontend/src/pages/CartPage.tsx`                                                                       | ✅     |
| EF Migrations                                   | `backend/HelloWorldApi/Migrations/` (5 migrations present)                                              | ✅     |
| AI usage documentation                          | `docs/AI-USAGE.md`                                                                                      | ✅     |

## 2. Rubric Scorecard

| #   | Requirement                              | Points | Status | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| --- | ---------------------------------------- | ------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1a  | useReducer or Context API for cart state | 2      | ✅ Met | [CartContext.tsx](frontend/src/contexts/CartContext.tsx#L10-L11) — `useReducer(cartReducer, initialCartState)` with `CartProvider` wrapping app. [cartReducer.ts](frontend/src/reducers/cartReducer.ts) — 7-action discriminated union reducer with exhaustive checking.                                                                                                                                                                                                                          |
| 1b  | Add, update quantity, remove operations  | 2      | ✅ Met | [CartContext.tsx](frontend/src/contexts/CartContext.tsx#L209-L340) — `addToCart`, `updateQuantity`, `removeItem`, `clearCart` all implemented with optimistic updates and rollback on failure.                                                                                                                                                                                                                                                                                                    |
| 1c  | Cart count in header + calculated totals | 1      | ✅ Met | [CartBadge.tsx](frontend/src/components/CartBadge/CartBadge.tsx) — `CartBadge` shows `cartItemCount` in navbar. [CartContext.tsx](frontend/src/contexts/CartContext.tsx#L380-L386) — `cartItemCount` and `cartTotal` computed via `useMemo`. [CartPage.tsx](frontend/src/pages/CartPage.tsx#L175) — Cart total and line totals displayed.                                                                                                                                                         |
| 2a  | GET /api/cart                            | 1      | ✅ Met | [CartController.cs](backend/HelloWorldApi/Controllers/CartController.cs#L37) — `[HttpGet]` endpoint returns `CartDto`. Orchestrator confirmed 200 response.                                                                                                                                                                                                                                                                                                                                       |
| 2b  | POST /api/cart (add item)                | 1      | ✅ Met | [CartController.cs](backend/HelloWorldApi/Controllers/CartController.cs#L62) — `[HttpPost]` accepts `AddToCartDto`, creates or increments `CartItem`, returns `CreatedAtAction` (201) for new items or `Ok` (200) for quantity updates.                                                                                                                                                                                                                                                           |
| 2c  | PUT /api/cart/{cartItemId} (update qty)  | 1      | ✅ Met | [CartController.cs](backend/HelloWorldApi/Controllers/CartController.cs#L127) — `[HttpPut("{cartItemId:int}")]` updates `cartItem.Quantity` and saves.                                                                                                                                                                                                                                                                                                                                            |
| 2d  | DELETE endpoints (item + clear)          | 1      | ✅ Met | [CartController.cs](backend/HelloWorldApi/Controllers/CartController.cs#L200) — `[HttpDelete("{cartItemId:int}")]` removes single item. [CartController.cs](backend/HelloWorldApi/Controllers/CartController.cs#L255) — `[HttpDelete("clear")]` removes all items from cart.                                                                                                                                                                                                                      |
| 2e  | Proper status codes and responses        | 1      | ✅ Met | Controller returns 200 (Ok), 201 (CreatedAtAction), 400 (BadRequest with ProblemDetails), 401 (Unauthorized), 404 (NotFound) as appropriate. Validation via FluentValidation in [AddToCartValidator.cs](backend/HelloWorldApi/Validators/AddToCartValidator.cs) and [UpdateCartItemValidator.cs](backend/HelloWorldApi/Validators/UpdateCartItemValidator.cs).                                                                                                                                    |
| 3a  | Cart/CartItem EF entities                | 2      | ✅ Met | [Cart.cs](backend/HelloWorldApi/Models/Cart.cs) — `Id`, `UserId`, `CreatedAt`, `ICollection<CartItem>`. [CartItem.cs](backend/HelloWorldApi/Models/CartItem.cs) — `Id`, `CartId`, `ListingId`, `CategoryId`, `Quantity` with FK properties.                                                                                                                                                                                                                                                       |
| 3b  | Relationships and navigation properties  | 1      | ✅ Met | [CartItem.cs](backend/HelloWorldApi/Models/CartItem.cs#L17-L22) — Navigation properties `Cart`, `Listing`, `Category` with corresponding FK fields. [LisitngContext.cs](backend/HelloWorldApi/Data/LisitngContext.cs) — `DbSet<Cart>`, `DbSet<CartItem>` registered. GuestSession→Cart cascade configured in `OnModelCreating`.                                                                                                                                                                   |
| 3c  | Migrations applied, data persists        | 1      | ✅ Met | 5 migrations present in `Migrations/` folder. Orchestrator confirmed GET /api/cart returns 200. Backend builds and runs with SQLite.                                                                                                                                                                                                                                                                                                                                                              |
| 4a  | Real API replaces mock/localStorage      | 2      | ✅ Met | [cartService.ts](frontend/src/services/cartService.ts) — All cart functions (`fetchCart`, `addCartItem`, `updateCartItem`, `removeCartItem`, `clearCart`) call `API_BASE_URL/cart` via `apiRequest`. No localStorage or mock data used for cart state.                                                                                                                                                                                                                                            |
| 4b  | All cart operations call API             | 2      | ✅ Met | [CartContext.tsx](frontend/src/contexts/CartContext.tsx) — Every operation (`addToCart`, `updateQuantity`, `removeItem`, `clearCart`) invokes the corresponding service function, then dispatches success/failure based on API response.                                                                                                                                                                                                                                                          |
| 4c  | State synchronization                    | 1      | ✅ Met | Optimistic update pattern: `APPLY_OPTIMISTIC_CART` dispatched before API call, `SYNC_CART_SUCCESS` on success, `SYNC_CART_FAILURE` rolls back to snapshot on failure. Initial load via `fetchCart` on mount.                                                                                                                                                                                                                                                                                      |
| 5a  | Loading states                           | 1      | ✅ Met | [CartPage.tsx](frontend/src/pages/CartPage.tsx#L49-L58) — Shows "Loading your cart" section when `state.isLoading`. [CartBadge.tsx](frontend/src/components/CartBadge/CartBadge.tsx#L9-L10) — Shows "..." while loading. [AddToCartButton.tsx](frontend/src/components/AddToCartButton/AddToCartButton.tsx#L72) — Button shows "Loading Cart..." and is disabled while loading. [CartPage.tsx](frontend/src/pages/CartPage.tsx#L105) — "Saving cart changes to the backend..." syncing indicator. |
| 5b  | Error messages and edge cases            | 1      | ✅ Met | [CartPage.tsx](frontend/src/pages/CartPage.tsx#L108-L119) — Error message displayed with `role="alert"` and dismiss button. [AddToCartButton.tsx](frontend/src/components/AddToCartButton/AddToCartButton.tsx#L78-L81) — Per-button error display. [cartReducer.ts](frontend/src/reducers/cartReducer.ts#L68-L77) — `SYNC_CART_FAILURE` rolls back and sets error message. Edge cases: empty cart state, quantity bounds (1–99), non-existent listings (404 handling).                            |
| 5c  | Success feedback                         | 1      | ✅ Met | [AddToCartButton.tsx](frontend/src/components/AddToCartButton/AddToCartButton.tsx#L56-L60) — Shows "Successfully Added" text for 1.5s after successful add. Button text changes to confirm action.                                                                                                                                                                                                                                                                                                |
| 6a  | Clean component structure                | 1      | ✅ Met | Components organized in folders (`AddToCartButton/`, `CartBadge/`). Pages in `pages/`. CSS Modules used throughout (`CartPage.module.css`, `AddToCartButton.module.css`, `CartBadge.module.css`). Types in `types/cart.ts`.                                                                                                                                                                                                                                                                       |
| 6b  | Service layer / custom hooks             | 1      | ✅ Met | [cartService.ts](frontend/src/services/cartService.ts) — Dedicated service file with `fetchCart`, `addCartItem`, `updateCartItem`, `removeCartItem`, `clearCart`. [apiRequest.ts](frontend/src/services/apiRequest.ts) — Shared authenticated fetch wrapper. Cart context acts as a custom hook via `useCartContext()`.                                                                                                                                                                           |
| 6c  | AI usage documented                      | 1      | ✅ Met | [AI-USAGE.md](docs/AI-USAGE.md) — Extensive multi-section documentation covering cart, auth, orders, and admin implementations with file indices, decisions, validation evidence, and scope notes.                                                                                                                                                                                                                                                                                                |

**Total: 25 / 25**

## 3. Detailed Findings

All rubric items are met. No deficiencies to report.

## 4. Action Plan

No corrective actions required — full marks earned.

## 5. Code Quality Coaching (Non-Scoring)

- **DbContext naming typo**: [LisitngContext.cs](backend/HelloWorldApi/Data/LisitngContext.cs) — The file and class are named `LisitngContext` (missing "i" in "Listing"). Consider renaming to `ListingContext` for clarity; this propagates across DI registrations and controller constructors.

- **Authorize on PUT/DELETE but not POST**: [CartController.cs](backend/HelloWorldApi/Controllers/CartController.cs) — `[HttpPut]` and `[HttpDelete]` require `[Authorize]` while `[HttpPost]` does not. This is intentional (guest add-to-cart), but worth documenting the design decision in code comments to avoid confusion.

- **Frontend build type error**: [CheckoutPage.test.tsx](frontend/src/pages/CheckoutPage.test.tsx) — `tsc -b` reports a type error in this test file, causing `npm run build` (which runs tsc before vite build) to fail. While `vite build` alone succeeds and tests pass, fixing the type error would ensure a clean CI build.

- **Missing SUBMISSION.md**: The rubric for future milestones expects a `SUBMISSION.md` with test credentials. Admin credentials were found in `docs/AI-USAGE.md` instead. Creating a dedicated submission file would streamline grading.

- **Optimistic update race condition**: [CartContext.tsx](frontend/src/contexts/CartContext.tsx) — The `useCallback` dependencies include the full `state` object. Rapid sequential operations could use stale snapshots. Consider using `useRef` for the latest state or a queue pattern for sequential operations.

## 6. Git Practices Coaching (Non-Scoring)

- **AI usage log as commit history supplement**: The `AI-USAGE.md` file contains detailed logs of what was implemented in each session, which is valuable. Complement this with meaningful commit messages that reference rubric items (e.g., "M4: Add cart API endpoints") to make the git log itself self-documenting.

- **Incremental milestones**: The AI-USAGE.md shows work progressing through cart → auth → orders → admin in distinct sessions. Ensure each of these is reflected as separate commits in the git history rather than a single large commit, which makes code review and rollback easier.

---

**25/25** — All milestone 4 rubric items are fully met. The coaching notes above (DbContext naming, authorize consistency, build type error, submission file, optimistic update pattern, git practices) are suggestions for professional growth, not scoring deductions.
