# Listing browse to add-to-cart to cart view flow

## Test Type
E2E happy-path test (Playwright)

## Primary Targets
- frontend/src/pages/ListingsPage.tsx
- frontend/src/components/ListingCard.tsx
- frontend/src/components/CartBadge/CartBadge.tsx
- frontend/src/pages/CartPage.tsx
- backend/HelloWorldApi/Controllers/CartController.cs

## Why This Test Matters
This validates the primary user journey from discovery to cart review using real UI interactions.

## Scenario Coverage
- listings page loads and shows at least one listing
- add to cart succeeds from listing card
- cart badge count updates
- navigate to cart and verify item name, quantity, and total visibility

## Assertion Guidance
- Use stable role/label/text selectors
- Assert visible success outcomes at each step
- Keep assertions specific (item text, quantity value, expected cart UI state)
