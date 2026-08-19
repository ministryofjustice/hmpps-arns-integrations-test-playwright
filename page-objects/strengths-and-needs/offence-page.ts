import { Locator, Page } from '@playwright/test';
import { AapPage } from './aap-page';

export default class OffencePage extends AapPage {
  readonly offenceDescription: Locator;
  readonly offenceElements: Locator;
  readonly offenceReason: Locator;
  readonly offenceMotivations: Locator;
  readonly offenceVictim: Locator;
  readonly offenceVictimRelationship: Locator;
  readonly offenceVictimAge: Locator;
  readonly offenceVictimSex: Locator;
  readonly offenceVictimRace: Locator;
  readonly offenceHowManyInvolved: Locator;
  readonly offenceLeaderOfTheCurrentIndex: Locator;
  readonly offenceImpactOnVictims: Locator;
  readonly offenceAcceptResponsibility: Locator;
  readonly offencePatternsOfOffending: Locator;
  readonly offenceEscalation: Locator;
  readonly offenceRisk: Locator;
  readonly offenceRiskDetails: Locator;
  readonly offencePerpetratorDomesticAbuse: Locator;
  readonly offenceVictimDomesticAbuse: Locator;
  readonly offenceAnalysisHeading: Locator;
  readonly offenceAnalysisComplete: Locator;

  constructor(page: Page) {
    super(page);
    this.offenceDescription = page.getByRole('textbox', { name: 'Enter a brief description of' });
    this.offenceElements = page.getByRole('checkbox', { name: 'Arson' });
    this.offenceReason = page.getByRole('textbox', { name: 'Why did the current index' });
    this.offenceMotivations = page.getByRole('checkbox', { name: 'Addictions or perceived needs' });
    this.offenceVictim = page.getByRole('checkbox', { name: 'One or more people' });
    this.offenceVictimRelationship = page.getByRole('radio', { name: 'A stranger' });
    this.offenceVictimAge = page.getByRole('radio', { name: '0 to 4 years' });
    this.offenceVictimSex = page.getByRole('radio', { name: 'Male', exact: true });
    this.offenceVictimRace = page.getByLabel("What is the victim's ethnicity?");
    this.offenceHowManyInvolved = page.locator('#offence_analysis_how_many_involved');
    this.offenceLeaderOfTheCurrentIndex = page
      .getByRole('group', { name: /leader of the current index/ })
      .getByLabel('No', { exact: true });
    this.offenceImpactOnVictims = page
      .getByRole('group', { name: /recognise the impact on the victims/ })
      .getByLabel('No', { exact: true });
    this.offenceAcceptResponsibility = page
      .getByRole('group', { name: /accept responsibility for the current index/ })
      .getByLabel('No', { exact: true });
    this.offencePatternsOfOffending = page.getByRole('textbox', { name: 'What are the patterns of' });
    this.offenceEscalation = page
      .getByRole('group', { name: /Is there an escalation in/ })
      .getByLabel('No', { exact: true });
    this.offenceRisk = page
      .getByRole('group', { name: /Are the current or previous offences linked to risk/ })
      .getByLabel('No', { exact: true });
    this.offenceRiskDetails = page.getByRole('textbox', { name: 'Give details', exact: true });
    this.offencePerpetratorDomesticAbuse = page
      .getByRole('group', { name: /has ever been a perpetrator of domestic abuse?/ })
      .getByLabel('No');
    this.offenceVictimDomesticAbuse = page
      .getByRole('group', { name: /has ever been a victim of domestic abuse?/ })
      .getByLabel('No', { exact: true });
    this.offenceAnalysisHeading = page.locator('span').filter({ hasText: 'Offence analysis' });
    this.offenceAnalysisComplete = page.getByText('Complete', { exact: true });
  }

  async complete() {
    await this.offenceDescription.fill('This is a brief description for the offence analysis.');
    await this.offenceElements.check();
    await this.offenceReason.fill('This is why this took place.');
    await this.offenceMotivations.check();
    await this.offenceVictim.check();
    await this.saveAndContinue.click();

    await this.offenceVictimRelationship.check();
    await this.offenceVictimAge.check();
    await this.offenceVictimSex.check();
    await this.offenceVictimRace.selectOption('White - Gypsy or Irish Traveller');
    await this.saveAndContinue.click();
    await this.continue.click();

    await this.offenceLeaderOfTheCurrentIndex.check();
    await this.offenceImpactOnVictims.check();
    await this.offenceAcceptResponsibility.check();
    await this.offencePatternsOfOffending.fill('There are no obvious patterns at this point.');
    await this.offenceEscalation.check();
    await this.offenceRisk.check();
    await this.offenceRiskDetails.fill('No risk of serious harm.');
    await this.offencePerpetratorDomesticAbuse.check();
    await this.offenceVictimDomesticAbuse.check();
    await this.markAsComplete.click();
    await this.sectionComplete('Offence analysis');
  }
}
