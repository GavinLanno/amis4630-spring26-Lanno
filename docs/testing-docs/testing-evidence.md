# Testing Evidence: M4 QA Stabilization

Date: 2026-05-01
Scope: checkout stabilization, admin E2E coverage, cross-browser Playwright verification, and checkout regression coverage.

## Commands Run

### Frontend

1. `npm run lint`
   - Result: Passed.

2. `npm test`
   - Result: Passed.
   - Summary: 11 files, 37 tests passed.
   - Note: this run required execution outside the sandbox because Vite/Vitest process spawning hit `spawn EPERM` under sandbox restrictions.

3. `npm run test:e2e -- --project=webkit e2e/checkout.spec.ts`
   - Result: Passed.
   - Summary: 1 passed, 1 skipped.
   - Purpose: re-verify the `CheckoutPage` redirect fix in WebKit after the interrupted prior run.

4. `npm run test:e2e`
   - Result: Passed.
   - Summary: 9 passed, 3 skipped.
   - Exact matrix:
     - `chromium`: admin passed, checkout passed, mobile-only checkout test skipped
     - `firefox`: admin passed, checkout passed, mobile-only checkout test skipped
     - `webkit`: admin passed, checkout passed, mobile-only checkout test skipped
     - `mobile-chrome`: admin passed, checkout passed, mobile viewport checkout passed

### Backend

1. `dotnet test backend/HelloWorldApi.Tests/HelloWorldApi.Tests.csproj`
   - Result: Passed.
   - Summary: 27 of 27 tests passed.
   - Evidence source: completed run from the immediately preceding QA session after adding `backend/HelloWorldApi/wwwroot/.gitkeep`. This command was not rerun in this continuation because the current work only changed frontend code and QA docs.

## Defects Found and Retest Outcome

### Checkout redirect race

- Symptom: after placing an order, slower browsers could briefly navigate to the confirmation route and then bounce back to `/cart`.
- Root cause: `clearCart()` could empty cart state before navigation settled, triggering the empty-cart redirect in `CheckoutPage`.
- Fix:
  - `frontend/src/pages/CheckoutPage.tsx`
  - Added `submittedOrderId` state and used it to suppress the empty-cart redirect after a successful order submission.
- Retest:
  - WebKit checkout rerun on 2026-05-01 passed.
  - Full Playwright matrix rerun on 2026-05-01 passed.
  - Added unit regression coverage in `frontend/src/pages/CheckoutPage.test.tsx`.

### Backend startup blocker

- Symptom: backend integration tests and Playwright backend startup failed because the static web root path was missing.
- Fix:
  - `backend/HelloWorldApi/wwwroot/.gitkeep`
- Retest:
  - Backend tests passed: 27 of 27.
  - Playwright backend `webServer` startup succeeded in subsequent browser runs.

## Evidence Notes

- Playwright evidence artifacts exist under `frontend/test-results/`.
- The three skipped Playwright tests are intentional. The `mobile viewport: checkout flow remains usable` case is guarded with `test.skip(!testInfo.project.name.includes('mobile'))`, so it only executes in the `mobile-chrome` project.
- No failing tests remain in the final rerun set recorded here.

## Final Status

- Frontend lint: Passed
- Frontend unit/component tests: Passed
- Frontend Playwright matrix: Passed
- Backend automated tests: Passed from prior completed run
- QA stabilization target for checkout redirect race: Verified fixed
