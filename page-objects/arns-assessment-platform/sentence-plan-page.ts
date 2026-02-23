import { Locator, Page } from '@playwright/test';

export class SentencePlanPage {
  readonly page: Page;
  readonly createGoal: Locator;
  readonly goalTitle: Locator;
  readonly header: Locator;
  readonly goalSummary: Locator;
  readonly agreePlan: Locator;
  readonly yesIAgree: Locator;
  readonly save: Locator;
  readonly planHistory: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createGoal = page.getByRole('button', { name: 'Create goal' });
    this.goalTitle = page.locator('[data-qa="goal-title"]');
    this.header = page.locator('[data-qa="plan-header"]');
    this.goalSummary = page.locator('[data-qa="goal-summary-card"]');
    this.agreePlan = page.getByRole('button', { name: 'Agree plan' });
    this.yesIAgree = page.getByRole('radio', { name: 'Yes, I agree' });
    this.save = page.getByRole('button', { name: 'Save' });
    this.planHistory = page.getByRole('link', { name: 'View plan history' });
  }
}
