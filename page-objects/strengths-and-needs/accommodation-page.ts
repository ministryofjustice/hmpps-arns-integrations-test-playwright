import { Locator, Page } from '@playwright/test';
import { AapPage } from './aap-page';

export default class AccommodationPage extends AapPage {
  readonly settled: Locator;
  readonly homeowner: Locator;
  readonly livingWith: Locator;
  readonly suitableHousingLocation: Locator;
  readonly suitableHousing: Locator;

  constructor(page: Page) {
    super(page);
    this.settled = page.getByRole('radio', { name: 'Settled' });
    this.homeowner = page.getByRole('radio', { name: 'Homeowner' });
    this.livingWith = page.getByRole('checkbox', { name: 'Family' });
    this.suitableHousingLocation = page.getByRole('group', { name: 'Is the location of' }).getByLabel('Yes');
    this.suitableHousing = page.getByRole('radio', { name: 'Yes, with concerns' });
  }

  async complete() {
    await this.settled.check();
    await this.homeowner.check();
    await this.saveAndContinue.click();
    await this.livingWith.check();
    await this.suitableHousingLocation.check();
    await this.suitableHousing.check();
    await this.changesNotApplicable.check();
    await this.saveAndContinue.click();

    await this.completePractionerAnalysis();
    await this.sectionComplete('Accommodation');
  }
}
