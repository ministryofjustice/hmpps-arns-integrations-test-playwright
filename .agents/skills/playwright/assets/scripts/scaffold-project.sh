#!/bin/bash
# scaffold-project.sh — Generate a Playwright project structure
# Usage: bash scaffold-project.sh [project-name]
#
# Exit codes:
#   0 = success
#   1 = npm not found
#   2 = directory already exists

set -e

PROJECT_NAME="${1:-playwright-tests}"

echo "🎭 Scaffolding Playwright project: $PROJECT_NAME"

# Check prerequisites
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found. Install Node.js from https://nodejs.org"
    exit 1
fi

if [ -d "$PROJECT_NAME" ]; then
    echo "❌ Directory '$PROJECT_NAME' already exists."
    echo "   Choose a different name or delete the existing directory."
    exit 2
fi

# Create structure
mkdir -p "$PROJECT_NAME"/{tests,pages,fixtures,utils}
cd "$PROJECT_NAME"

echo "📦 Initializing npm project..."
npm init -y > /dev/null 2>&1
npm install -D @playwright/test typescript > /dev/null 2>&1

echo "🌐 Installing browsers..."
npx playwright install --with-deps chromium > /dev/null 2>&1

# tsconfig.json
cat > tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "dist",
    "rootDir": "."
  },
  "include": ["tests/**/*.ts", "pages/**/*.ts", "fixtures/**/*.ts"]
}
EOF

# playwright.config.ts
cat > playwright.config.ts << 'EOF'
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
  ],
});
EOF

# Base page
cat > pages/base.page.ts << 'EOF'
import { Page } from '@playwright/test';

export abstract class BasePage {
  constructor(protected page: Page) {}

  async navigate(path: string) {
    await this.page.goto(path);
  }
}
EOF

# Example page object
cat > pages/home.page.ts << 'EOF'
import { Page, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class HomePage extends BasePage {
  readonly heading: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { level: 1 });
  }

  async goto() {
    await this.navigate('/');
  }
}
EOF

# Fixtures
cat > fixtures/pages.fixture.ts << 'EOF'
import { test as base } from '@playwright/test';
import { HomePage } from '../pages/home.page';

type Pages = {
  homePage: HomePage;
};

export const test = base.extend<Pages>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
});

export { expect } from '@playwright/test';
EOF

# Example test
cat > tests/home.spec.ts << 'EOF'
import { test, expect } from '../fixtures/pages.fixture';

test.describe('Home Page', () => {
  test('should display heading', async ({ homePage }) => {
    await homePage.goto();
    await expect(homePage.heading).toBeVisible();
  });
});
EOF

# .gitignore
cat > .gitignore << 'EOF'
node_modules/
test-results/
playwright-report/
dist/
*.env
EOF

echo ""
echo "✅ Project scaffolded successfully!"
echo ""
echo "   cd $PROJECT_NAME"
echo "   npx playwright test              # Run tests"
echo "   npx playwright test --ui         # Interactive mode"
echo "   npx playwright test --debug      # Debug mode"
