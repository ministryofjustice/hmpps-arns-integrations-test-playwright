import { Locator, Page } from '@playwright/test';
import { MPOP_DEV_LINK } from './pages-common';

const hmppsAuthUsername = process.env.DELIUS_USERNAME;
const hmppsAuthPassword = process.env.DELIUS_PASSWORD;

export class MpopPages {
  constructor(
    private page: Page,
    private usernameInput: Locator = page.locator('#username'),
    private passwordInput: Locator = page.locator('#password'),
    private signInButton: Locator = page.locator('#submit'),
    private managePeopleOnProbationLink = page.locator('#hmpps-manage-supervisions'),
    private topNavCasesLink = page.getByRole('link', { name: 'Cases', exact: true }),
    private crnLink = page.getByRole('link', { name: 'Howe, Silvia' }),
    private riskAndPlanLink = page.getByRole('link', { name: 'Risk and plan' }),
    private sentencePlanLink = page.getByRole('link', { name: 'View the sentence plan (opens' })
  ) {}

  async navigateToMpopLink() {
    await this.page.goto(MPOP_DEV_LINK);
  }

  async authenticateWithHmppsAuthCredentials() {
    await this.usernameInput.fill(hmppsAuthUsername);
    await this.passwordInput.fill(hmppsAuthPassword);
    await this.signInButton.click();
  }

  async clickManagePeopleOnProbationLink() {
    await this.managePeopleOnProbationLink.click();
  }

  async clickCasesTopNavLink() {
    await this.topNavCasesLink.click();
  }

  async clickCrnLink() {
    await this.crnLink.click();
  }

  async clickRiskAndPlanLink() {
    await this.riskAndPlanLink.click();
  }

  async clickSentencePlanLink() {
    await this.sentencePlanLink.click();
  }
}
