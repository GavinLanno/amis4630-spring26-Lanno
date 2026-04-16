# Cart controller add behavior returns correct status by scenario

## Test Type
Backend unit test

## Primary Target
- backend/HelloWorldApi/Controllers/CartController.cs

## Why This Test Matters
This validates HTTP contract behavior for add-to-cart outcomes and protects client expectations.

## Scenario Coverage
- returns 400 BadRequest with ProblemDetails when quantity <= 0
- returns 404 NotFound with ProblemDetails when listing does not exist
- returns 201 Created when adding a new listing to cart
- returns 200 Ok when listing already exists and quantity increments

## Assertion Guidance
- Assert exact action result type and status code
- Assert exact ProblemDetails title/detail for error cases
- Assert returned cart item quantity/value changes exactly
