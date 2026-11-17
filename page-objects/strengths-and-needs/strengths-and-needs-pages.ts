import { Locator, Page } from '@playwright/test';
import { AapPage } from './aap-page';
import EmploymentPage from './employment-page';
import FinancesPage from './finances-page';
import AlcoholPage from './alcohol-page';
import HealthPage from './health-page';
import PersonalPage from './personal-page';
import BehavioursPage from './behaviours-page';
import DrugPage from './drug-page';
import OffencePage from './offence-page';
import AccommodationPage from './accommodation-page';

export class StrengthsAndNeedsPage extends AapPage {
  readonly employmentAndEducation: Locator;
  readonly finances: Locator;
  readonly drugUse: Locator;
  readonly alcoholUse: Locator;
  readonly healthAndWellbeing: Locator;
  readonly personalRelationships: Locator;
  readonly behavioursAndAttitudes: Locator;
  readonly offenceAnalysis: Locator;

  // Pages
  readonly employment: EmploymentPage;
  readonly finance: FinancesPage;
  readonly alcohol: AlcoholPage;
  readonly health: HealthPage;
  readonly personal: PersonalPage;
  readonly behaviours: BehavioursPage;
  readonly drug: DrugPage;
  readonly offence: OffencePage;
  readonly accommodation: AccommodationPage;

  constructor(page: Page) {
    super(page);
    this.employment = new EmploymentPage(page);
    this.finance = new FinancesPage(page);
    this.alcohol = new AlcoholPage(page);
    this.health = new HealthPage(page);
    this.personal = new PersonalPage(page);
    this.behaviours = new BehavioursPage(page);
    this.drug = new DrugPage(page);
    this.offence = new OffencePage(page);
    this.accommodation = new AccommodationPage(page);

    this.employmentAndEducation = page.getByRole('link', { name: 'Employment and education' });
    this.finances = page.getByRole('link', { name: 'Finances' });
    this.drugUse = page.getByRole('link', { name: 'Drug use' });
    this.alcoholUse = page.getByRole('link', { name: 'Alcohol use' });
    this.healthAndWellbeing = page.getByRole('link', { name: 'Health and wellbeing' });
    this.personalRelationships = page.getByRole('link', { name: 'Personal relationships and community' });
    this.behavioursAndAttitudes = page.getByRole('link', { name: 'Thinking, behaviours and attitudes' });
    this.offenceAnalysis = page.getByRole('link', { name: 'Offence analysis' });
  }
}
