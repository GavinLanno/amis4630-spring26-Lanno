# Cart lifecycle integration through real HTTP pipeline

## Test Type
Backend integration test

## Primary Targets
- backend/HelloWorldApi/Program.cs
- backend/HelloWorldApi/Controllers/CartController.cs
- backend/HelloWorldApi/Data/LisitngContext.cs

## Why This Test Matters
This validates route wiring, JSON contracts, persistence, and end-to-end API behavior across cart operations.

## Scenario Coverage
- POST add item succeeds and returns cart with item
- GET cart returns persisted item
- PUT updates quantity and returns updated line state
- DELETE removes item and returns expected cart state

## Assertion Guidance
- Assert exact HTTP status codes per step
- Assert exact payload fields (listingId, quantity, totals/shape)
- Assert state transitions across calls, not just single-response success
