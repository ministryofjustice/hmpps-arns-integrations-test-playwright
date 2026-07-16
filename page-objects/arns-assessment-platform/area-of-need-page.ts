import { Locator, Page } from '@playwright/test';

export class AreaOfNeedPage {
  readonly page: Page;
  readonly finances: Locator;
  readonly continue: Locator;

  constructor(page: Page) {
    this.page = page;
    this.finances = page.getByLabel('Finances');
    this.continue = page.getByRole('button', { name: 'Continue' });
  }

  async select() {
    await this.finances.click();
    await this.continue.click();
  }
}
