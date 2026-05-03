# Lab Evaluation Report

**Student Repository**: `GavinLanno/amis4630-spring26-Lanno`  
**Date**: March 22, 2026  
**Rubric**: `grading/milestone-3/rubric.md`

## 1. Build & Run Status

| Component           | Build | Runs | Notes                                                                                            |
| ------------------- | ----- | ---- | ------------------------------------------------------------------------------------------------ |
| Backend (.NET)      | ✅    | ✅   | `dotnet build` succeeded. Server starts on `http://localhost:5000`.                              |
| Frontend (React/TS) | ✅    | ✅   | `tsc -b && vite build` succeeded. Vite dev server starts on `http://localhost:5173`.             |
| API Endpoints       | —     | ✅   | `GET /api/listings` → 200 (8 items). `GET /api/listings/1` → 200. `GET /api/listings/999` → 404. |

### Project Structure Comparison

| Expected    | Found       | Status |
| ----------- | ----------- | ------ |
| `/backend`  | `/backend`  | ✅     |
| `/frontend` | `/frontend` | ✅     |
| `/docs`     | `/docs`     | ✅     |

## 2. Rubric Scorecard

| #   | Requirement                          | Points | Status | Evidence                                                                                                                                                                                                                                               |
| --- | ------------------------------------ | ------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | React Product List Page              | 5      | ✅ Met | `ListingsPage.tsx` renders listing count, `ListingGrid.tsx` handles empty state (L12-20), `ListingCard.tsx` shows all fields (address, price, description, category, seller, date, image). Loading/error states handled in `App.tsx` L32-33.           |
| 2   | React Product Detail Page            | 5      | ✅ Met | Separate route `/listings/:id` in `App.tsx` L49. `ListingDetailPage.tsx` uses `useParams` for routing. All fields displayed in `ListingDetail.tsx`. Back navigation via `useNavigate('/')`. Not-found state handled in `Listingdetailpage.tsx` L18-27. |
| 3   | API Endpoint: GET /api/products      | 5      | ✅ Met | `ListingsController.cs` L12-15 — `GetListings()` returns `Ok(ListingStore.Listings)`. Verified: HTTP 200, JSON array of 8 items. In-memory data store in `LisitngStore.cs`.                                                                            |
| 4   | API Endpoint: GET /api/products/{id} | 5      | ✅ Met | `ListingsController.cs` L18-28 — `GetListingById(int id)` with `[HttpGet("{id:int}")]`. Returns 200 for valid ID, 404 with message for unknown ID. Verified: `/api/listings/1` → 200, `/api/listings/999` → 404.                                       |
| 5   | Frontend-to-API Integration          | 5      | ✅ Met | `App.tsx` L17-30 — `fetch('https://localhost:7000/api/listings')` retrieves live data. No hardcoded data in components. Error state handled in catch block (L26-28) with user-facing message. Loading state in L32.                                    |

**Total: 25 / 25**

## 3. Detailed Findings

All rubric items are met. No deficiencies to report.

## 4. Action Plan

No corrective actions required — full marks earned.

## 5. Code Quality Coaching (Non-Scoring)

- **Typo in filename**: `Data/LisitngStore.cs` — "Lisitng" should be "Listing". Consistent naming helps teammates and tooling find files quickly.

- **HTTPS hardcoded in fetch URL**: `App.tsx` line 17 uses `https://localhost:7000` while the backend is configured to listen on `http://localhost:5000` (the `http` launch profile). This means the frontend only works when the backend runs with the `https` profile. Consider using an environment variable or Vite proxy to make the base URL configurable and avoid TLS certificate issues in development.

- **`<head>` tag inside React component**: `App.tsx` lines 38-41 place a `<head>` element inside the component JSX. React does not manage the document `<head>` this way — the title and favicon should be set in `index.html` or via a library like `react-helmet`.

- **All data fetched at App level**: `App.tsx` fetches all listings once and passes the full array down. For the detail page this means the listing is found client-side from the full list rather than fetching by ID from the API. This works at small scale but would not scale well — consider fetching individual items from `/api/listings/{id}` in the detail page.

- **No Vite proxy configured**: `vite.config.ts` does not set up an API proxy. Configuring `server.proxy` to forward `/api` requests to the backend would eliminate CORS complexity and the hardcoded backend URL.

## 6. Git Practices Coaching (Non-Scoring)

- **Vague commit messages**: Messages like "Syncing my computer with github" and "Add files via upload" do not describe what changed. Prefer descriptive messages such as "Add ListingsController with GET endpoints" or "Create ListingDetail page with routing".

- **Large, infrequent commits**: The bulk of milestone 3 work appears in a small number of commits. Smaller, incremental commits (e.g., one for the model, one for the controller, one for each page) make it easier to review history and roll back changes.

---

**25/25** — All rubric requirements are fully met. The coaching notes above (filename typo, hardcoded HTTPS URL, `<head>` in JSX, data fetching strategy, Vite proxy, git practices) are suggestions for professional growth, not scoring deductions.
