import { expect, test } from '@playwright/test';
import { TrainingLauncherPage } from '../../../../../page-objects/arns-assessment-platform/training-launcher-page';
import { PrivacyPage } from '../../../../../page-objects/arns-assessment-platform/privacy-page';
import { SentencePlanPage } from '../../../../../page-objects/arns-assessment-platform/sentence-plan-page';
import { CreateGoalPage } from '../../../../../page-objects/arns-assessment-platform/create-goal-page';
import { AddStepsPage } from '../../../../../page-objects/arns-assessment-platform/add-steps-page';
import { PrintPreviewPage } from '../../../../../page-objects/arns-assessment-platform/print-preview-page';

const goalTitle = 'I will work towards finding accommodation, so that I am no longer homeless';

test.describe(
  'National rollout',
  {
    tag: ['@local'],
  },
  () => {
    test.beforeEach(async ({ page }) => {
      const trainingLauncher = new TrainingLauncherPage(page);
      const privacy = new PrivacyPage(page);
      const sentencePlan = new SentencePlanPage(page);
      const createGoal = new CreateGoalPage(page);
      const addSteps = new AddStepsPage(page);

      await trainingLauncher.startNationalRollout();
      await expect(page).toHaveTitle('Close other applications - Sentence plan');
      await privacy.confirmPrivacy.click();
      await privacy.confirm.click();
      await expect(page).toHaveTitle('Plan - Sentence plan');
      await sentencePlan.createGoal.click();
      await expect(page).toHaveTitle('Create a goal - Sentence plan');
      await createGoal.createGoal(goalTitle);
      await addSteps.addStep();
    });

    test('add goals and view print preview', async ({ page }) => {
      const sentencePlan = new SentencePlanPage(page);

      await expect(sentencePlan.goalTitle).toHaveText(goalTitle);
      const [newPage] = await Promise.all([page.waitForEvent('popup'), sentencePlan.printAllGoals.click()]);
      await newPage.waitForLoadState();
      await expect(newPage).toHaveURL(/print-preview/);
      const printPage = new PrintPreviewPage(newPage);
      await expect(printPage.printHeader).toBeVisible();
      await printPage.exportPDF.click();
    });
  }
);
