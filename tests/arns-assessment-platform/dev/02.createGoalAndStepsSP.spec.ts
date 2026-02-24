import { APIRequestContext, expect, test } from '@playwright/test';
import { TrainingLauncherPage } from '../../../page-objects/arns-assessment-platform/training-launcher-page';
import { PrivacyPage } from '../../../page-objects/arns-assessment-platform/privacy-page';
import { SentencePlanPage } from '../../../page-objects/arns-assessment-platform/sentence-plan-page';
import { CreateGoalPage } from '../../../page-objects/arns-assessment-platform/create-goal-page';
import { AddStepsPage } from '../../../page-objects/arns-assessment-platform/add-steps-page';
import { getBaseUrl, getToken, queryAssessment } from '../../../utils/aapClient';

test.describe('National rollout', () => {
  test.beforeEach(async ({ page }) => {
    const trainingLauncher = new TrainingLauncherPage(page);
    const privacy = new PrivacyPage(page);

    await trainingLauncher.startNationalRollout();

    await expect(page).toHaveTitle('Close other applications - Sentence plan');
    await privacy.confirmPrivacy.click();
    await privacy.confirm.click();
    await expect(page).toHaveTitle('Plan - Sentence plan');
  });

  test('should create goal and steps as national rollout user', async ({ page }) => {
    const sentencePlan = new SentencePlanPage(page);
    const createGoal = new CreateGoalPage(page);
    const addSteps = new AddStepsPage(page);
    const goalTitle = 'I will work towards finding accommodation, so that I am no longer homeless';

    await sentencePlan.createGoal.click();
    await expect(page).toHaveTitle('Create a goal - Sentence plan');
    await createGoal.searchGoal.fill(goalTitle);
    await createGoal.relatedGoalYes.click();
    await createGoal.relatedAreaAlcohol.click();
    await createGoal.startWorkingOnThisGoalYes.click();
    await createGoal.whenAimToAchieveGoal.click();
    await createGoal.addSteps.click();
    await addSteps.whoWillDoTheStep('Probation practitioner');
    await addSteps.whatShouldTheyDo.fill('Step 1');
    await addSteps.saveAndContinue.click();

    await expect(sentencePlan.goalTitle).toHaveText(goalTitle);
  });
});

let apiContext: APIRequestContext;

test.beforeAll(async ({ playwright, baseURL }) => {
  apiContext = await playwright.request.newContext({
    baseURL: getBaseUrl(baseURL),
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

    await expect(page).toHaveTitle('Close other applications - Sentence plan');
    await privacy.confirmPrivacy.click();
    await privacy.confirm.click();
    await expect(page).toHaveTitle('Plan - Sentence plan');
    const info = await page.locator('pre').textContent();
    const assessmentId = info.substring(info.lastIndexOf('Assessment ID:'), info.indexOf('OASys PK:')).substring(14);
    await queryAssessment(apiContext, assessmentId);
  });

  test('should create goal and steps as private beta user', async ({ page }) => {
    const sentencePlan = new SentencePlanPage(page);
    const createGoal = new CreateGoalPage(page);
    const addSteps = new AddStepsPage(page);
    const goalTitle = 'I will work towards finding accommodation, so that I am no longer homeless';

    await sentencePlan.createGoal.click();
    await expect(page).toHaveTitle('Create a goal - Sentence plan');
    await createGoal.searchGoal.fill(goalTitle);
    await createGoal.relatedGoalYes.click();
    await createGoal.relatedAreaAlcohol.click();
    await createGoal.startWorkingOnThisGoalYes.click();
    await createGoal.whenAimToAchieveGoal.click();
    await createGoal.addSteps.click();
    await addSteps.whoWillDoTheStep('Probation practitioner');
    await addSteps.whatShouldTheyDo.fill('Step 1');
    await addSteps.saveAndContinue.click();

    await expect(sentencePlan.goalTitle).toHaveText(goalTitle);
  });
});
