import { Locator, Page } from '@playwright/test';
import { AapPage } from './aap-page';

export default class AlcoholPage extends AapPage {
  // Alochol use
  readonly alcoholUseNo: Locator;

  constructor(page: Page) {
    super(page);
    // Alcohol use
    this.alcoholUseNo = page.getByRole('radio', { name: 'No', exact: true });
  }

  async complete() {
    await this.alcoholUseNo.check();
    await this.saveAndContinue.click();

    await this.completePractionerAnalysis();
    await this.sectionComplete('Alcohol use');
  }
}
