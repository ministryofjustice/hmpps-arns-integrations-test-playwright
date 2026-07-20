import { Locator, Page } from '@playwright/test';

export class AreaOfNeedPage {
  readonly page: Page;
  readonly accommodation: Locator;
  readonly finances: Locator;
  readonly continue: Locator;
  readonly employmentAndEducation: Locator;

  constructor(page: Page) {
    this.page = page;
    this.accommodation = page.getByLabel('Accommodation');
    // this.finances = page.getByLabel('Finances');
    this.finances = page.getByRole('link', { name: 'Finances' });
    this.continue = page.getByRole('button', { name: 'Continue' });
    this.employmentAndEducation = page.getByLabel('Employment and education');
  }

  async select(area: string = 'Finances') {
    switch (area) {
      case 'Accommodation':
        await this.accommodation.click();
        break;
      case 'Employment and education':
        await this.employmentAndEducation.click();
        break;
      default:
        await this.finances.click();
        break;
    }
    await this.continue.click();
  }
}
