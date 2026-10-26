---
name: review-typescript-playwright-best-practices
description: 'Enforce TypeScript and Playwright best practice when reviewing or writing code in the ARNS integration test repo. Use for any *.ts change (tests, page objects, utils, configs) to check type safety, async/await, error handling, imports, naming, Playwright locators, web-first assertions, auto-waiting, fixtures, test isolation, test.step, APIRequestContext usage, retries/flakiness and trace-friendly code.'
---

# TypeScript and Playwright Best Practice

Apply to every changed `.ts` file. The tooling here is loose, so the reviewer has to catch what the tooling doesn't:
- `tsconfig.json` has **no `strict`**, so implicit `any`, unchecked `null`/`undefined` and loose function types compile without error.
- ESLint (`recommendedTypeChecked`) only **warns** on `any`/unsafe-* rules. `npm run lint` only covers `tests/**` and `page-objects/**`, not `utils/**`.

Treat new code as if `strict: true` were on. Don't demand that untouched existing code is fixed in the same PR; raise it as a follow-up.

## TypeScript

### Types
- [ ] No new `any` (explicit or implicit). Use a proper interface, `unknown` plus narrowing, or a generic.
- [ ] Function parameters and exported function return types are annotated, e.g. `Promise<string>` or `Promise<void>`.
- [ ] API response bodies are typed: `const body = (await res.json()) as AssessmentResponse;` with the type declared in the matching `*Types.ts` (`utils/aap/assessmentTypes.ts`, `utils/coordinator/coordinatorTypes.ts`, `utils/handover/handoverTypes.ts`), not inline or duplicated.
- [ ] Prefer `interface`/`type` and union literals (`'AAP' | 'SAN' | 'ARNS'`) over loose `string` for known value sets. Prefer `as const` objects over `enum`.
- [ ] Non-null assertions (`!`) and `as` casts are justified. A `process.env.X!` must have a guard that fails fast with a clear message if the variable is missing.
- [ ] `readonly` on fields that shouldn't change (page object locators, config objects).
- [ ] No `@ts-ignore`. If suppression is unavoidable, use `@ts-expect-error` with a reason.

### Async
- [ ] Every Promise is awaited or deliberately returned (`no-floating-promises`). Watch for `.forEach(async ...)`: use `for...of` with `await`, or `await Promise.all(...)` when parallel is safe.
- [ ] No `await` on non-Promises (`await-thenable`).
- [ ] No mixing of `.then()` chains with `async/await` in the same function.
- [ ] `try/catch` only where something useful happens (add context and rethrow, or clean up). Never swallow errors silently. A caught error should be checked with `instanceof Error` before reading `.message`.

### Style and structure
- [ ] `const` by default. `let` only when reassigned. No `var`.
- [ ] Strict equality (`===`/`!==`). Optional chaining (`?.`) and nullish coalescing (`??`) instead of `||` when `0`/`''` are valid values.
- [ ] Naming: `PascalCase` for classes/types, `camelCase` for functions/variables, `UPPER_SNAKE_CASE` for true constants, kebab-case filenames for modules and page objects.
- [ ] Named exports. No default exports except where a tool needs them (Playwright config, `global-setup.ts`).
- [ ] No unused imports or variables, and no dead or commented-out code.
- [ ] No magic strings or numbers repeated across files. Extract them to a constant or test data file.
- [ ] Small focused functions. No copy-paste blocks that should be a helper (but don't create a helper for something used once).
- [ ] No Node built-ins with side effects at import time (file writes, network) outside `global-setup.ts`.

## Playwright

### Locators
- [ ] Prefer user-facing locators: `getByRole` (with `name`), `getByLabel`, `getByPlaceholder`, `getByText`. Then `getByTestId`/`[data-qa]`. CSS only for scoping. Never XPath or layout-dependent selectors.
- [ ] Locators are strict: they should resolve to exactly one element. `.first()`/`.nth()`/`.last()` need a reason. Prefer narrowing with `.filter({ hasText })`, `.filter({ has })` or chaining from a parent.
- [ ] Use `{ exact: true }` where a partial name could match more than one element.
- [ ] Don't use `page.$`, `page.$$`, `page.$eval`, `elementHandle`, `page.waitForSelector` or `page.click(selector)`. Use the `Locator` API.

### Waiting and assertions
- [ ] Web-first assertions only: `await expect(locator).toBeVisible()/toHaveText()/toHaveValue()/toHaveCount()/toBeChecked()`, `await expect(page).toHaveURL()/toHaveTitle()`.
- [ ] Never assert on a one-off read, e.g. `expect(await locator.isVisible()).toBe(true)` or `expect(await locator.innerText()).toBe(...)`. These don't retry and cause flaky failures.
- [ ] No `waitForTimeout`, `setTimeout` sleeps or `networkidle` waits. Rely on auto-waiting, or wait for a specific response with `page.waitForResponse(predicate)` started **before** the action that triggers it.
- [ ] `expect.soft` only where continuing after a failure still makes sense. `expect.poll` / `toPass` for eventually-consistent API state, with a bounded timeout.
- [ ] No `force: true` on clicks/fills unless there's a documented reason. It hides real usability bugs.
- [ ] Assertions have a meaningful message when the failure would otherwise be unclear: `expect(res.status(), 'create goal').toBe(201)`.

### Test structure
- [ ] Each test is independent: it can run alone, in any order, and on retry. No reliance on state from another test. Use `test.describe.serial` only when unavoidable, and justify it.
- [ ] Arrange via API where possible (faster, less flaky) and act/assert via UI for UI tests.
- [ ] Use `test.step('...', async () => { ... })` to label long journeys so traces and reports are readable.
- [ ] Hooks are the right scope: `beforeEach` for per-test state (pages), `beforeAll` only for expensive, read-only shared setup. Anything created in `beforeAll`/`beforeEach` is torn down in the matching `after*`.
- [ ] Reusable setup that repeats across files should become a custom fixture (`test.extend<{...}>()`) instead of copy-pasted hooks.
- [ ] Use the built-in `request` fixture or `playwright.request.newContext()` (disposed afterwards) for API calls, not `node-fetch`/`axios` inside tests.
- [ ] Use `test.skip(condition, reason)` / `test.fixme(reason)` with a reason and ticket, not commented-out tests.
- [ ] No `test.only`, `page.pause()`, `console.log` debugging, or hard-coded `headless: false`.
- [ ] Test titles describe expected behaviour. One behaviour per test.

### Page objects
- [ ] Hold locators and user-level actions. No `expect` assertions about business outcomes (those belong in specs). Guard waits that confirm navigation are fine.
- [ ] Methods take data as parameters. No hard-coded test data inside page objects.
- [ ] Return `Promise<void>` or a typed value, or the next page object for navigation methods.

### Config and environment
- [ ] No hard-coded environment URLs in specs. Use `baseURL` and relative `page.goto('/path')`, or the URL helpers in `utils/`.
- [ ] Timeouts aren't raised per test to hide slowness. Use `test.slow()` with a reason if a journey really is long.
- [ ] Traces, screenshots and video stay enabled on retry/failure so CI failures can be debugged.

## Severity guide
- **Blocking**: floating promises, `test.only`, secrets, non-retrying assertions on core checks, `waitForTimeout`, cross-test dependencies, new `any` in exported APIs.
- **Should fix**: weak locators (`.nth`, CSS chains), missing types on responses, missing teardown, no `test.step` on long journeys.
- **Nit**: naming, `let`→`const`, message-less assertions, minor duplication.
