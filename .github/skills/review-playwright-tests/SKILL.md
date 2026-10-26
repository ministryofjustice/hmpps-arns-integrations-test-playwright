---
name: review-playwright-tests
description: 'Review Playwright spec files (*.spec.ts) under tests/ in the ARNS integration test repo. Use when reviewing UI, API, auth or security tests for AAP, SAN, ARNS or arns-assessment; checking tags (@dev, @test, @local, @security), folder placement vs playwright config projects, flakiness, waits, assertions, test isolation and test data.'
---

# Review Playwright Tests

Always also apply `review-typescript-playwright-best-practices` (locators, web-first assertions, isolation, fixtures, `test.step`, typing). This skill covers repo-specific wiring.

## Know the wiring first

Tests are selected by **folder + tag**, so a test in the wrong place or with the wrong tag silently never runs.

| Config | testDir / match | grep | Used by |
|---|---|---|---|
| `playwright.config.ts` | `tests/arns-assessment-platform/dev[/aap\|/san\|/arns]` | `@dev` | `dev:{all,aap,san,arns}:ci` |
| `playwright.test.config.ts` | `tests/arns-assessment-platform` | `@dev\|@test` | `test:{all,aap,san,arns}:ci` |
| `playwright.api.config.ts` | `dev/**/api/*.spec.ts`, `dev/**/auth/*.spec.ts` | `@dev\|@security` | `dev:api`, `dev:api:security` |
| `playwright.api.test.config.ts` | `*api/*.spec.ts` | `@dev\|@test` | `test:api` |
| `playwright.local.config.ts` | — | `@local` | `local:ui` (localhost:3000) |

`SOURCE` (AAP/SAN/ARNS) controls which tokens `global-setup.ts` fetches; per-source projects (`chromium_aap`, `edge_san`, ...) only see their own subfolder.

## Checklist

### Placement and tagging
- [ ] File is under the correct env folder (`dev/` or `test/`) and service folder (`aap/`, `san/`, `arns/`, `arns-assessment/`) and type folder (`ui/`, `api/`, `auth/`).
- [ ] Tags use the object form: `test.describe('...', { tag: ['@dev', '@local'] }, ...)` or `test('...', { tag: '@security' }, ...)`. Tags in the title string are not used here.
- [ ] Tag matches intent: a test under `dev/` without `@dev` will not run in CI; `@security` only runs via the API config.
- [ ] Will the per-source CI projects pick it up? (e.g. a SAN test placed in `aap/` runs under the AAP pipeline and with AAP-only tokens.)
- [ ] File naming follows the existing numbered pattern (`NN.descriptiveName.spec.ts`) where the folder uses it; number does not clash with an existing file.

### Timing and flakiness
CI timeouts are tight: test timeout **8s**, expect timeout **3s** (60s/10s only with `LOCAL_RUN=1`). Review accordingly.
- [ ] No `page.waitForTimeout()` / hard sleeps. Use web-first assertions (`await expect(locator).toBeVisible()`, `toHaveURL`, `toHaveText`).
- [ ] No `expect(await locator.textContent()).toBe(...)` — use `await expect(locator).toHaveText(...)` so it retries.
- [ ] Every Playwright call and `expect` on a locator is `await`ed.
- [ ] Long journeys that genuinely need more time use `test.slow()` or `test.setTimeout()` with justification, not a global config change.
- [ ] No reliance on test execution order across files (`fullyParallel: false` is per-file only; CI uses 2 workers).

### Structure and isolation
- [ ] UI tests use page objects from `page-objects/arns-assessment-platform/`; no raw selectors in specs beyond trivial one-offs.
- [ ] Setup in `beforeEach`/`beforeAll` creates its own data (e.g. via `TrainingLauncherPage`, `page-objects/arns-assessment-platform/api/setup-plan.ts`, or `utils/aap/**` commands) rather than depending on pre-existing environment state.
- [ ] `APIRequestContext` created in `beforeAll` is disposed in `afterAll`.
- [ ] Created entities are cleaned up where an API exists (e.g. `utils/coordinator/client/deleting.ts`), or there is a reason not to.
- [ ] Shared mutable module-level state (`let x;`) isn't mutated across tests in a way that breaks retries.
- [ ] Test titles describe behaviour ("should create goal and steps as national rollout user"); they are published to `TestCatalogue.md`.
- [ ] Long multi-page journeys are broken into `test.step(...)` blocks.
- [ ] Setup repeated across several spec files is a candidate for a `test.extend` fixture rather than copied hooks.
- [ ] Skipped tests use `test.skip(condition, 'reason + ticket')` / `test.fixme`, not commented-out code or commented-out tags.

### Assertions
- [ ] Each test asserts the outcome, not just that steps didn't throw.
- [ ] API tests assert status code **and** relevant body fields; error-path tests assert the specific status (e.g. ModSec → 406).
- [ ] Accessibility checks (if any) use `@axe-core/playwright` and scope/exclusions are justified.

### Data
- [ ] Fixtures in `data/*.json` contain only synthetic data — no real CRNs, names, DOBs or PNC numbers.
- [ ] Imports use relative paths consistent with neighbours; no imports from `oastub-archive`.

## Common findings to phrase clearly
- "Test is under `dev/san` but tagged only `@local` — it won't run in `dev:san:ci`."
- "`waitForTimeout(2000)` will be flaky against the 8s CI budget; replace with `await expect(...).toBeVisible()`."
