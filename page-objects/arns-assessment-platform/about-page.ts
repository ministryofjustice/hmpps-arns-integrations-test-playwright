import { Locator, Page } from '@playwright/test';

export class AboutPage {
  readonly page: Page;
  readonly alcoholUse: Locator;
  readonly assessmentInfoAndScore: Locator;

  constructor(page: Page) {
    this.page = page;
    this.alcoholUse = page.getByRole('button', { name: 'Alcohol use' });
    this.assessmentInfoAndScore = page.locator('[data-qa="assessment-info-and-score-content"]');
  }
}
