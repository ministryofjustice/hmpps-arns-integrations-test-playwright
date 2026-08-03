import { Locator, Page } from '@playwright/test';
import { AapPage } from './aap-page';

export default class HealthPage extends AapPage {
  // Health and Wellbeing
  readonly physicalHealthCondition: Locator;
  readonly mentalHealthCondition: Locator;
  readonly psychiatricTreatment: Locator;
  readonly headInjury: Locator;
  readonly neurodiverseConditions: Locator;
  readonly healthCoping: Locator;
  readonly attitudeTowardsSelf: Locator;
  readonly selfHarmed: Locator;
  readonly attemptedSuicide: Locator;
  readonly healthOutlook: Locator;

  constructor(page: Page) {
    super(page);
    // Health and Wellbeing
    this.physicalHealthCondition = page.getByRole('radio', { name: 'Yes', exact: true });
    this.mentalHealthCondition = page.getByRole('radio', { name: 'Yes, ongoing - severe and' });
    this.psychiatricTreatment = page.getByRole('radio', { name: 'Pending treatment' });
    this.headInjury = page.getByRole('group', { name: 'had a head injury or' }).getByLabel('No', { exact: true });
    this.neurodiverseConditions = page
      .getByRole('group', { name: 'have any neurodiverse conditions?' })
      .getByLabel('No', { exact: true });
    this.healthCoping = page.getByRole('radio', { name: 'Yes, able to cope well' });
    this.attitudeTowardsSelf = page.getByRole('radio', { name: 'Positive and reasonably happy' });
    this.selfHarmed = page.getByRole('group', { name: 'ever self-harmed?' }).getByLabel('No');
    this.attemptedSuicide = page.getByRole('group', { name: 'ever attempted' }).getByLabel('No');
    this.healthOutlook = page.getByRole('radio', { name: 'Not optimistic and thinks' });
  }

  async complete() {
    await this.physicalHealthCondition.check();
    await this.mentalHealthCondition.check();
    await this.saveAndContinue.click();
    await this.psychiatricTreatment.check();
    await this.headInjury.check();
    await this.neurodiverseConditions.check();
    await this.healthCoping.check();
    await this.attitudeTowardsSelf.check();
    await this.selfHarmed.check();
    await this.attemptedSuicide.check();
    await this.healthOutlook.check();
    await this.changesNotApplicable.check();
    await this.saveAndContinue.click();

    await this.completePractionerAnalysis();
    await this.sectionComplete('Health and wellbeing');
  }
}
