---
name: playwright
description: Generates hippo-grade Playwright automation scripts and E2E tests in TypeScript, JavaScript, Python, Java, or C#. Use when the user asks to write Playwright tests using POM and fixtures, automate browsers, debug flaky tests, mock APIs, or do visual regression. Do NOT use for native mobile testing.
---

# Playwright

## Step 1 — Determine Execution Target

Decide BEFORE writing any code:

| User says...       | Target    | Action                     |
| ------------------ | --------- | -------------------------- |
| "locally", "debug" | **Local** | Standard Playwright config |
| Ambiguous          | **Local** | Default local              |

## Step 2 — Detect Language

| Signal                                              | Language   | Default                                                                        |
| --------------------------------------------------- | ---------- | ------------------------------------------------------------------------------ |
| "TypeScript", "TS", `.ts`, or no language specified | TypeScript | ✅                                                                             |
| "JavaScript", "JS", `.js`                           | JavaScript |                                                                                |
| "Python", "pytest", `.py`                           | Python     | See [assets/reference/python-patterns.md](assets/reference/python-patterns.md) |
| "Java", "Maven", "Gradle", "TestNG"                 | Java       | See [assets/reference/java-patterns.md](assets/reference/java-patterns.md)     |
| "C#", ".NET", "NUnit", "MSTest"                     | C#         | See [assets/reference/csharp-patterns.md](assets/reference/csharp-patterns.md) |

## Step 3 — Determine Scope

| Request type                     | Output                                                                                               |
| -------------------------------- | ---------------------------------------------------------------------------------------------------- |
| One-off quick script             | Standalone `.ts` file, no POM                                                                        |
| Single test for existing project | Match their structure and conventions                                                                |
| New test suite / project         | Full scaffold — see [assets/scripts/scaffold-project.sh](assets/scripts/scaffold-project.sh)         |
| Fix flaky test                   | Debugging checklist — see [assets/reference/debugging-flaky.md](assets/reference/debugging-flaky.md) |
| API mocking needed               | See [reference/api-mocking-visual.md](assets/reference/api-mocking-visual.md)                        |
| Mobile device testing            | See [reference/mobile-testing.md](assets/reference/mobile-testing.md)                                |

---

## Core Patterns — TypeScript (Default)

### Selector Priority

Use in this order — stop at the first that works:

1. `getByRole('button', { name: 'Submit' })` — accessible, resilient
2. `getByLabel('Email')` — form fields
3. `getByPlaceholder('Enter email')` — when label missing
4. `getByText('Welcome')` — visible text
5. `getByTestId('submit-btn')` — last resort, needs `data-testid`

Never use raw CSS/XPath unless matching a third-party widget with no other option.

### Assertions — Always Web-First

```typescript
// ✅ Auto-retries until timeout
await expect(page.getByRole('heading')).toBeVisible();
await expect(page.getByRole('alert')).toHaveText('Saved');
await expect(page).toHaveURL('/dashboard');

// ❌ No auto-retry — races with DOM
const text = await page.textContent('.msg');
expect(text).toBe('Saved');
```

### Anti-Patterns

| ❌ Don't                       | ✅ Do                                               | Why                       |
| ------------------------------ | --------------------------------------------------- | ------------------------- |
| `page.waitForTimeout(3000)`    | `await expect(locator).toBeVisible()`               | Hard waits are flaky      |
| `expect(await el.isVisible())` | `await expect(el).toBeVisible()`                    | No auto-retry             |
| `page.$('.btn')`               | `page.getByRole('button')`                          | Fragile selector          |
| `page.click('.submit')`        | `page.getByRole('button', {name:'Submit'}).click()` | Not accessible            |
| Shared state between tests     | `test.beforeEach` for setup                         | Tests must be independent |
| `try/catch` around assertions  | Let Playwright handle retries                       | Swallows real failures    |

### Page Object Model

Use POM for any project with more than 3 tests. Full patterns with base page, fixtures, and examples in [assets/reference/page-object-model.md](assets/reference/page-object-model.md).

Quick example:

