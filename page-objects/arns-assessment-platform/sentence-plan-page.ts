import { Locator, Page } from '@playwright/test';

export class SentencePlanPage {
  readonly page: Page;
  readonly createGoal: Locator;
  readonly goalTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createGoal = page.getByRole('button', { name: 'Create goal' });
    this.goalTitle = page.locator('[data-qa="goal-title"]');
  }
}
