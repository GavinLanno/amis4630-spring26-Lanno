# Lab Evaluation Report

**Student Repository**: `GavinLanno-amis4630-spring26-Lanno`  
**Date**: 2026-05-04  
**Rubric**: `grading/milestone-6/rubric.md`

## 0. Build & Run Status

| Component           | Build | Runs | Notes                                                                                                                                                                        |
| ------------------- | ----- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Backend (.NET)      | ✅    | ✅   | `dotnet build` succeeded (1 non-critical deprecation warning ASPDEPR005). Server runs on http://localhost:5000.                                                              |
| Frontend (React/TS) | ❌    | ✅   | `npm run build` fails — `tsc -b` type error in CheckoutPage.test.tsx (shippingAddress type mismatch). `vite build` alone succeeds. Dev server runs on http://localhost:5173. |
| API Endpoints       | —     | ✅   | GET /api/listings → 200 (8 items); GET /api/cart → 200 (empty cart); POST /api/auth/login → 200 (admin login OK); GET /health → 200                                          |
| Backend Tests       | —     | ✅   | 27 passed, 0 failed                                                                                                                                                          |
| Frontend Tests      | —     | ✅   | 37 passed (11 files), 0 failed                                                                                                                                               |

```
Frontend tsc error:
src/pages/CheckoutPage.test.tsx:84:7 - error TS2322: Type '{ fullName: string; addressLine1: string;
city: string; stateProvince: string; postalCode: string; country: string; phoneNumber: string; }'
is not assignable to type 'string'.
```

## 1. Project Structure

### Project Structure Comparison

| Expected                                                                              | Found                                                                   | Status |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------ |
| `infra/main.bicep`                                                                    | `infra/main.bicep`                                                      | ✅     |
| `infra/modules/` (workload, app-service, static-web-app, app-insights, log-analytics) | All 5 Bicep modules present                                             | ✅     |
| `infra/main.dev.bicepparam`                                                           | `infra/main.dev.bicepparam`                                             | ✅     |
| `infra/main.prod.bicepparam`                                                          | `infra/main.prod.bicepparam`                                            | ✅     |
| `infra/bootstrap/` (OIDC setup scripts)                                               | `infra/bootstrap/setup-oidc.ps1`, `setup-oidc.sh`                       | ✅     |
| `.github/workflows/` (CI/CD pipelines)                                                | `deploy-api.yml`, `azure-static-web-apps-agreeable-cliff-0d1ba470f.yml` | ✅     |
| `docs/architecture.md`                                                                | `docs/architecture.md`                                                  | ✅     |
| `docs/database-schema.md`                                                             | `docs/database-schema.md`                                               | ✅     |
| `docs/user-doc/`                                                                      | `docs/user-doc/web nav guide.md`                                        | ✅     |
| `docs/testing-docs/`                                                                  | `docs/testing-docs/` (4 files)                                          | ✅     |
| `docs/AI usage reflection.md`                                                         | `docs/AI usage reflection.md`                                           | ✅     |
| `docs/AI-USAGE.md`                                                                    | `docs/AI-USAGE.md`                                                      | ✅     |
| `frontend/e2e/` (E2E specs)                                                           | `e2e/checkout.spec.ts`, `e2e/admin.spec.ts`                             | ✅     |
| Backend tests                                                                         | `HelloWorldApi.Tests/` (Unit + Integration)                             | ✅     |
| Frontend tests                                                                        | 11 test files (`.test.ts`/`.test.tsx`)                                  | ✅     |
| `README.md` (with live URLs, setup, env vars)                                         | `README.md`                                                             | ✅     |

## 2. Rubric Scorecard

