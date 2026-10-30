---
name: api-test-playwright
description: 'Review API client helpers, auth/token handling, global setup and Playwright config in the ARNS integration test repo. Use when reviewing utils/ (aapClient, arnsClient, coordinator, handover, aap sentencePlan commands), utils/global-setup.ts, playwright*.config.ts, environment variables, client credentials, OAuth tokens, base URLs, or secrets handling.'
---

# Review API Test

Always also apply the [`typescript-playwright.md`](./typescript-playwright.md) reference.

## How auth works today
- `utils/global-setup.ts` runs before every Playwright run. It POSTs `grant_type=client_credentials` to `TOKEN_URL` with Basic auth and writes the response to `utils/aapToken.json` / `utils/arnsAssessmentToken.json`.
- In CI, credentials come from env (`AAP_CLIENT_ID`, `AAP_CLIENT_SECRET`, `ARNS_ASSESSMENT_CLIENT_ID`, `ARNS_ASSESSMENT_CLIENT_SECRET`). Locally they come from shell commands in `*_SCRIPT` env vars (executed with `execSync`).
- `SOURCE` unset → fetch AAP + ARNS tokens; `SOURCE=AAP|SAN` → AAP only; `SOURCE=ARNS` → none.
- Clients (`utils/aapClient.ts`, `utils/arnsClient.ts`) read token files via `getToken()`; `getBaseUrl(baseURL)` maps UI base URL → API URL for dev/test.
- `.env` is loaded only when `!process.env.CI`.

## Checklist

### Secrets and sensitive data
- [ ] No credentials, tokens, bearer strings or `TOKEN_URL` values hard-coded or committed (including in `.env.example`, comments, fixtures).
- [ ] Token JSON files remain gitignored; nothing in the diff adds them.
- [ ] Tokens/secrets are not logged (`console.log(token)`, logging full request headers, or error messages that include the Authorization header).
- [ ] `execSync` is only ever run on developer-provided `*_SCRIPT` env vars, never on values derived from test data or responses (command injection).
- [ ] New secrets are also added to the `env:` block of `.github/workflows/playwright.yml` (and documented in README) — otherwise CI and caller pipelines break.

### Global setup and SOURCE
- [ ] If a new service/token is added, `SOURCE` branching covers it and per-source runs don't fetch tokens they lack secrets for (callers of `playwright.yml` may only have some secrets).
- [ ] Failure to fetch a token throws with a clear message including status, without the secret.
- [ ] Token expiry: long runs relying on a single token fetched at setup are acknowledged.

### Client helpers
- [ ] Base URLs come from `baseURL`/env mapping (`getBaseUrl`, `getCoordinatorUrl`, `getHandoverUrl`), not hard-coded per test. Both dev and test environments handled.
- [ ] Helpers accept an `APIRequestContext` rather than creating their own uncached contexts per call.
- [ ] Responses checked (`response.ok()` or explicit status) before `.json()`; errors surface status and body for debugging.
- [ ] Request/response types declared in the relevant `*Types.ts` file and reused; no `any`.
- [ ] No synthetic data that looks like real person data (CRN, name, DOB) in hard-coded subject details.
