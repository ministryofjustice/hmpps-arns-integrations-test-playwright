import { Locator, Page } from '@playwright/test';
import { AapPage } from './aap-page';

export default class EmploymentPage extends AapPage {
  // Employment
  readonly employmentStatus: Locator;
  readonly employmentType: Locator;
  readonly employmentHistory: Locator;
  readonly employmentOtherResponsibilities: Locator;
  readonly educationHighestLevelCompleted: Locator;
  readonly educationProfessionalOrVocationalQualifications: Locator;
  readonly educationTransferableSkills: Locator;
  readonly educationDifficulties: Locator;
  readonly employmentExperience: Locator;
  readonly educationExperience: Locator;
  readonly employmentEducationFactors: Locator;
  readonly employmentEducationRiskOfHarm: Locator;
  readonly employmentEducationRiskOfReoffending: Locator;
  readonly employmentComplete: Locator;

  constructor(page: Page) {
    super(page);
    // Employment
    this.employmentStatus = page.getByRole('radio', { name: 'Employed', exact: true });
    this.employmentType = page.getByRole('radio', { name: 'Full-time' });
    this.employmentHistory = page.getByRole('radio', { name: 'Continuous employment history' });
    this.employmentOtherResponsibilities = page.getByRole('checkbox', { name: 'Caring responsibilities' });
    this.educationHighestLevelCompleted = page.getByRole('radio', { name: 'Entry level' });
    this.educationProfessionalOrVocationalQualifications = page
      .getByRole('group', { name: /any professional or vocational qualifications/ })
      .getByLabel('No', { exact: true });
    this.educationTransferableSkills = page.getByRole('radio', {
      name: 'No',
      description: /no other qualifications, incomplete apprenticeships/,
      exact: true,
    });
    this.educationDifficulties = page.getByRole('checkbox', { name: 'No difficulties' });
    this.employmentExperience = page
      .getByRole('group', { name: /overall experience of employment/ })
      .getByLabel('Unknown');
    this.educationExperience = page.getByRole('group', { name: /experience of education/ }).getByLabel('Unknown');
    this.employmentEducationFactors = page.getByRole('group', { name: 'Are there any strengths or' }).getByLabel('No');
    this.employmentEducationRiskOfHarm = page
      .getByRole('group', { name: /linked to risk of serious harm/ })
      .getByLabel('No');
    this.employmentEducationRiskOfReoffending = page
      .getByRole('group', { name: /linked to risk of reoffending/ })
      .getByLabel('No');
    this.employmentComplete = page
      .locator('[data-status="COMPLETE"]')
      .getByRole('link', { name: 'Employment and education' });
  }

  async complete() {
    await this.employmentStatus.check();
    await this.employmentType.check();
    await this.saveAndContinue.click();

    await this.employmentHistory.check();
    await this.employmentOtherResponsibilities.check();
    await this.educationHighestLevelCompleted.check();
    await this.educationProfessionalOrVocationalQualifications.check();
    await this.educationTransferableSkills.check();
    await this.educationDifficulties.check();
    await this.employmentExperience.check();
    await this.educationExperience.check();
    await this.changesNotApplicable.check();
    await this.saveAndContinue.click();
    await this.completePractionerAnalysis();
    await this.sectionComplete('Employment and education');
  }
}
