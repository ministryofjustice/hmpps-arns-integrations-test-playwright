import { test } from '@playwright/test';
import { StrengthsAndNeedsPage } from '../../../../../page-objects/strengths-and-needs/strengths-and-needs-pages';
import { TrainingLauncherPage } from '../../../../../page-objects/arns-assessment-platform/training-launcher-page';
//import { PrivacyPage } from '../../../../../page-objects/arns-assessment-platform/privacy-page';

test.describe(
  'Private beta',
  {
    tag: ['@dev', '@local'],
  },
  () => {
    test.beforeEach(async ({ page }) => {
      const trainingLauncher = new TrainingLauncherPage(page);
      //const privacy = new PrivacyPage(page);

      await trainingLauncher.startPrivateBetaSAN();

      // Not implemented yet
      // await expect(page).toHaveTitle(
      //   'Remember to close any other applications before starting an appointment - Strengths and needs'
      // );
      // await privacy.confirmPrivacy.click();
      // await privacy.confirm.click();
      // expect(await page.title()).toContain('Strengths and needs');
    });

    test('complete a strengths and needs assessment', async ({ page }) => {
      test.setTimeout(60_000);
      const strengthsAndNeedsPage = new StrengthsAndNeedsPage(page);

      await strengthsAndNeedsPage.completeAccomodation();

      await strengthsAndNeedsPage.employmentAndEducation.click();
      await strengthsAndNeedsPage.employment.complete();

      await strengthsAndNeedsPage.finances.click();
      await strengthsAndNeedsPage.finance.complete();

      // Validation bug
      // await strengthsAndNeedsPage.drugUse.click();
      // await strengthsAndNeedsPage.completeDrugUse();

      await strengthsAndNeedsPage.alcoholUse.click();
      await strengthsAndNeedsPage.alcohol.complete();

      await strengthsAndNeedsPage.healthAndWellbeing.click();
      await strengthsAndNeedsPage.health.complete();

      await strengthsAndNeedsPage.personalRelationships.click();
      await strengthsAndNeedsPage.personal.complete();

      await strengthsAndNeedsPage.behavioursAndAttitudes.click();
      await strengthsAndNeedsPage.behaviours.complete();

      // Not implemented yet
      // await strengthsAndNeedsPage.offenceAnalysis.click();
      // await strengthsAndNeedsPage.completeOffenceAnalysis();

      // await strengthsAndNeedsPage.confirmUserIsOnOffenceAnalysisPage();
    });
  }
);
