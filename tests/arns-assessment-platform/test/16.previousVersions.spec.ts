import { expect, test } from '@playwright/test';
import { TrainingLauncherPage } from '../../../page-objects/arns-assessment-platform/training-launcher-page';
import { PrivacyPage } from '../../../page-objects/arns-assessment-platform/privacy-page';
import { SentencePlanPage } from '../../../page-objects/arns-assessment-platform/sentence-plan-page';
import { PreviousVersionsPage } from '../../../page-objects/arns-assessment-platform/previous-versions-page';

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

test('should view sentence plan previous version as private beta user', async ({ page }) => {
  const sentencePlan = new SentencePlanPage(page);
  const previousVersions = new PreviousVersionsPage(page);

  await sentencePlan.viewPreviousVersions.click();

  const sentencePlanVersion = page.waitForEvent('popup');
  await previousVersions.viewSentencePlan.click();

  const historicPlan = await sentencePlanVersion;
  await expect(historicPlan).toHaveTitle('View historic version - Sentence plan');
  await expect(historicPlan.getByText('This version is from')).toBeVisible();
});

test('should view Strengths and Needs previous version as private beta user', async ({ page }) => {
  const sentencePlan = new SentencePlanPage(page);
  const previousVersions = new PreviousVersionsPage(page);

  await sentencePlan.viewPreviousVersions.click();

  const assessmentVersion = page.waitForEvent('popup');
  await previousVersions.viewAssessment.click();

  const assessment = await assessmentVersion;
  await expect(assessment).toHaveTitle('Summary - Strengths and needs');
  await expect(assessment.getByText('This version is from')).toBeVisible();
});
