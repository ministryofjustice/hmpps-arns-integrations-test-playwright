import { expect, test } from '@playwright/test';
import { TrainingLauncherPage } from '../../../../../page-objects/arns-assessment-platform/training-launcher-page';
import { PrivacyPage } from '../../../../../page-objects/arns-assessment-platform/privacy-page';
import { SentencePlanPage } from '../../../../../page-objects/arns-assessment-platform/sentence-plan-page';
import { CreateGoalPage } from '../../../../../page-objects/arns-assessment-platform/create-goal-page';
import { AddStepsPage } from '../../../../../page-objects/arns-assessment-platform/add-steps-page';

test.beforeEach(async ({ page }) => {
  const trainingLauncher = new TrainingLauncherPage(page);
  const privacy = new PrivacyPage(page);

  await trainingLauncher.customiseSubjectDetails('K792077', '1623046');
  await trainingLauncher.newPeriodOfSupervision();
  await trainingLauncher.createSession.click();
  await trainingLauncher.generateLink.click();

  await expect(page).toHaveTitle('Close other applications - Sentence plan');
  await privacy.confirmPrivacy.click();
  await privacy.confirm.click();
});

test('should view sentence plan as new period of supervision', async ({ page }) => {
  await expect(page).toHaveTitle('Plan - Sentence plan');
  const sentencePlan = new SentencePlanPage(page);
  const goalTitle = 'new period of supervision';

  await test.step('create goal', async () => {
    const createGoal = new CreateGoalPage(page);
    await sentencePlan.createGoal.click();
    await expect(page).toHaveTitle('Create a goal - Sentence plan');
    await createGoal.createGoal(goalTitle);
  });
  await test.step('add steps', async () => {
    const addSteps = new AddStepsPage(page);
    await addSteps.addStep();
    await expect(sentencePlan.goalTitle).toHaveText(goalTitle);
  });

  await test.step('agree plan', async () => {
    await sentencePlan.agreePlan.click();
    await sentencePlan.yesIAgree.click();
    await sentencePlan.save.click();
    await expect(page.getByText('agreed to their plan')).toBeVisible();
  });

  await test.step('removed goals', async () => {
    await sentencePlan.removedGoals.click();
    await expect(sentencePlan.goalTitle).toHaveText(
      'I will work towards finding accommodation, so that I am no longer homeless'
    );
  });
});
