---
name: e2e-test-page-objects-playwright
description: 'Review Playwright page object classes under page-objects/ in the ARNS integration test repo. Use when reviewing locators, selector strategy (getByRole, getByLabel, data-qa), page object structure, reusable workflow methods, and duplication between page objects for AAP, Sentence Plan, Strengths and Needs (SAN) pages.'
---

# Review Page Objects

Always also apply `typescript-playwright` (locator strategy, strictness, typing).

Active page objects live in `page-objects/arns-assessment-platform/` and `page-objects/strengths-and-needs/`. `page-objects/oastub-archive/` is legacy — do not extend it.

## Expected shape

```ts
import { Locator, Page } from '@playwright/test';

export class CreateGoalPage {
  readonly page: Page;
  readonly searchGoal: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchGoal = page.locator('accessible-autocomplete-wrapper').getByRole('combobox');
  }

  createGoal = async (goalTitle: string) => { /* multi-step workflow */ };
}
```

## Checklist

### Structure
- [ ] One exported class per page/component, file name kebab-case ending `-page.ts`, class name PascalCase ending `Page`.
- [ ] Locators declared as `readonly` `Locator` fields and initialised in the constructor (lazy — no `await` in constructor).
- [ ] Workflow methods encapsulate multi-step user actions and are `async`; they don't contain test assertions unless they are explicit wait/guard checks (assertions belong in specs).
- [ ] No duplication of a locator/method that already exists on another page object — suggest reuse.
- [ ] API-based setup helpers stay in `page-objects/arns-assessment-platform/api/` or `utils/`, not mixed into UI page classes.

### Locator strategy (in order of preference)
1. `getByRole(role, { name })`, `getByLabel`, `getByText` for user-facing elements.
2. `[data-qa="..."]` / `getByTestId` where accessible names are unstable.
3. Scoped CSS (e.g. `page.locator('accessible-autocomplete-wrapper')`) only to scope a role query.

Flag:
- [ ] XPath, nth-child chains, generated class names, or deep CSS paths.
- [ ] `.first()` / `.nth(n)` used to paper over ambiguous locators without a comment explaining why.
- [ ] Partial `name` matches that could collide (e.g. `'Does this goal relate to any'`) — acceptable if unique, but check `exact` where needed.
- [ ] Hard-coded user data (goal titles, names) inside locators that should be method parameters.

### Waiting
- [ ] No `waitForTimeout`. Navigation methods wait on a meaningful signal (`await expect(page).toHaveURL(...)`, `waitForURL`, or a locator becoming visible).
- [ ] All Playwright calls are `await`ed (ESLint `no-floating-promises` is an error).

### Types
- [ ] No new `any`; parameters typed. Shared types reused from `utils/aap/assessmentTypes.ts`, `utils/arnsClient.ts` etc. rather than redeclared.
