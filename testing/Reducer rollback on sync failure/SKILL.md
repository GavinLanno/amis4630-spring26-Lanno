# Reducer rollback on sync failure

## Test Type
Frontend unit test

## Primary Target
- frontend/src/reducers/cartReducer.ts

## Why This Test Matters
This protects optimistic update rollback and ensures the UI recovers correctly from API failure.

## Scenario Coverage
- APPLY_OPTIMISTIC_CART updates state to optimistic snapshot
- SYNC_CART_FAILURE restores snapshot cartId/items
- SYNC_CART_FAILURE sets error message and clears syncing flag

## Assertion Guidance
- Assert exact state fields before and after each action
- Assert restored snapshot values match exactly
- Assert errorMessage is the expected value
