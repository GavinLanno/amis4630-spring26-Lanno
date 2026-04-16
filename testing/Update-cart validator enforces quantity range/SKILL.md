# Update-cart validator enforces quantity range

## Test Type
Backend unit test

## Primary Target
- backend/HelloWorldApi/Validators/UpdateCartItemValidator.cs

## Why This Test Matters
This enforces quantity rules for updates and keeps cart state valid.

## Scenario Coverage
- quantity should fail when < 1
- quantity should fail when > 99
- quantity should pass at 1 and 99 boundaries

## Assertion Guidance
- Assert validation error exists on Quantity for invalid inputs
- Assert valid boundary values have no validation errors
- Use specific assertions for expected messages where applicable
