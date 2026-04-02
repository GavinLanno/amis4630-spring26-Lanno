# Buckeye Sublease - AI Agent Instructions

## Project Overview

Buckeye Sublease is a full-stack e-commerce application built with:

- **Frontend:** React + TypeScript (Vite)
- **Backend:** .NET Web API with Entity Framework Core
- **Database:** SQL Server (EF core Sqlite for development)

## Architecture

- Frontend runs on http://localhost:5173
- Backend runs on https://localhost:7000
- API base path: /api/

## Frontend Conventions

- Components live in `src/components/`
- Each component has its own folder: `ComponentName/ComponentName.tsx` +
  `ComponentName.module.css`
- State management: useReducer + Context API for feature-level state (cart, auth)
- API calls go in `src/services/` as separate functions
- Types/interfaces go in `src/types/`
- CSS Modules for styling (not inline styles, not global CSS)

## Code Style

- Functional components only (no class components)
- TypeScript strict mode — all props must be typed
- Destructure props in function signature
- Use `interface` for props and object shapes; use `type` for unions and intersections
- Named exports for components, default export for pages

## Current State

- Listing catalog: working (displays from API)
- Listing detail: working
- Shopping cart: IN PROGRESS (M4)
- Authentication: not started (M5)

## When Generating Code

- Always include TypeScript types
- Always include aria-labels on interactive elements
- Use CSS Modules (\*.module.css), not inline styles
- Handle loading and error states for any API call
- Use useReducer for complex state, useState for simple state
- No default case in reducers — rely on TypeScript exhaustive checking