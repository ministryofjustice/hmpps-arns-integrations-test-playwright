import { BrowserContext, Locator, Page } from '@playwright/test';

export class SentencePlanV2Page {
  readonly page: Page;
  readonly viewPreviousVersions: Locator;
  readonly previousVersionsHeading: Locator;
  readonly update: Locator;
  readonly changeGoalDetails: Locator;
  readonly goalInput: Locator;
  readonly saveGoal: Locator;
  readonly saveGoalAndSteps: Locator;
  readonly viewPlan: Locator;

  constructor(page: Page) {
    this.page = page;
    this.viewPreviousVersions = page.getByRole('link', { name: 'View previous versions' });
    this.previousVersionsHeading = page.getByRole('heading', { name: 'Previous versions' });
    this.update = page.getByRole('link', { name: 'Update' });
    this.changeGoalDetails = page.getByRole('link', { name: 'Change goal details' });
    this.goalInput = page.getByRole('textbox', { name: 'What goal should' });
    this.saveGoal = page.getByRole('button', { name: 'Save goal' });
    this.saveGoalAndSteps = page.getByRole('button', { name: 'Save goal and steps' });
    this.viewPlan = page.getByRole('link', { name: 'View   plan' }).first();
  }

  async viewPreviousVersion(context: BrowserContext): Promise<Page> {
    const previousVersionsPage = context.waitForEvent('page');
    await this.viewPlan.click();
    return await previousVersionsPage;
  }
}
