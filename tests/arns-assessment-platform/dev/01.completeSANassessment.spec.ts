import { expect, test } from '@playwright/test';
import { StrengthsAndNeedsPage } from '../../../page-objects/strengths-and-needs/strengths-and-needs-pages';
import { TrainingLauncherPage } from '../../../page-objects/arns-assessment-platform/training-launcher-page';
import { PrivacyPage } from '../../../page-objects/arns-assessment-platform/privacy-page';

test.describe('Private beta', () => {
  test.beforeEach(async ({ page }) => {
    const trainingLauncher = new TrainingLauncherPage(page);
    const privacy = new PrivacyPage(page);

    await trainingLauncher.startPrivateBetaSAN();

    await expect(page).toHaveTitle(
      'Remember to close any other applications before starting an appointment - Strengths and needs'
    );
    await privacy.confirmPrivacy.click();
    await privacy.confirm.click();
    await expect(page).toHaveTitle('Accommodation - Strengths and needs');
  });

  test('complete a strengths and needs assessment', async ({ page }) => {
    const strengthsAndNeedsPage = new StrengthsAndNeedsPage(page);

    await strengthsAndNeedsPage.completeAccomodation();

    await strengthsAndNeedsPage.employmentAndEducation.click();
    await strengthsAndNeedsPage.completeEmployment();

    await strengthsAndNeedsPage.finances.click();
    await strengthsAndNeedsPage.completeFinances();

    await strengthsAndNeedsPage.drugUse.click();
    await strengthsAndNeedsPage.completeDrugUse();

    await strengthsAndNeedsPage.alcoholUse.click();
    await strengthsAndNeedsPage.completeAlcoholUse();

    await strengthsAndNeedsPage.healthAndWellbeing.click();
    await strengthsAndNeedsPage.completeHealthAndWellbeing();

    await strengthsAndNeedsPage.personalRelationships.click();
    await strengthsAndNeedsPage.completePersonalRelationships();

    await strengthsAndNeedsPage.behavioursAndAttitudes.click();
    await strengthsAndNeedsPage.completeBehavioursAndAttitudes();

    await strengthsAndNeedsPage.offenceAnalysis.click();
    await strengthsAndNeedsPage.completeOffenceAnalysis();

    await strengthsAndNeedsPage.confirmUserIsOnOffenceAnalysisPage();
  });
});
