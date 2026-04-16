# Testing Evidence: Auth Chat Implementation

Date: 2026-04-16
Feature scope: Login/Register page + navbar Login button + auth state integration.

## 1) One Prompt Used With Testing Agent

Prompt used with the testing execution subagent:

"From c:/development/amis/workshop-4-lab/frontend, run npm run lint and npm test -- --run. Summarize pass/fail and include any errors with file paths and line numbers."

Outcome:
- The subagent invocation failed due to tool-side model support mismatch.
- I then ran equivalent commands directly in terminal to complete validation.

## 2) One Thing Copilot Got Wrong and How It Was Caught

Issue:
- In the first AuthPage implementation, local validation feedback (for example password length) was routed through a success-message state instead of an error-message state.

How it was caught:
- During implementation review and before final verification, the mismatch in message semantics was identified while checking form-state behavior.
- Fix applied: introduced localErrorMessage and updated render logic so validation failures are shown in the error feedback block.

Files updated for fix:
- frontend/src/pages/AuthPage.tsx

## 3) Test Commands Run and Whether They Passed

### Frontend commands

1. npm run lint; npm test -- --run
	 - First run result: lint failed (react-refresh rule in context files), tests passed.
	 - Fixes applied in context files.

2. npm run lint; npm test -- --run (rerun)
	 - Result: pass.
	 - Summary: 6 test files passed, 22 tests passed.

### Backend command

1. dotnet test (backend/HelloWorldApi)
	 - Result: pass (exit code 0).

### E2E command

1. npx playwright test
	 - Result: failed (exit code 1).

## 4) Evidence Notes: Backend, Frontend, E2E

No screenshots were captured in this session; evidence is based on terminal history and command outputs.

### Backend test evidence

- Terminal: dotnet
- Last command: dotnet test
- Cwd: C:/development/amis/workshop-4-lab/backend/HelloWorldApi
- Exit code: 0
- Interpretation: backend test run succeeded.

### Frontend test evidence

- Terminal: node / powershell
- Command: npm run lint; npm test -- --run
- Cwd: C:/development/amis/workshop-4-lab/frontend
- Exit code: 0 (final rerun)
- Test summary from output:
	- Test Files: 6 passed
	- Tests: 22 passed
- Interpretation: frontend lint and test suite succeeded after fixes.

### E2E evidence

- Terminal: powershell
- Command: npx playwright test
- Cwd: C:/development/amis/workshop-4-lab
- Exit code: 1
- Interpretation: E2E suite was not green in this session and requires follow-up.

## 5) Quick Self-Check Against Wednesday Quality Dimensions

### Functionality

- Status: Mostly met.
- Delivered:
	- Combined auth page with login/register toggle.
	- Navbar Login button placed left of Considerations.
	- Auth state with login/register/logout and persistence.
	- Token attachment for cart requests.
- Gaps:
	- E2E flow is failing and should be stabilized before final sign-off.

### Security

- Status: Partially met.
- Good:
	- Uses backend token endpoint; no hardcoded token values.
	- Authorization header only attached when valid token exists.
- Risks / follow-up:
	- Token stored in localStorage (acceptable for this course app, but XSS-sensitive).
	- No refresh-token / server-side logout invalidation flow in this scope.

### Code Quality

- Status: Good.
- Good:
	- Feature-level state via Context + useReducer aligned with project conventions.
	- Strong typing added for auth state/actions/services.
	- Added focused unit tests for auth reducer/service/storage.
	- Lint and unit tests pass in final run.
- Follow-up:
	- Add AuthPage component-level interaction tests.
	- Resolve and document failing E2E scenarios.
