import { test, expect } from '@playwright/test';
import { TrainingLauncherPage } from '../../page-objects/arns-assessment-platform/training-launcher-page';
import { PrivacyPage } from '../../page-objects/arns-assessment-platform/privacy-page';
import { SentencePlanPage } from '../../page-objects/arns-assessment-platform/sentence-plan-page';

test.describe(
  'Compare Person Details are passed through correctly',
  {
    tag: '@reg',
  },
  () => {
    const scenarios = [
      { name: 'Default scenario', scenario: 'default' },
      { name: 'National Rollout', scenario: 'sp-national-rollout' },
      { name: 'Private Beta', scenario: 'sp-private-beta' },
    ];

    for (const { name, scenario } of scenarios) {
      test(name, async ({ page }) => {
        const trainingLauncher = new TrainingLauncherPage(page);
        const privacy = new PrivacyPage(page);
        const sentencePlan = new SentencePlanPage(page);

        const personDetails = await trainingLauncher.getScenarioDetails(scenario);
        await trainingLauncher.generateHandoverLink();

        const subjectDetails = [
          personDetails.popCRN,
          personDetails.popPNC,
          personDetails.popName,
          personDetails.popDateOfBirth,
        ];

        await expect(page).toHaveTitle('Close other applications - Sentence plan');

        for (const detail of subjectDetails) {
          await privacy.checkSubjectDetails(detail);
        }

        await privacy.toPlan();

        for (const detail of subjectDetails) {
          await sentencePlan.checkSubjectDetails(detail);
        }

        await sentencePlan.checkPopPlanHeader(personDetails.popName);
        await sentencePlan.checkReportProblemLink(personDetails.popCRN);
        await sentencePlan.checkReportProblemLink(personDetails.popOASysPk);
      });
    }
  }
);
