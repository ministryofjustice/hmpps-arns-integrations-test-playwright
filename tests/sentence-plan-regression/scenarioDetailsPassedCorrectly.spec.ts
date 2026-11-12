import { expect, test, type Page } from '@playwright/test';
import { TrainingLauncherPage } from '../../page-objects/arns-assessment-platform/training-launcher-page';
import { PrivacyPage } from '../../page-objects/arns-assessment-platform/privacy-page';
import { SentencePlanPage } from '../../page-objects/arns-assessment-platform/sentence-plan-page';

const verifyPersonDetailsArePassedThrough = async (page: Page, scenario: string) => {
  const trainingLauncher = new TrainingLauncherPage(page);
  const privacy = new PrivacyPage(page);
  const sentencePlan = new SentencePlanPage(page);

  const personDetails = await trainingLauncher.getScenarioDetails(scenario);
  await trainingLauncher.generateHandoverLink();

  console.log(personDetails);

  const subjectDetails = [
    personDetails.personCRN,
    personDetails.PersonPNC,
    personDetails.personName,
    personDetails.personDateOfBirth,
  ];

  await expect(page).toHaveTitle('Close other applications - Sentence plan');

  for (const detail of subjectDetails) {
    await privacy.checkSubjectDetails(detail);
  }

  await privacy.toPlan();

  for (const detail of subjectDetails) {
    await sentencePlan.checkSubjectDetails(detail);
  }

  await sentencePlan.checkPlanHeaderName(personDetails.personName);
  await sentencePlan.checkReportProblemLink(personDetails.personCRN);
  await sentencePlan.checkReportProblemLink(personDetails.personOASysPk);
};

test.describe(
  'Person details are passed correctly from training launcher',
  {
    tag: '@reg',
  },
  () => {
    test('Default scenario', async ({ page }) => {
      await verifyPersonDetailsArePassedThrough(page, 'default');
    });

    test('National Rollout', async ({ page }) => {
      await verifyPersonDetailsArePassedThrough(page, 'sp-national-rollout');
    });

    test('Private Beta', async ({ page }) => {
      await verifyPersonDetailsArePassedThrough(page, 'sp-private-beta');
    });
  }
);
