import { expect, Locator, Page } from '@playwright/test';

export class AapPage {
  readonly page: Page;
  readonly continue: Locator;
  readonly saveAndContinue: Locator;
  readonly changesNotApplicable: Locator;
  readonly practitionerAnalysis: Locator;
  readonly noProtectiveFactors: Locator;
  readonly noRiskOfHarm: Locator;
  readonly noRiskOfReoffending: Locator;
  readonly markAsComplete: Locator;
  readonly unknown: Locator;

  constructor(page: Page) {
    this.page = page;
    this.continue = page.getByRole('button', { name: 'Continue', exact: true });
    this.saveAndContinue = page.getByRole('button', { name: 'Save and continue' });
    this.changesNotApplicable = page.getByRole('radio', { name: 'Not applicable' });
    this.practitionerAnalysis = page.getByRole('tab', { name: 'Practitioner analysis' });
    this.noProtectiveFactors = page.getByRole('group', { name: 'Are there any strengths or' }).getByLabel('No');
    this.noRiskOfHarm = page.getByRole('group', { name: 'linked to risk of serious harm?' }).getByLabel('No');
    this.noRiskOfReoffending = page.getByRole('group', { name: 'linked to risk of reoffending?' }).getByLabel('No');
    this.markAsComplete = page.getByRole('button', { name: 'Mark as complete' });
    this.unknown = page.getByRole('radio', { name: 'Unknown' });
  }

  async sectionComplete(section: string) {
    await expect(this.page.getByRole('listitem').filter({ hasText: section })).toMatchAriaSnapshot(`
        - listitem:
            - link "${section}"
            - text: ✓
        `);
  }

  async completePractionerAnalysis() {
    await this.practitionerAnalysis.click();
    await this.practionerAnalysisQuestions();
    await this.markAsComplete.click();
  }

  async practionerAnalysisQuestions() {
    await this.noProtectiveFactors.check();
    await this.noRiskOfHarm.check();
    await this.noRiskOfReoffending.check();
  }
}
