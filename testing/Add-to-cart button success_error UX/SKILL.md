---
Title: Add-to-cart button success/error UX
---
## Intent
Create resilient frontend unit tests for Add-to-cart button behavior, with exact user-visible feedback for loading, success, and failure states.

## Test Type
Frontend unit test

## Primary Target
- frontend/src/components/AddToCartButton/AddToCartButton.tsx

## Observable Behavior Contract
- Button is disabled while cart state is loading.
- Button label precedence is exact:
	1. `Loading Cart...` when `state.isLoading` is true
	2. `Successfully Added` after successful add
	3. `Add to Cart` default idle label
- Failed add renders an element with `role="alert"` containing an exact error message.
- If context provides no error message on failure, fallback text is `This listing is no longer available.`

## Required Test Setup
- Use React Testing Library + `@testing-library/user-event`.
- Mock `useCartContext` to fully control:
	- `state.isLoading`
	- `state.errorMessage`
	- `addToCart` resolved value (`true` or `false`)
- Use deterministic fake timers for success-label timeout behavior (`1500ms`).

## Workflow
1. Arrange a reusable listing fixture with stable values (`id`, `name`, `price`).
2. Arrange cart context mock for one branch at a time.
3. Render button and query with accessible selectors:
	 - `getByRole('button', { name: /add .* to cart/i })`
	 - `getByRole('alert')` or `queryByRole('alert')`
4. Act with real user interaction (`await user.click(button)`).
5. Assert branch-specific UI contract exactly.
6. For success branch, advance timers and assert reset to idle label.
7. Cleanup timers/mocks to prevent cross-test leakage.

## Branching Logic

### Branch A: Loading state
- Given `state.isLoading = true`
- Assert:
	- Button text is exactly `Loading Cart...`
	- Button is disabled
	- No alert is rendered

### Branch B: Successful add
- Given `state.isLoading = false`, `addToCart` resolves `true`
- Assert in order:
	- Initial label is `Add to Cart`
	- After click, label becomes `Successfully Added`
	- After advancing `1500ms`, label returns to `Add to Cart`
	- No alert is rendered

### Branch C: Failed add with context message
- Given `state.isLoading = false`, `addToCart` resolves `false`, `state.errorMessage` set
- Assert:
	- Alert is rendered with exact context message
	- Success label is never shown
	- Idle label remains available after failure

### Branch D: Failed add with fallback message
- Given `addToCart` resolves `false`, `state.errorMessage` empty
- Assert alert text exactly equals:
	- `This listing is no longer available.`

## Quality Gates
- Use only accessible queries (`getByRole`, `findByRole`, `queryByRole`, `getByText` for exact visible text).
- Assert exact strings for all state labels and error content.
- Validate transition order, not just end state.
- Verify no stale alert after a subsequent successful click when applicable.
- Avoid brittle selectors (`querySelector`, class-name selectors, snapshots as primary verification).

## Completion Checklist
- Covers loading, success, and failure branches.
- Covers fallback error message path.
- Uses fake timers for timeout-driven label reset.
- Includes exact text assertions for button labels and alert content.
- Confirms ARIA-visible behavior (`role=button`, `role=alert`).
- Leaves no pending timers or shared mock state between tests.

## Common Failure Signals
- Flaky timeout assertions: fake timers not enabled or not advanced.
- Passing despite wrong UX copy: regex too loose or partial-match assertions.
- Missing fallback coverage: only tests context-provided error.
- Test passes without user interaction: direct handler invocation instead of click.
