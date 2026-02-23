import { Locator, Page } from '@playwright/test';

export class SentencePlanPage {
  readonly page: Page;
  readonly createGoal: Locator;
  readonly goalTitle: Locator;
  readonly header: Locator;
  readonly goalSummary: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createGoal = page.getByRole('button', { name: 'Create goal' });
    this.goalTitle = page.locator('[data-qa="goal-title"]');
    this.header = page.locator('[data-qa="plan-header"]');
    this.goalSummary = page.locator('[data-qa="goal-summary-card"]');
  }
}
