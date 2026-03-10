import { Locator, Page } from '@playwright/test';

export class PreviousVersionsPage {
  readonly page: Page;
  readonly viewAssessment: Locator;
  readonly viewSentencePlan: Locator;

  constructor(page: Page) {
    this.page = page;
    this.viewAssessment = page.getByRole('link', { name: 'assessment from' }).first();
    this.viewSentencePlan = page.getByRole('link', { name: 'plan from' }).first();
  }
}