```typescript
// pages/login.page.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(private page: Page) {
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Sign in' });
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

### Configuration — Local

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 13'] } },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3000,
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## Quick Reference

### Common Commands

```bash
npx playwright test                          # Run all tests
npx playwright test --ui                     # Interactive UI mode
npx playwright test --debug                  # Step-through debugger
npx playwright test --project=chromium       # Single browser
npx playwright test tests/login.spec.ts      # Single file
npx playwright show-report                   # Open HTML report
npx playwright codegen https://example.com   # Record test
npx playwright test --update-snapshots       # Update visual baselines
```

### Auth State Reuse

```typescript
// Save auth state once in global setup
await page.context().storageState({ path: 'auth.json' });

// Reuse in config
use: {
  storageState: 'auth.json';
}
```

### Visual Regression (Built-in)

```typescript
await expect(page).toHaveScreenshot('homepage.png', {
  maxDiffPixelRatio: 0.01,
  animations: 'disabled',
  mask: [page.locator('.dynamic-date')],
});
```

### Network Mocking

```typescript
await page.route('**/api/users', (route) => route.fulfill({ json: [{ id: 1, name: 'Mock User' }] }));
```

Full mocking patterns in [assets/reference/api-mocking-visual.md](assets/reference/api-mocking-visual.md).

### Test Steps for Readability

```typescript
test('checkout flow', async ({ page }) => {
  await test.step('Add item to cart', async () => {
    await page.goto('/products');
    await page.getByRole('button', { name: 'Add to cart' }).click();
  });

  await test.step('Complete checkout', async () => {
    await page.getByRole('link', { name: 'Cart' }).click();
    await page.getByRole('button', { name: 'Checkout' }).click();
  });
});
```

---

## Reference Files

| File                                                                             | When to read                                         |
| -------------------------------------------------------------------------------- | ---------------------------------------------------- |
| [assets/reference/page-object-model.md](assets/reference/page-object-model.md)   | POM architecture, base page, fixtures, full examples |
| [assets/reference/debugging-flaky.md](assets/reference/debugging-flaky.md)       | Flaky test checklist, common fixes                   |
| [assets/reference/api-mocking-visual.md](assets/reference/api-mocking-visual.md) | API mocking + visual regression patterns             |
| [assets/reference/python-patterns.md](assets/reference/python-patterns.md)       | Python-specific: pytest-playwright, sync/async       |
| [assets/reference/java-patterns.md](assets/reference/java-patterns.md)           | Java-specific: Maven, JUnit, Gradle                  |
| [assets/reference/csharp-patterns.md](assets/reference/csharp-patterns.md)       | C#-specific: NUnit, MSTest, .NET config              |

## Advanced Playbook

For production-grade patterns, see `assets/reference/playbook.md`:

| Section                    | What's Inside                                |
| -------------------------- | -------------------------------------------- |
| §1 Production Config       | Multi-project, reporters, retries, webServer |
| §2 Auth Fixture Reuse      | storageState, multi-role fixtures            |
| §3 Page Object Model       | BasePage, LoginPage with fluent API          |
| §4 Network Interception    | Mock, modify, HAR replay, block resources    |
| §5 Visual Regression       | Screenshot comparison, masks, thresholds     |
| §6 File Upload/Download    | fileChooser, setInputFiles, download events  |
| §7 Multi-Tab & Dialogs     | Popup handling, alert/confirm/prompt         |
| §8 Geolocation & Emulation | Location, timezone, locale, color scheme     |
| §9 Custom Fixtures         | DB seeding, API context, auto-teardown       |
| §10 API Testing            | Request context, end-to-end API+UI           |
| §11 Accessibility          | axe-core integration, WCAG audits            |
| §12 Sharding               | CI matrix sharding, report merging           |
| §13 CI/CD                  | GitHub Actions with artifacts                |
| §14 Debugging Toolkit      | Debug, UI mode, trace viewer, codegen        |
| §15 Debugging Table        | 10 common problems with fixes                |
| §16 Best Practices         | 17-item production checklist                 |
