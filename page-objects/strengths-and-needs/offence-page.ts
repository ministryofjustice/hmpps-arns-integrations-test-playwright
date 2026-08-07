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
    this.offenceDescription = page.locator('#offence_analysis_description_of_offence');
    this.offenceElements = page.locator('#offence_analysis_elements-9');
    this.offenceReason = page.locator('#offence_analysis_reason');
    this.offenceMotivations = page.locator('#offence_analysis_motivations-8');
    this.offenceVictim = page.locator('#offence_analysis_who_was_the_victim');
    this.offenceVictimRelationship = page.locator('#offence_analysis_victim_relationship');
    this.offenceVictimAge = page.locator('#offence_analysis_victim_age-8');
    this.offenceVictimSex = page.locator('#offence_analysis_victim_sex-4');
    this.offenceVictimRace = page.locator('#offence_analysis_victim_race');
    this.offenceHowManyInvolved = page.locator('#offence_analysis_how_many_involved');
    this.offenceImpactOnVictims = page.locator('#offence_analysis_impact_on_victims');
    this.offenceAcceptResponsibility = page.locator('#offence_analysis_accept_responsibility');
    this.offencePatternsOfOffending = page.locator('#offence_analysis_patterns_of_offending');
    this.offenceEscalation = page.locator('#offence_analysis_escalation-3');
    this.offenceRisk = page.locator('#offence_analysis_risk-2');
    this.offenceRiskDetails = page.locator('#offence_analysis_risk_no_details');
    this.offencePerpetratorDomesticAbuse = page.locator('#offence_analysis_perpetrator_of_domestic_abuse-2');
    this.offenceVictimDomesticAbuse = page.locator('#offence_analysis_victim_of_domestic_abuse-2');
    this.offenceAnalysisHeading = page.getByRole('heading', { name: 'Offence analysis' });
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
    await this.saveAndContinue.click();

    await this.offenceHowManyInvolved.check();
    await this.saveAndContinue.click();

    await this.offenceImpactOnVictims.check();
    await this.offenceAcceptResponsibility.check();
    await this.offencePatternsOfOffending.fill('There are no obvious patterns at this point.');
    await this.offenceEscalation.check();
    await this.offenceRisk.check();
    await this.offenceRiskDetails.fill('No risk of serious harm.');
    await this.offencePerpetratorDomesticAbuse.check();
    await this.offenceVictimDomesticAbuse.check();
    await this.markAsComplete.click();
  }
}
