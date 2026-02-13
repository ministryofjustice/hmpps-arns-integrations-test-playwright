import { Locator, Page } from '@playwright/test';

export class PrivacyPage {
  readonly page: Page;
  readonly confirmPrivacy: Locator;
  readonly confirm: Locator;

  constructor(page: Page) {
    this.page = page;
    this.confirmPrivacy = page.getByRole('checkbox', { name: 'I confirm' });
    this.confirm = page.getByRole('button', { name: 'Confirm' });
  }
}
