import { expect, Locator, Page } from '@playwright/test';

export class PrivacyPage {
  readonly page: Page;
  readonly confirmPrivacy: Locator;
  readonly confirm: Locator;

  constructor(page: Page) {
    this.page = page;
    this.confirmPrivacy = page.getByRole('checkbox', { name: 'I confirm' });
    this.confirm = page.getByRole('button', { name: 'Confirm' });
  }

  toPlan = async () => {
    await expect(this.page).toHaveTitle('Close other applications - Sentence plan');
    await this.confirmPrivacy.click();
    await this.confirm.click();
    await expect(this.page).toHaveTitle('Plan - Sentence plan');
  };

  toSan = async () => {
    await expect(this.page).toHaveTitle('Close other applications - Strengths and needs');
    await this.confirmPrivacy.click();
    await this.confirm.click();
    await expect(this.page).toHaveTitle('Accommodation - Strengths and needs');
  };

  toHistoricPlan = async (clientName: string = 'Sentence plan') => {
    await expect(this.page).toHaveTitle(`Close other applications - ${clientName}`);
    await this.confirmPrivacy.click();
    await this.confirm.click();
    await expect(this.page).toHaveTitle(`View historic version - ${clientName}`);
  };
}
