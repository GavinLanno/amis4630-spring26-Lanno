# QA Test Plan: M4 Cart and Checkout Stabilization

Date: 2026-05-01
Application: Buckeye Sublease
Scope: M4 cart, checkout, order history, and admin management regression verification.

## Objectives

- Verify the shopper path from registration through order history.
- Verify admin listing management and order status updates.
- Confirm the checkout redirect race is fixed across supported Playwright browser targets.
- Capture final evidence and residual risk for submission.

## In Scope

- User registration and login for test users
- Listing browse flow
- Add-to-cart flow
- Checkout form completion and order placement
- Order confirmation and order history visibility
- Admin dashboard access
- Admin listing create, update, and delete operations
- Admin order status update UI
- Checkout redirect regression coverage in unit tests

## Out of Scope

- Authentication milestone beyond current seeded/admin coverage
- Payment integration
- Non-local deployment environments
- Performance/load testing
- Accessibility audit beyond baseline role/label assertions in automated tests

## Test Environments

- OS: Windows local development machine
- Frontend: Vite dev server on `http://localhost:5173`
- Backend: .NET Web API on local test port `http://127.0.0.1:7001` during Playwright
- Database: local development database
- Date of execution: 2026-05-01

## Browsers and Devices

- `chromium` using Playwright Desktop Chrome
- `firefox` using Playwright Desktop Firefox
- `webkit` using Playwright Desktop Safari
- `mobile-chrome` using Playwright Pixel 5 emulation

## Entry Criteria

- Frontend dependencies installed
- Playwright browsers installed, including Firefox and WebKit
- Backend startup issue resolved by committed `wwwroot` placeholder
- Seeded admin account available in local development data

## Exit Criteria

- Frontend lint passes
- Frontend unit/component tests pass
- Playwright full matrix passes with no unexpected failures
- Known defects are documented with retest status
- Remaining risks are documented

## Pass/Fail Criteria

- Pass: expected route, UI state, and persisted order/listing behavior are observed without console-breaking test failures.
- Fail: any blocking defect prevents order placement, order confirmation visibility, order history visibility, admin CRUD, or order-status update flow.
- Partial: a scenario passes only in some browser targets or depends on manual workaround.

## Automated Coverage Executed

- Frontend lint: `npm run lint`
- Frontend unit/component tests: `npm test`
- Playwright targeted WebKit checkout rerun: `npm run test:e2e -- --project=webkit e2e/checkout.spec.ts`
- Playwright full matrix: `npm run test:e2e`
- Backend regression reference: `dotnet test backend/HelloWorldApi.Tests/HelloWorldApi.Tests.csproj`

## Final Execution Result

- Frontend lint: Passed
- Frontend unit/component tests: Passed
- Backend automated tests: Passed in prior completed rerun
- Playwright matrix: Passed with `9 passed, 3 skipped`
- Skips: intentional mobile-only checkout test skips on `chromium`, `firefox`, and `webkit`

## Remaining Risks

- Backend automated tests were not rerun in this continuation after the final frontend-only changes, though the changed files were isolated to frontend QA work and the prior backend run was green.
- Playwright runs against a single local backend/database with `workers: 1`; parallelism-related issues in multi-user or CI-shared environments remain untested.
- The suite exercises the happy-path admin order status update but does not deeply validate every possible status transition or failure response.

## Final Checklist

- Completed: WebKit checkout rerun after `CheckoutPage` fix
- Completed: Full Playwright matrix rerun across desktop and mobile targets
- Completed: QA bug found, fixed, and retested
- Completed: Frontend lint rerun
- Completed: Frontend unit/component tests rerun
- Completed: QA evidence and bug log documentation
- Partially Completed: Backend verification is based on the prior completed rerun rather than a duplicate rerun in this continuation
- Not Completed: Expanded negative-path admin and checkout API failure scenarios
