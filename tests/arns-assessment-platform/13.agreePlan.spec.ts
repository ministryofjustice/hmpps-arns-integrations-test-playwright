import { APIRequestContext, expect, test } from '@playwright/test';
import { TrainingLauncherPage } from '../../page-objects/arns-assessment-platform/training-launcher-page';
import { PrivacyPage } from '../../page-objects/arns-assessment-platform/privacy-page';
import { SentencePlanPage } from '../../page-objects/arns-assessment-platform/sentence-plan-page';
import { getToken } from '../../utils/aapClient';
import { createGoalAndStep } from '../../page-objects/arns-assessment-platform/api/setup-plan';

let apiContext: APIRequestContext;

export const BASE_URL = 'https://arns-assessment-platform-api-test.hmpps.service.justice.gov.uk';

test.beforeAll(async ({ playwright }) => {
  apiContext = await playwright.request.newContext({
    baseURL: BASE_URL,
    extraHTTPHeaders: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
});

test.afterAll(async () => {
  await apiContext.dispose();
});

test.describe('Private beta', () => {
  test.beforeEach(async ({ page }) => {
    const trainingLauncher = new TrainingLauncherPage(page);
    const privacy = new PrivacyPage(page);
    await trainingLauncher.startPrivateBeta();
    await privacy.toPlan();

    await createGoalAndStep(page, apiContext);

    const sentencePlan = new SentencePlanPage(page);
    const goalTitle = 'I will work towards finding accommodation, so that I am no longer homeless';
    await page.reload();
    await expect(sentencePlan.goalTitle).toHaveText(goalTitle);
  });

  test('should agree plan', async ({ page }) => {
    const sentencePlan = new SentencePlanPage(page);

    await sentencePlan.agreePlan.click();
    await sentencePlan.yesIAgree.click();
    await sentencePlan.save.click();
    await expect(page.getByText('Plan created')).toBeVisible();

    await sentencePlan.planHistory.click();
    await expect(page.getByText('Plan agreed')).toBeVisible();
  });
});

test.describe('National rollout', () => {
  test.beforeEach(async ({ page }) => {
    const trainingLauncher = new TrainingLauncherPage(page);
    const privacy = new PrivacyPage(page);
    await trainingLauncher.startNationalRollout();
    await privacy.toPlan();

    await createGoalAndStep(page, apiContext);

    const sentencePlan = new SentencePlanPage(page);
    const goalTitle = 'I will work towards finding accommodation, so that I am no longer homeless';
    await page.reload();
    await expect(sentencePlan.goalTitle).toHaveText(goalTitle);
  });

  test('should agree plan', async ({ page }) => {
    const sentencePlan = new SentencePlanPage(page);

    await sentencePlan.agreePlan.click();
    await sentencePlan.yesIAgree.click();
    await sentencePlan.save.click();
    await expect(page.getByText('Plan created')).toBeVisible();

    await sentencePlan.planHistory.click();
    await expect(page.getByText('Plan agreed')).toBeVisible();
  });
});
