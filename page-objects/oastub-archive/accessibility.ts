import { expect, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

export class Accessibility {
  constructor(private page: Page) {}

  async shouldHaveNoAccessibilityViolations() {
    const accessibilityScanResults = await new AxeBuilder({ page: this.page }).analyze();
    expect(accessibilityScanResults.violations).toEqual([]);
  }
}
