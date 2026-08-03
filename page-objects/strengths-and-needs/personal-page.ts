import { Locator, Page } from '@playwright/test';
import { AapPage } from './aap-page';

export default class PersonalPage extends AapPage {
  // Personal Relationships and Community
  readonly childrenDetails: Locator;
  readonly childrenDetailsChange: Locator;
  readonly childrenLivingWithPopDetails: Locator;
  readonly importantPeople: Locator;
  readonly currentRelationship: Locator;
  readonly intimateRelationship: Locator;
  readonly familyRelationship: Locator;
  readonly challengesIntimateRelationship: Locator;
  readonly childhood: Locator;
  readonly childhoodBehaviour: Locator;

  constructor(page: Page) {
    super(page);
    // Personal Relationships and Community
    this.childrenDetails = page.getByRole('checkbox', { name: 'Yes, children that live with' });
    this.childrenDetailsChange = page.getByRole('link', { name: 'Change  value for Are there' });
    this.childrenLivingWithPopDetails = page.getByRole('textbox', { name: 'Include the name, age and sex' });
    this.importantPeople = page.getByRole('checkbox', { name: 'Partner or someone they’re in' });
    this.currentRelationship = page.getByRole('radio', { name: 'Happy and positive about' });
    this.intimateRelationship = page.getByRole('radio', { name: 'History of stable, supportive' });
    this.familyRelationship = page.getByRole('radio', {
      name: 'Stable, supportive, positive and rewarding relationship',
      exact: true,
    });
    this.challengesIntimateRelationship = page.getByRole('textbox', {
      name: 'any challenges in their intimate relationships?',
    });
    this.childhood = page.getByRole('radio', { name: 'Positive experience' });
    this.childhoodBehaviour = page.getByRole('radio', { name: 'Yes' });
  }

  async complete() {
    await this.childrenDetails.check();
    await this.childrenLivingWithPopDetails.fill('child 1');
    await this.saveAndContinue.click();

    await this.importantPeople.check();
    await this.saveAndContinue.click();

    await this.currentRelationship.check();
    await this.intimateRelationship.check();
    await this.familyRelationship.check();
    await this.challengesIntimateRelationship.fill('person is comfortable addressing challenges.');
    await this.childhood.check();
    await this.childhoodBehaviour.check();
    await this.changesNotApplicable.check();
    await this.saveAndContinue.click();

    await this.completePractionerAnalysis();
    await this.sectionComplete('Personal relationships and community');
  }
}
