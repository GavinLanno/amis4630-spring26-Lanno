# E2E Run Notes (Playwright MCP)

Date: 2026-04-17

## Prompt(s) used with Copilot agent mode

1. "Create one Playwright E2E happy-path spec for register -> login -> browse -> add to cart -> checkout -> order history in frontend/e2e/checkout.spec.ts. Use stable role/label selectors and fail fast with explicit assertions."
2. "Add minimal Playwright setup so the spec is rerunnable with npx playwright test, and include snapshots after each major step."

## First failure encountered

Latest run reached the test but failed in Step 1 (Register/Login) because the app could not load listings from the backend API.

Observed terminal errors:

- Vite proxy error on /api/listings with ECONNREFUSED.
- Step timeout while waiting for the register toggle button on /auth, because the app stayed in a loading/error state.

This was the first failed checkpoint in the happy path.

## What was corrected

1. Added a minimal Playwright config that starts only the Vite frontend dev server for E2E runs.
2. Set browser-level ignoreHTTPSErrors to tolerate local self-signed HTTPS while the frontend calls backend APIs.
3. Kept backend startup out of Playwright webServer to avoid TLS trust deadlock in startup checks.
4. Added one fail-fast happy-path spec with explicit step assertions and screenshots after each major step.
5. Added explicit note that backend API must be running before executing the E2E flow.

## Re-run command

From frontend:

- `npx playwright test e2e/checkout.spec.ts`

Or with npm script:

- `npm run test:e2e`

## Notes

- Backend API must be available for the flow to pass because app routes proxy `/api` to `https://localhost:7000` in Vite config.
- If the run fails, the first failed Playwright step indicates the exact checkpoint that did not meet expectations.
