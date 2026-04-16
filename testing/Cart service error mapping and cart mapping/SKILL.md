# Cart service error mapping and cart mapping

## Test Type
Frontend unit test

## Primary Target
- frontend/src/services/cartService.ts

## Why This Test Matters
This ensures API failures map to stable UX messages and API cart payloads map correctly to frontend state.

## Scenario Coverage
- 404 maps to "This listing is no longer available."
- non-404 errors map from ProblemDetails detail/title where present
- mapCartResponse converts IDs, names, image URLs, and quantities correctly

## Assertion Guidance
- Mock fetch responses precisely by status/body
- Assert exact thrown message text
- Assert mapped CartSnapshot field-by-field
