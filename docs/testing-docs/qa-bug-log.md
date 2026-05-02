# QA Bug Log

Date: 2026-05-01
Project: Buckeye Sublease

## Bug 1: Missing web root blocked backend startup

- Severity: High
- Area: Backend startup and automated test infrastructure
- Environment: local backend integration tests and Playwright backend `webServer`
- Symptom: backend startup failed before tests could execute because the expected static web root path was missing.
- Reproduction summary: start backend tests or Playwright with the backend project before `backend/HelloWorldApi/wwwroot/` exists.
- Fix:
  - Added `backend/HelloWorldApi/wwwroot/.gitkeep`
- Retest status: Fixed
- Evidence:
  - `dotnet test backend/HelloWorldApi.Tests/HelloWorldApi.Tests.csproj` passed `27/27`
  - Playwright backend startup succeeded in later runs

## Bug 2: Checkout could redirect back to cart after successful order placement

- Severity: High
- Area: Frontend checkout flow
- Environment: slower browser execution, reproduced during WebKit-focused Playwright work
- Symptom: after clicking `Place order`, the user could briefly hit the confirmation route and then be redirected back to `/cart`.
- Root cause summary: cart state was cleared before navigation fully settled, and the `CheckoutPage` empty-cart guard redirected while the confirmation transition was still in progress.
- Fix:
  - Updated `frontend/src/pages/CheckoutPage.tsx`
  - Added `submittedOrderId` tracking to suppress the empty-cart redirect after successful submission
- Additional regression coverage:
  - Added a component test in `frontend/src/pages/CheckoutPage.test.tsx`
- Retest status: Fixed
- Evidence:
  - `npm run test:e2e -- --project=webkit e2e/checkout.spec.ts` passed on 2026-05-01
  - `npm run test:e2e` full matrix passed on 2026-05-01
  - `npm test` passed with `37/37` frontend tests

## Open Risks

- No open blocking defects remain from this QA pass.
- Coverage is strongest on happy paths; negative-path handling remains a follow-up area rather than a known failing bug.
