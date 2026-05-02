# Buckeye Sublease

Buckeye Sublease is a full-stack marketplace application for browsing housing listings, managing a cart, authenticating users, and placing orders through a React frontend and an ASP.NET Core API. The frontend is designed for local development on `http://localhost:5173`, and the backend serves the REST API and Swagger UI from `https://localhost:7000`.

## Project Description

The application combines a Vite-based React client with a .NET Web API and EF Core data layer. Users can browse active listings, view listing details, keep a guest or authenticated cart, register and log in with JWT-based authentication, place orders, review their order history, and access admin-only listing and order management features. In production, the frontend is deployed separately from the API, with Azure infrastructure defined in Bicep under [`infra/`](./infra).

## Core Features

- Browse active property listings from `GET /api/listings`
- View a single listing detail page
- Maintain a guest cart with session-based cart identity
- Log in or register with JWT authentication and refresh tokens
- Place authenticated orders and view order history
- Manage listings and order statuses through admin-only endpoints and UI
- Serve backend health and Swagger/OpenAPI docs in development
- Deploy frontend and backend independently to Azure

## Technology Stack With Versions

### Frontend

- React `19.2.0`
- React DOM `19.2.0`
- React Router DOM `7.13.1`
- TypeScript `5.9.3`
- Vite `8.0.0-beta.13`
- `@vitejs/plugin-react` `5.1.1`
- ESLint `9.39.1`
- Vitest `3.2.4`
- Playwright `1.59.1`

### Backend

- ASP.NET Core targeting `net10.0`
- AutoMapper `16.1.1`
- FluentValidation `12.1.1`
- `Microsoft.AspNetCore.Authentication.JwtBearer` `10.0.6`
- `Microsoft.AspNetCore.OpenApi` `10.0.2`
- Entity Framework Core `10.0.5`
- EF Core InMemory provider `10.0.5`
- EF Core SQLite provider `10.0.5`
- Swashbuckle `10.1.2`
- SQLite development database via `ConnectionStrings__DefaultConnection`

### Testing

- xUnit `2.9.3`
- `Microsoft.AspNetCore.Mvc.Testing` `10.0.5`
- FluentAssertions `8.9.0`
- `Microsoft.NET.Test.Sdk` `17.14.1`

## Local Setup Instructions

### Prerequisites

- Node.js with npm
- .NET SDK `10.0.x`
- A trusted ASP.NET Core HTTPS development certificate

### Backend setup

1. Restore packages:

```powershell
dotnet restore .\workshop-4-lab.sln
```

2. Set the required JWT signing key for local development. User Secrets are the safest local option because `backend/HelloWorldApi/HelloWorldApi.csproj` already has a `UserSecretsId`:

```powershell
dotnet user-secrets --project .\backend\HelloWorldApi\HelloWorldApi.csproj set "JWT_SIGNING_KEY" "replace-with-a-long-random-local-key"
```

3. Optional local overrides can also be stored in User Secrets:

```powershell
dotnet user-secrets --project .\backend\HelloWorldApi\HelloWorldApi.csproj set "ADMIN_SEED_PASSWORD" "AdminPass1"
dotnet user-secrets --project .\backend\HelloWorldApi\HelloWorldApi.csproj set "Cors:AllowedOrigins" "http://localhost:5173"
```

4. Build the backend:

```powershell
dotnet build .\backend\HelloWorldApi\HelloWorldApi.csproj
```

5. Run the backend with the launch profile that serves the API on `https://localhost:7000`:

```powershell
dotnet run --project .\backend\HelloWorldApi\HelloWorldApi.csproj --launch-profile http
```

### Database startup behavior

- By default, the API uses SQLite with `ConnectionStrings__DefaultConnection`.
- On startup, the app runs `Database.Migrate()` when `UseInMemoryDatabase` is `false` or unset.
- If `UseInMemoryDatabase=true`, the app switches to EF Core InMemory and calls `EnsureCreated()`. This is mainly useful for tests.
- Startup also seeds an admin user if one does not already exist.

### Frontend setup

1. Install dependencies:

```powershell
cd .\frontend
npm install
```

2. Run the development server:

```powershell
npm run dev
```

### Expected local URLs

- Frontend: `http://localhost:5173`
- Backend API root: `https://localhost:7000/api`
- Swagger UI: `https://localhost:7000/swagger`
- Health endpoint: `https://localhost:7000/health`

### Frontend-to-backend wiring

- The frontend defaults to relative `/api` requests and uses the Vite proxy in [`frontend/vite.config.ts`](./frontend/vite.config.ts) to forward `/api` and `/images` to `https://localhost:7000`.
- `VITE_API_URL` is optional. It is only needed when the frontend should call a deployed API directly instead of using the local proxy.

