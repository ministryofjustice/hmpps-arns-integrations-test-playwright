import { expect, test } from '@playwright/test';
import { TrainingLauncherPage } from '../../page-objects/arns-assessment-platform/training-launcher-page';
import { PrivacyPage } from '../../page-objects/arns-assessment-platform/privacy-page';
import { SentencePlanPage } from '../../page-objects/arns-assessment-platform/sentence-plan-page';
import { CreateGoalPage } from '../../page-objects/arns-assessment-platform/create-goal-page';

test.beforeEach(async ({ page }) => {
  const trainingLauncher = new TrainingLauncherPage(page);
  const privacy = new PrivacyPage(page);

  await trainingLauncher.customiseScenario('K792077', '1623046');
  await trainingLauncher.generateLink.click();

  await expect(page).toHaveTitle('Close other applications - Sentence plan');
  await privacy.confirmPrivacy.click();
  await privacy.confirm.click();
  await expect(page).toHaveTitle('Plan - Sentence plan');
});

test('should create goal and steps as private beta user', async ({ page }) => {
  const sentencePlan = new SentencePlanPage(page);
  const createGoal = new CreateGoalPage(page);

  await sentencePlan.createGoal.click();
  await expect(page).toHaveTitle('Create a goal - Sentence plan');
  await createGoal.viewInformation.click();
  await expect(page.getByText('has already made positive changes and wants to maintain them.')).toBeVisible();

  await createGoal.employmentAndEducation.click();
  await createGoal.viewInformation.click();
  await expect(page.getByText('does not want to make changes.')).toBeVisible();
});
