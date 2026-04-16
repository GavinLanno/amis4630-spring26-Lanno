# JWT-CORS baseline audit

## Intent
Provide a repeatable security review workflow for JWT authentication and CORS configuration in this repository, with safe remediation steps that protect login flow and existing public behavior.

## Review Type
Backend and frontend security configuration review

## Primary Targets
- backend/HelloWorldApi/Program.cs
- backend/HelloWorldApi/appsettings.json
- backend/HelloWorldApi/appsettings.Development.json
- backend/HelloWorldApi/Controllers/
- frontend/src/services/
- AGENTS.md
- backend/HelloWorldApi/AGENTS.md
- frontend/AGENTS.md

## Observable Contract
- Public endpoints remain reachable without token unless explicitly changed.
- Protected endpoints reject invalid or missing tokens.
- Login/token endpoints continue to work.
- CORS allows approved frontend origin(s) and rejects unapproved origins.
- No wildcard-origin with credentials enabled.

## Workflow
1. Read AGENTS guidance and existing SKILL files.
2. Map middleware and service registration order.
3. Audit JWT validation options and secret handling.
4. Audit endpoint authorization intent vs implementation.
5. Audit CORS policy shape and pipeline placement.
6. Propose minimal fixes with regression-risk notes.
7. Validate auth success/failure paths and preflight behavior.

## JWT Red Flags
- Missing AddAuthentication/AddJwtBearer registration.
- Missing app.UseAuthentication() when authorization is enabled.
- ValidateIssuerSigningKey/ValidateLifetime disabled without reason.
- Issuer, audience, or key checks disabled unintentionally.
- Hardcoded secrets in source files.
- Excessive clock skew.

## CORS Red Flags
- AllowAnyOrigin with AllowCredentials.
- Development-only origin leaking to non-dev environments.
- CORS middleware placed after endpoint mapping.
- Overly broad methods/headers without rationale.

## Safe Fix Strategy
- Prefer config-backed values over hardcoded values.
- Keep route signatures and response payloads stable.
- Apply smallest viable change per finding.
- Document rollback-safe alternative when change risk is non-trivial.

## Output Contract
1. Findings by severity with exact file/line.
2. Safe fix plan.
3. Implemented changes and safety rationale.
4. Login-flow regression checklist.
5. Validation evidence.
6. Remaining hardening recommendations.
