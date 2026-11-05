import { Locator, Page } from '@playwright/test';
import { AapPage } from './aap-page';

export default class DrugPage extends AapPage {
  readonly drugUseYes: Locator;
  readonly drugLastUsed: Locator;
  readonly drugMisused: Locator;
  readonly drugFrequency: Locator;
  readonly drugInjected: Locator;
  readonly giveDetailsUseOfDrugs: Locator;
  readonly drugReceivingTreatment: Locator;
  readonly drugReasonsForUse: Locator;
  readonly drugAffectedLife: Locator;

  constructor(page: Page) {
    super(page);
    this.drugUseYes = page.getByRole('radio', { name: 'Yes' });
    this.drugLastUsed = page.getByRole('radio', { name: 'Used in the last 6 months' });
    this.drugMisused = page.getByRole('checkbox', { name: 'Amphetamines (including speed' });
    this.drugFrequency = page.getByRole('radio', { name: 'Daily' });
    this.giveDetailsUseOfDrugs = page.getByLabel('Give details about');
    this.drugInjected = page.getByRole('checkbox', { name: 'None' });
    this.drugReceivingTreatment = page.getByRole('radio', { name: 'No' });
    this.drugReasonsForUse = page.getByRole('checkbox', { name: 'Cultural or religious practice' });
    this.drugAffectedLife = page.getByRole('checkbox', { name: 'Behaviour' });
  }

  async complete() {
    await this.drugUseYes.check();
    await this.saveAndContinue.click();

    await this.drugMisused.check();
    await this.drugLastUsed.check();
    await this.saveAndContinue.click();

    await this.drugFrequency.check();
    await this.drugInjected.check();
    await this.drugReceivingTreatment.check();
    await this.saveAndContinue.click();

    await this.drugReasonsForUse.check();
    await this.drugAffectedLife.check();
    await this.changesNotApplicable.check();
    await this.saveAndContinue.click();

    await this.practitionerAnalysis.click();
    await this.unknown.click();
    await this.practionerAnalysisQuestions();
    await this.markAsComplete.click();
    await this.sectionComplete('Drug use');
  }
}