| #   | Requirement                                                                 | Points | Status     | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --- | --------------------------------------------------------------------------- | ------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | **Production Deployment** — Flawless deployment, HTTPS, professional setup  | 5      | ✅ Met     | Full Bicep IaC suite in `infra/` — `main.bicep` (L1-42) provisions resource group; `modules/workload.bicep` composes App Service (Linux, .NET 10, HTTPS-only, TLS 1.2, FTPS disabled, health check), Static Web App, App Insights, Log Analytics. App Service template enforces `httpsOnly: true`, `minTlsVersion: '1.2'`, `ftpsState: 'Disabled'` in `modules/app-service.bicep` (L62-66). CORS configured dynamically from SWA hostname. Frontend SWA config at `frontend/staticwebapp.config.json`. Live URLs documented in `README.md` (L159-161): frontend at `agreeable-cliff-0d1ba470f.7.azurestaticapps.net`, backend at `buckeye-sublease-api-0293.azurewebsites.net`. Dev and prod param files present. Bootstrap OIDC scripts for GitHub federation in `infra/bootstrap/`.                                                                        |
| 2   | **CI/CD Pipeline** — Automated pipeline working perfectly                   | 4      | ✅ Met     | Two GitHub Actions workflows: (1) `.github/workflows/deploy-api.yml` — triggers on push to `main`, builds .NET Release, runs tests, publishes artifact, deploys to Azure App Service via `azure/webapps-deploy@v3`. (2) `.github/workflows/azure-static-web-apps-agreeable-cliff-0d1ba470f.yml` — triggers on push/PR to `main`, builds and deploys frontend via `Azure/static-web-apps-deploy@v1` with `VITE_API_URL` env injection. Close-PR job included. Both workflows are fully automated with build, test, and deploy stages.                                                                                                                                                                                                                                                                                                                         |
| 3   | **Testing & QA** — Comprehensive testing, well-documented                   | 4      | ✅ Met     | **Backend**: 27 tests pass (2 unit test files in `Unit/`, 6 integration test files in `Integration/` including auth, cart authorization, admin features, orders, role access). **Frontend**: 37 tests pass across 11 files covering reducers, services, pages, components. **E2E**: 2 Playwright specs (`checkout.spec.ts` — full happy path; `admin.spec.ts` — admin CRUD + order status). Cross-browser matrix (Chromium, Firefox, WebKit, mobile-chrome) — 9 passed, 3 intentional skips. **QA docs**: `docs/testing-docs/qa-test-plan.md`, `testing-evidence.md`, `qa-bug-log.md`, `e2e-run.md` all present and detailed. Bug log documents 2 bugs found, fixed, and retested. E2E snapshot evidence exists in `frontend/test-results/e2e-snapshots/` (55+ screenshots across browsers). Testing folder has 8 SKILL.md-documented test scenario folders. |
| 4   | **Technical Docs** — Excellent documentation, comprehensive                 | 5      | ✅ Met     | `docs/architecture.md` — full system diagram (Mermaid flowchart), request/state flow for listings, cart, auth, orders, admin, and deployment shape. `docs/database-schema.md` — complete ERD (Mermaid) with all 9 entities, relationships, field types, and implementation notes. `README.md` — comprehensive project overview with tech stack and versions, local setup (backend, frontend, DB), expected URLs, frontend-backend wiring, deployment instructions (Bicep flow), live URLs, API docs/Swagger, full environment variables table with defaults and recommendations. `CHANGELOG.md` present. `docs/README.md` serves as index.                                                                                                                                                                                                                   |
| 5   | **User Docs** — Professional user guide with screenshots                    | 4      | ⚠️ Partial | `docs/user-doc/web nav guide.md` — thorough step-by-step guide covering 5 user flows (browse, add to cart, auth, checkout, order history) and 2 admin flows (product management, order status). Each section has numbered steps and is well-structured. **However**, all screenshot positions contain only placeholder text (e.g., `[Screenshot Placeholder: ...]`) — no actual images are embedded in the document. While E2E snapshot PNGs exist in `frontend/test-results/e2e-snapshots/`, they are not linked into the user guide. The rubric's "Excellent" tier explicitly requires "screenshots". This drops the score to the Good tier. **Score: 3/4.**                                                                                                                                                                                               |
| 6   | **AI Reflection** — Insightful reflection, specific examples, deep analysis | 3      | ✅ Met     | `docs/AI usage reflection.md` — ~1,200-word reflection organized into 7 sections: Copilot usage, Claude usage across SDLC phases, specific examples, what worked, what didn't, productivity/learning impact, lessons learned. Provides concrete examples (auth UI, command translation, minimal-plan approach). Demonstrates deep analysis: discusses token efficiency, agent structuring, garbage-in/garbage-out, systems thinking. `docs/AI-USAGE.md` supplements with a concrete log of the auth UI implementation showing prompts, decisions, files changed, and tests added.                                                                                                                                                                                                                                                                            |

