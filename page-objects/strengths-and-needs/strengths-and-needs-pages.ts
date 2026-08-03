import { expect, Locator, Page } from '@playwright/test';
import { AapPage } from './aap-page';
import EmploymentPage from './employment-page';
import FinancesPage from './finances-page';
import AlcoholPage from './alcohol-page';
import HealthPage from './health-page';
import PersonalPage from './personal-page';
import BehavioursPage from './behaviours-page';

export class StrengthsAndNeedsPage extends AapPage {
  readonly settled: Locator;
  readonly homeowner: Locator;
  readonly livingWith: Locator;
  readonly suitableHousingLocation: Locator;
  readonly suitableHousing: Locator;
  readonly employmentAndEducation: Locator;
  readonly finances: Locator;
  readonly drugUse: Locator;
  readonly alcoholUse: Locator;
  readonly healthAndWellbeing: Locator;
  readonly personalRelationships: Locator;
  readonly behavioursAndAttitudes: Locator;
  readonly offenceAnalysis: Locator;

  // Drug Use
  readonly drugUseYes: Locator;
  readonly drugLastUsed: Locator;
  readonly drugMisused: Locator;
  readonly drugFrequency: Locator;
  readonly drugInjected: Locator;
  readonly giveDetailsUseOfDrugs: Locator;
  readonly drugReceivingTreatment: Locator;
  readonly drugReasonsForUse: Locator;
  readonly drugAffectedLife: Locator;

  // Offence Analysis
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

  // Pages
  readonly employment: EmploymentPage;
  readonly finance: FinancesPage;
  readonly alcohol: AlcoholPage;
  readonly health: HealthPage;
  readonly personal: PersonalPage;
  readonly behaviours: BehavioursPage;

  constructor(page: Page) {
    super(page);
    this.employment = new EmploymentPage(page);
    this.finance = new FinancesPage(page);
    this.alcohol = new AlcoholPage(page);
    this.health = new HealthPage(page);
    this.personal = new PersonalPage(page);
    this.behaviours = new BehavioursPage(page);

    this.settled = page.getByRole('radio', { name: 'Settled' });
    this.homeowner = page.getByRole('radio', { name: 'Homeowner' });
    this.livingWith = page.getByRole('checkbox', { name: 'Family' });
    this.suitableHousingLocation = page.getByRole('group', { name: 'Is the location of' }).getByLabel('Yes');
    this.suitableHousing = page.getByRole('radio', { name: 'Yes, with concerns' });
    this.employmentAndEducation = page.getByRole('link', { name: 'Employment and education' });
    this.finances = page.getByRole('link', { name: 'Finances' });
    this.drugUse = page.getByRole('link', { name: 'Drug use' });
    this.alcoholUse = page.getByRole('link', { name: 'Alcohol use' });
    this.healthAndWellbeing = page.getByRole('link', { name: 'Health and wellbeing' });
    this.personalRelationships = page.getByRole('link', { name: 'Personal relationships and community' });
    this.behavioursAndAttitudes = page.getByRole('link', { name: 'Thinking, behaviours and attitudes' });
    this.offenceAnalysis = page.getByRole('link', { name: 'Offence analysis' });

    // Drug Use
    this.drugUseYes = page.getByRole('radio', { name: 'Yes' });
    this.drugLastUsed = page.getByRole('radio', { name: 'Used in the last 6 months' });
    this.drugMisused = page.getByRole('checkbox', { name: 'Amphetamines (including speed' });
    this.drugFrequency = page.getByRole('radio', { name: 'Daily' });
    this.giveDetailsUseOfDrugs = page.getByLabel('Give details about');
    this.drugInjected = page.getByRole('checkbox', { name: 'None' });
    this.drugReceivingTreatment = page.getByRole('radio', { name: 'No' });
    this.drugReasonsForUse = page.getByRole('checkbox', { name: 'Cultural or religious practice' });
    this.drugAffectedLife = page.getByRole('checkbox', { name: 'Behaviour' });

    // Offence Analysis
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

  // Accomodation
  async completeAccomodation() {
    await this.settled.check();
    await this.homeowner.check();
    await this.saveAndContinue.click();
    await this.livingWith.check();
    await this.suitableHousingLocation.check();
    await this.suitableHousing.check();
    await this.changesNotApplicable.check();
    await this.saveAndContinue.click();

    await this.practitionerAnalysis.click();
    await this.noProtectiveFactors.check();
    await this.noRiskOfHarm.check();
    await this.noRiskOfReoffending.check();
    await this.markAsComplete.click();
    await this.sectionComplete('Accommodation');
  }

  async completeDrugUse() {
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
    await this.noProtectiveFactors.check();
    await this.noRiskOfHarm.check();
    await this.noRiskOfReoffending.check();
    await this.markAsComplete.click();
    await this.sectionComplete('Drug use');
  }

  async completeOffenceAnalysis() {
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

  async confirmUserIsOnOffenceAnalysisPage() {
    await expect(this.offenceAnalysisHeading).toBeVisible();
    await expect(this.offenceAnalysisComplete).toBeVisible();
  }
}
