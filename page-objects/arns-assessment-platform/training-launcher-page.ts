import { expect, Locator, Page } from '@playwright/test';

export class TrainingLauncherPage {
  readonly page: Page;
  readonly startSession: Locator;
  readonly generateLink: Locator;
  readonly confirmPrivacy: Locator;
  readonly randomCrn: Locator;
  readonly crn: Locator;
  readonly randomOASysPk: Locator;
  readonly oasysPk: Locator;
  readonly spPrivateBeta: Locator;
  readonly customise: Locator;
  readonly createSession: Locator;
  readonly privateBeta: Locator;
  readonly targetService: Locator;
  readonly scenarioFlags: Locator;
  readonly newPeriod: Locator;

  constructor(page: Page) {
    this.page = page;
    this.startSession = page.getByRole('button', { name: 'Start session' });
    this.generateLink = page.getByRole('button', { name: 'Generate link' });
    this.confirmPrivacy = page.getByRole('checkbox', { name: 'confirm_privacy' });
    this.randomCrn = page.getByLabel('Randomize crn');
    this.crn = page.getByRole('textbox', { name: 'crn' });
    this.randomOASysPk = page.getByLabel('Randomize oasys assessment pk');
    this.oasysPk = page.getByRole('textbox', { name: 'OASys Assessment PK' });
    this.spPrivateBeta = page.getByRole('tab', { name: 'SP Private Beta' });
    this.customise = page.getByRole('button', { name: 'Customize scenario' });
    this.createSession = page.getByRole('button', { name: 'Create session' });
    this.privateBeta = page.getByRole('checkbox', { name: 'SAN Private Beta' });
    this.targetService = page.locator('[name="targetApplication"]');
    this.scenarioFlags = page.locator('[data-panel-id="flags"]');
    this.newPeriod = page.getByRole('checkbox', { name: 'New Period of Supervision' });
  }

  goto = async (scenario: string = 'default') => {
    await this.page.goto(`/training-session-launcher/browse?scenario=${scenario}`);
    await expect(this.page).toHaveTitle('Assess and plan');
    await expect(this.page.getByRole('heading', { name: 'Select a scenario' })).toBeVisible();
  };

  generateHandoverLink = async () => {
    await this.startSession.click();
    await this.generateLink.click();
  };

  startNationalRollout = async () => {
    await this.goto('sp-national-rollout');
    await this.startSession.click();
    await this.generateLink.click();
  };

  startPrivateBeta = async () => {
    await this.goto('sp-private-beta');
    await this.startSession.click();
    await this.generateLink.click();
  };

  customiseSubjectDetails = async (crn: string, oasysPk: string) => {
    await this.goto('sp-private-beta');
    await this.customise.click();
    await this.randomCrn.click();
    await this.crn.fill(crn);
    await this.randomOASysPk.click();
    await this.oasysPk.fill(oasysPk);
  };

  customiseScenario = async (crn: string, oasysPk: string) => {
    await this.customiseSubjectDetails(crn, oasysPk);
    await this.createSession.click();
  };

  startPrivateBetaSAN = async () => {
    await this.goto('sp-private-beta');
    await this.startSession.click();
    await this.targetService.selectOption('strengths-and-needs');
    await this.generateLink.click();
  };

  newPeriodOfSupervision = async () => {
    await this.scenarioFlags.click();
    await this.newPeriod.click();
  };
}