**Total: 24 / 25**

## 3. Detailed Findings

### Item #5: User Docs

**What was expected**: Professional user guide with screenshots (Excellent tier requires actual embedded images demonstrating the application).

**What was found**: The user guide at [docs/user-doc/web nav guide.md](docs/user-doc/web%20nav%20guide.md) contains excellent written content — 7 complete workflows with numbered steps covering all major features. However, every screenshot position contains only placeholder text like `[Screenshot Placeholder: Home page showing available property listings]`. The document itself notes it is "structured so screenshots can be added before submission" (L3) and includes a "Suggested Screenshot Capture List" at the bottom. Actual E2E screenshots exist in [frontend/test-results/e2e-snapshots/](frontend/test-results/e2e-snapshots/) (55+ PNGs across 4 browser targets) but are not embedded in the user doc.

**Gap**: Screenshots need to be inserted into the user guide in place of the placeholder text. The E2E snapshots already provide suitable images (e.g., `chromium-step-2-browse-products.png` for the browsing section, `chromium-step-3-added-to-cart.png` for the cart section, etc.).

## 4. Action Plan

1. **[1pt] User Docs — Screenshots**: Replace the `[Screenshot Placeholder: ...]` entries in `docs/user-doc/web nav guide.md` with actual image references. The E2E snapshots in `frontend/test-results/e2e-snapshots/` can be copied or linked. Add Markdown image syntax (e.g., `![Browse listings](../../frontend/test-results/e2e-snapshots/chromium-step-2-browse-products.png)`) for each placeholder.

## 5. Code Quality Coaching (Non-Scoring)

- **Placeholder JWT signing key in Bicep**: [infra/modules/app-service.bicep](infra/modules/app-service.bicep#L103) contains `'ChangeMe-In-Portal-Or-GitHub-Secret'` as the default `JWT_SIGNING_KEY`. While this is noted as a placeholder, it would be more secure to use a `@secure()` parameter or Key Vault reference so no signing key value appears in source control at all.

- **Frontend `tsc` build error**: The orchestrator reported that `npm run build` (which runs `tsc -b`) fails due to a type error in `src/pages/CheckoutPage.test.tsx`. While `vite build` succeeds independently, the TypeScript compilation error should be resolved so the full build pipeline passes cleanly.

- **`continue-on-error` on test step**: [.github/workflows/deploy-api.yml](.github/workflows/deploy-api.yml#L23) has `continue-on-error: true` on the test step with a comment "remove once you have tests." Since 27 backend tests now exist and pass, this flag should be removed so test failures actually block deployment.

- **Admin seed password in Bicep**: [infra/modules/app-service.bicep](infra/modules/app-service.bicep#L103) contains `'ChangeMe123!'` as the admin seed password in plain text. Consider using a `@secure()` parameter or Azure Key Vault to avoid committing credentials.

- **CORS credential support**: The App Service Bicep enables `supportCredentials: true` for CORS. This is appropriate only if the frontend actually sends credentials (cookies/auth headers) cross-origin. Verify this is intentional and not overly permissive.

## 6. Git Practices Coaching (Non-Scoring)

- **Changelog maintenance**: The `CHANGELOG.md` only documents entries from 2026-04-17 and does not cover the M5 or M6 work. Keeping the changelog up to date across milestones makes it easier for reviewers and future maintainers to understand project evolution.

- **v1.0 tag**: The rubric submission guidelines specify "Push all final code to GitHub repository (tagged as v1.0)." No `v1.0` reference was found in the `CHANGELOG.md`. The tag may exist on the remote but should be verified to ensure compliance with submission guidelines.

---

**24/25** — Near-full marks earned. The only gap is that the user guide contains screenshot placeholders rather than actual embedded images, costing 1 point from the User Docs criterion. The coaching notes above (placeholder secrets in Bicep, `continue-on-error` flag, `tsc` build error, changelog currency) are suggestions for professional growth, not scoring deductions.
