# Add-to-cart button success/error UX

## Test Type
Frontend unit test

## Primary Target
- frontend/src/components/AddToCartButton/AddToCartButton.tsx

## Why This Test Matters
This confirms user-facing button behavior and error feedback for add-to-cart interactions.

## Scenario Coverage
- button shows loading text when cart is loading
- successful add shows "Successfully Added" then returns to default label
- failed add shows alert with context-specific error message

## Assertion Guidance
- Use accessible queries (role/name/alert text)
- Assert exact visible labels during each state transition
- Assert alert content exactly matches expected failure message
