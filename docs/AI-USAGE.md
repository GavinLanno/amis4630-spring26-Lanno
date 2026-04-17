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
