import { expect, Locator, Page } from '@playwright/test';

export class TrainingLauncherPage {
  readonly baseUrl: string = 'https://arns-assessment-platform-test.hmpps.service.justice.gov.uk';
  readonly page: Page;
  readonly startSession: Locator;
  readonly generateLink: Locator;
  readonly confirmPrivacy: Locator;

  constructor(page: Page) {
    this.page = page;
    this.startSession = page.getByRole('button', { name: 'Start session' });
    this.generateLink = page.getByRole('button', { name: 'Generate link' });
    this.confirmPrivacy = page.getByRole('checkbox', { name: 'confirm_privacy' });
  }

  goto = async () => {
    await this.page.goto(`${this.baseUrl}/training-session-launcher/browse?scenario=default`);
    await expect(this.page).toHaveTitle('Assess and plan');
  };

  generateHandoverLink = async () => {
    await this.startSession.click();
    await this.generateLink.click();
  };
}
