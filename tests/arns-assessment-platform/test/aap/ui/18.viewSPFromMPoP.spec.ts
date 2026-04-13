import { expect, test } from '@playwright/test';
import { PrivacyPage } from '../../../../../page-objects/arns-assessment-platform/privacy-page';
import { SentencePlanPage } from '../../../../../page-objects/arns-assessment-platform/sentence-plan-page';
import { MpopPages } from '../../../../../page-objects/oastub-archive/mpop-pages';

const crn = 'X998795';

test.beforeEach(async ({ page }) => {
  const privacy = new PrivacyPage(page);
  const mpop = new MpopPages(page);

  await page.goto(`/access/sentence-plan/crn/${crn}`);

  await mpop.authenticateWithHmppsAuthCredentials();

  await expect(page).toHaveTitle('Close other applications - Sentence plan');
  await privacy.confirmPrivacy.click();
  await privacy.confirm.click();
  await expect(page).toHaveTitle('Plan - Sentence plan');
});

test('should display goals, steps and sentence information', async ({ page }) => {
  const sentencePlan = new SentencePlanPage(page);

  await expect(sentencePlan.header).toContainText(crn);
  await expect(sentencePlan.goalTitle).toContainText('I will work towards finding accommodation');
  await expect(sentencePlan.goalSummary).toContainText('Probation practitioner');

  // Hide about page until ARNS API ready: https://dsdmoj.atlassian.net/browse/SP2-1984
  // await sentencePlan.about.click();
  // await expect(page.getByText('Adult Custody < 12m')).toBeVisible();
});
