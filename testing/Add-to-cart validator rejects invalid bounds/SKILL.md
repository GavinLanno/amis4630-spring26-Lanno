# Add-to-cart validator rejects invalid bounds

## Test Type
Backend unit test

## Primary Target
- backend/HelloWorldApi/Validators/AddToCartValidator.cs

## Why This Test Matters
This protects API input boundaries and prevents invalid cart requests from reaching controller/database logic.

## Scenario Coverage
- listingId should fail when <= 0
- quantity should fail when < 1
- quantity should fail when > 99
- valid listingId and quantity should pass

## Assertion Guidance
- Assert exact validation failure count and field names
- Assert exact validation messages for invalid fields
- Do not weaken assertions to generic success/failure checks
