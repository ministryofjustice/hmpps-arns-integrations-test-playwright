import { expect, test } from '@playwright/test';
import { TrainingLauncherPage } from '../../../../../page-objects/arns-assessment-platform/training-launcher-page';
import { PrivacyPage } from '../../../../../page-objects/arns-assessment-platform/privacy-page';
import { SentencePlanPage } from '../../../../../page-objects/arns-assessment-platform/sentence-plan-page';
import { CreateGoalPage } from '../../../../../page-objects/arns-assessment-platform/create-goal-page';
import { AddStepsPage } from '../../../../../page-objects/arns-assessment-platform/add-steps-page';
import { PrintPreviewPage } from '../../../../../page-objects/arns-assessment-platform/print-preview-page';
import { AreaOfNeedPage } from '../../../../../page-objects/arns-assessment-platform/area-of-need-page';

const goalTitle = 'I will work towards finding accommodation, so that I am no longer homeless';

test.describe(
  'National rollout',
  {
    tag: ['@dev'],
  },
  () => {
    test.beforeEach(async ({ page }) => {
      test.setTimeout(10_000);
      const trainingLauncher = new TrainingLauncherPage(page);
      const privacy = new PrivacyPage(page);
      const sentencePlan = new SentencePlanPage(page);
      const createGoal = new CreateGoalPage(page);
      const addSteps = new AddStepsPage(page);
      const areaOfNeed = new AreaOfNeedPage(page);

      await trainingLauncher.startNationalRollout();
      await expect(page).toHaveTitle('Close other applications - Sentence plan');
      await privacy.confirmPrivacy.click();
      await privacy.confirm.click();
      await expect(page).toHaveTitle('Plan - Sentence plan');
      await expect(sentencePlan.printAllGoals).toHaveCount(0);
      await sentencePlan.createGoal.click();
      await expect(page).toHaveTitle('Create a goal - Sentence plan');
      await areaOfNeed.select('Accommodation');
      await createGoal.createGoalNoAON(goalTitle);
      await addSteps.addStep();
    });

    test('Pre Agreement Print Preview', async ({ page }) => {
      const sentencePlan = new SentencePlanPage(page);
      await expect(sentencePlan.goalTitle).toHaveText(goalTitle);
      const printPage = await PrintPreviewPage.openFrom(page, sentencePlan.printAllGoals);

      await expect(printPage.printHeader).toBeVisible();
      await expect(printPage.draftWaterMark).toBeVisible();
      await expect(printPage.goalTitle).toHaveText(goalTitle);

      await printPage.exportPdfAndWaitForDownload();
    });

    test('Post Agreemet Print Preview', async ({ page }) => {
      const sentencePlan = new SentencePlanPage(page);
      await expect(sentencePlan.goalTitle).toHaveText(goalTitle);
      await sentencePlan.agreePlan.click();
      await sentencePlan.yesIAgree.click();
      await sentencePlan.save.click();
      await expect(page.getByText('agreed to their plan')).toBeVisible();
      const printPage = await PrintPreviewPage.openFrom(page, sentencePlan.printAllGoals);

      await expect(printPage.printHeader).toBeVisible();
      await expect(printPage.draftWaterMark).toBeHidden();
      await expect(printPage.goalTitle).toHaveText(goalTitle);

      await printPage.exportPdfAndWaitForDownload();
      await printPage.printBtn.click();
      await expect(printPage.printBtn).toBeEnabled();
      await expect(printPage.printHeader).toBeVisible();
    });
  }
);
