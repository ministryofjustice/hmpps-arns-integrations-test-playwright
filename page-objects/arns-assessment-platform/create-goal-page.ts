import { Locator, Page } from '@playwright/test';

export class CreateGoalPage {
  readonly page: Page;
  readonly searchGoal: Locator;
  readonly relatedGoalYes: Locator;
  readonly relatedAreaAlcohol: Locator;
  readonly startWorkingOnThisGoalYes: Locator;
  readonly whenAimToAchieveGoal: Locator;
  readonly addSteps: Locator;
  readonly viewInformation: Locator;
  readonly employmentAndEducation: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchGoal = page.locator('accessible-autocomplete-wrapper').getByRole('combobox');
    this.relatedGoalYes = page.getByRole('group', { name: 'Is this goal related to any' }).getByLabel('Yes');
    this.relatedAreaAlcohol = page.getByRole('checkbox', { name: 'Alcohol use' });
    this.startWorkingOnThisGoalYes = page.getByRole('group', { name: 'start working on this goal' }).getByLabel('Yes');
    this.whenAimToAchieveGoal = page.getByRole('radio', { name: 'In 3 months' });
    this.addSteps = page.getByRole('button', { name: 'Add Steps' });
    this.viewInformation = page.locator('summary').filter({ hasText: 'View information' });
    this.employmentAndEducation = page.getByRole('link', { name: 'Employment and education' });
  }
}