## Deployment Instructions

Deployment infrastructure is defined in Bicep under [`infra/`](./infra):

- [`infra/main.bicep`](./infra/main.bicep) creates the environment resource group and invokes the workload module.
- [`infra/modules/workload.bicep`](./infra/modules/workload.bicep) provisions:
  - an Azure App Service Plan and Linux App Service for the API
  - an Azure Static Web App for the frontend
  - Application Insights and Log Analytics
- [`infra/main.dev.bicepparam`](./infra/main.dev.bicepparam) and [`infra/main.prod.bicepparam`](./infra/main.prod.bicepparam) select the dev or prod environment.

High-level deployment flow:

1. Sign in to Azure with the Azure CLI.
2. Run [`infra/bootstrap/setup-oidc.ps1`](./infra/bootstrap/setup-oidc.ps1) once per environment to create the GitHub OIDC app registration and role assignments.
3. Deploy the Bicep templates for `dev` or `prod`.
4. Configure GitHub repository or environment variables and secrets for Azure deployment.
5. Push to `main` to trigger the GitHub Actions workflows in [`.github/workflows/`](./.github/workflows).

Hosting shape:

- Frontend: Azure Static Web Apps
- Backend: Azure App Service for Linux
- Backend production app settings include `ConnectionStrings__DefaultConnection`, `JWT_SIGNING_KEY`, admin seed values, and CORS configuration

## Live Application URLs

These are the intended deployed application URLs. They may not be live until the Azure resources and deployment workflows are fully configured.

- Frontend: `https://agreeable-cliff-0d1ba470f.7.azurestaticapps.net/`
- Backend: `https://buckeye-sublease-api-0293.azurewebsites.net/`

## API Documentation / Swagger

- Base API URL: `https://localhost:7000/api`
- Swagger UI is enabled only in the Development environment.
- Local Swagger URL: `https://localhost:7000/swagger`
- Main controller groups:
  - `AuthController`: register, login/token, refresh
  - `ListingsController`: list, detail, admin create/update/delete
  - `CartController`: guest/auth cart read and mutation endpoints
  - `OrdersController`: place order, order history, admin order status management
  - `AdminController`: admin status endpoint
  - `CheckoutController`: authenticated checkout route

## Environment Variables

The backend reads configuration from `appsettings.json`, User Secrets, and environment variables. For local development, keep secrets in User Secrets when possible and use environment variables or Azure App Settings for shared or deployed environments.

| Variable | Required | Purpose | Local recommendation |
| --- | --- | --- | --- |
| `JWT_SIGNING_KEY` | Yes | Required to start the API and sign JWT access tokens | Store in User Secrets |
| `UseInMemoryDatabase` | No | Switches EF Core from SQLite to InMemory | Environment variable for tests only |
| `ConnectionStrings__DefaultConnection` | No | Overrides the SQLite connection string | User Secrets or environment variable |
| `Cors__AllowedOrigins` | No | Comma-separated allowed origins for CORS | User Secrets or environment variable |
| `ADMIN_SEED_USER_ID` | No | Admin seed user ID | User Secrets if overridden |
| `ADMIN_SEED_EMAIL` | No | Admin seed email | User Secrets if overridden |
| `ADMIN_SEED_PASSWORD` | No | Admin seed password | User Secrets locally, App Settings in Azure |

Default local values from code and config:

- `ConnectionStrings__DefaultConnection=Data Source=BuckeyeSublease.db`
- `Cors__AllowedOrigins=http://localhost:5173`
- `ADMIN_SEED_USER_ID=admin`
- `ADMIN_SEED_EMAIL=admin@buckeye.local`
- `ADMIN_SEED_PASSWORD=AdminPass1`

## Architecture and Schema Docs

- Architecture overview: [`docs/architecture.md`](./docs/architecture.md)
- Database schema: [`docs/database-schema.md`](./docs/database-schema.md)
- Detailed AI usage log: [`docs/AI-USAGE.md`](./docs/AI-USAGE.md)
- AI reflection: [`docs/AI%20usage%20reflection.md`](<./docs/AI usage reflection.md>)

## AI Usage Summary

AI tools were used across planning, implementation, debugging, testing, and documentation. The project keeps a detailed prompt-and-outcome log in [`docs/AI-USAGE.md`](./docs/AI-USAGE.md) and a broader reflection in [`docs/AI%20usage%20reflection.md`](<./docs/AI usage reflection.md>). Those documents cover the concrete prompts, validation steps, and lessons learned in more detail than this README.
