import { expect, test } from '@playwright/test';
import { StrengthsAndNeedsPage } from '../../../../../page-objects/strengths-and-needs/strengths-and-needs-pages';
import { TrainingLauncherPage } from '../../../../../page-objects/arns-assessment-platform/training-launcher-page';
import { PrivacyPage } from '../../../../../page-objects/arns-assessment-platform/privacy-page';

test.describe(
  'Private beta',
  {
    tag: ['@dev', '@local'],
  },
  () => {
    test.beforeEach(async ({ page }) => {
      const trainingLauncher = new TrainingLauncherPage(page);
      const privacy = new PrivacyPage(page);

      await trainingLauncher.startPrivateBetaSAN();

      await expect(page).toHaveTitle('Close other applications - Strengths and needs');
      await privacy.confirmPrivacy.click();
      await privacy.confirm.click();
      expect(await page.title()).toContain('Strengths and needs');
    });

    test('complete a strengths and needs assessment', async ({ page }) => {
      test.setTimeout(60_000);
      const strengthsAndNeedsPage = new StrengthsAndNeedsPage(page);

      await strengthsAndNeedsPage.accommodation.complete();

      await strengthsAndNeedsPage.employmentAndEducation.click();
      await strengthsAndNeedsPage.employment.complete();

      await strengthsAndNeedsPage.finances.click();
      await strengthsAndNeedsPage.finance.complete();

      // Validation bug
      // await strengthsAndNeedsPage.drugUse.click();
      // await strengthsAndNeedsPage.drug.complete();

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
      // await strengthsAndNeedsPage.offence.complete();

      // await expect(strengthsAndNeedsPage.offence.offenceAnalysisHeading).toBeVisible();
      // await expect(strengthsAndNeedsPage.offence.offenceAnalysisComplete).toBeVisible();
    });
  }
);
