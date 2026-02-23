import { expect, test } from '@playwright/test';
import { TrainingLauncherPage } from '../../page-objects/arns-assessment-platform/training-launcher-page';
import { PrivacyPage } from '../../page-objects/arns-assessment-platform/privacy-page';
import { SentencePlanPage } from '../../page-objects/arns-assessment-platform/sentence-plan-page';
import { MpopPages } from '../../page-objects/mpop-pages';

const crn = 'X986584';

test.beforeEach(async ({ page }) => {
  const trainingLauncher = new TrainingLauncherPage(page);
  const privacy = new PrivacyPage(page);
  const mpop = new MpopPages(page);

  await page.goto(`${trainingLauncher.baseUrl}/access/sentence-plan/crn/${crn}`);

  await mpop.authenticateWithHmppsAuthCredentials();

  await expect(page).toHaveTitle('Close other applications - Sentence plan');
  await privacy.confirmPrivacy.click();
  await privacy.confirm.click();
  await expect(page).toHaveTitle('Plan - Sentence plan');
});

test('should display goals and steps', async ({ page }) => {
  const sentencePlan = new SentencePlanPage(page);

  await expect(sentencePlan.header).toContainText(crn);
  await expect(sentencePlan.goalTitle).toContainText('I will work towards finding accommodation');
  await expect(sentencePlan.goalSummary).toContainText('Probation practitioner');
});
