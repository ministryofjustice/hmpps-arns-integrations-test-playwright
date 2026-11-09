import { APIRequestContext, expect, test } from '@playwright/test';
import { StrengthsAndNeedsPage } from '../../../../../page-objects/strengths-and-needs/strengths-and-needs-pages';
import { TrainingLauncherPage } from '../../../../../page-objects/arns-assessment-platform/training-launcher-page';
import { PrivacyPage } from '../../../../../page-objects/arns-assessment-platform/privacy-page';
import { getBaseUrl, getToken, queryAssessment } from '../../../../../utils/aapClient';
import { createDrugs, createAccommodation } from '../../../../../page-objects/arns-assessment-platform/api/setup-assessment';
import { AssessmentQueryResponse } from '../../../../../utils/aap/assessmentTypes';

test.describe(
  'SAN AAP',
  {
    tag: '@dev',
  },
  () => {
    let apiContext: APIRequestContext;
    let assessmentId: string;

    test.beforeAll(async ({ playwright, baseURL }) => {
      apiContext = await playwright.request.newContext({
        baseURL: getBaseUrl(baseURL),
        extraHTTPHeaders: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
      });
    });

    test.afterAll(async () => {
      await apiContext.dispose();
    });

    test.beforeEach(async ({ page }) => {
      const trainingLauncher = new TrainingLauncherPage(page);
      const privacy = new PrivacyPage(page);
      await trainingLauncher.startPrivateBetaSAN();
      await privacy.toSan();
    });

    test('change drugs on a strengths and needs assessment', async ({ page }) => {
      assessmentId = await createDrugs(page, apiContext);
      const strengthsAndNeedsPage = new StrengthsAndNeedsPage(page);

      await strengthsAndNeedsPage.drugUse.click();
      await strengthsAndNeedsPage.back.click();
      await expect(strengthsAndNeedsPage.drug.drugMisused).toBeChecked();
      await strengthsAndNeedsPage.drug.drugMisused.setChecked(false);
      await strengthsAndNeedsPage.drug.drugMisusedBenzo.setChecked(true);
      await expect(strengthsAndNeedsPage.drug.drugMisused).not.toBeChecked();
      await strengthsAndNeedsPage.drug.drugLastUsed.setChecked(true);
      await strengthsAndNeedsPage.saveAndContinue.click();
      await expect(
        strengthsAndNeedsPage.page.getByRole('heading', { name: 'Benzodiazepines (including diazepam, temazepam)' })
      ).toBeVisible();

      const queryResponse = (await queryAssessment(apiContext, assessmentId)) as AssessmentQueryResponse;

      expect(queryResponse).toBeTruthy();
      expect(queryResponse.queries[0].result.answers.select_misused_drugs.values).not.toContain('AMPHETAMINES');
      expect(queryResponse.queries[0].result.answers).not.toHaveProperty('drug_last_used_amphetamines');
      expect(queryResponse.queries[0].result.answers).not.toHaveProperty('how_often_used_last_six_months_amphetamines');
      expect(queryResponse.queries[0].result.answers).not.toHaveProperty(
        'how_often_used_last_six_months_amphetamines_details'
      );
      expect(queryResponse.queries[0].result.answers).not.toHaveProperty('drugs_injected_amphetamines');
      expect(queryResponse.queries[0].result.answers).not.toHaveProperty('drugs_injected');
    });

    test('change accommodation on a strengths and needs assessment', async ({ page }) => {
      assessmentId = await createAccommodation(page, apiContext);
      await page.reload();
      const strengthsAndNeedsPage = new StrengthsAndNeedsPage(page);

      await strengthsAndNeedsPage.back.click();
      await expect(strengthsAndNeedsPage.accommodation.homeowner).toBeChecked();
      await strengthsAndNeedsPage.accommodation.temporary.setChecked(true);
      await expect(strengthsAndNeedsPage.accommodation.settled).not.toBeChecked();
      await strengthsAndNeedsPage.accommodation.unknown.setChecked(true);
      await strengthsAndNeedsPage.saveAndContinue.click();
      await expect(
        strengthsAndNeedsPage.page.getByText(/accommodation suitable/).first()
      ).toBeVisible();

      const queryResponse = (await queryAssessment(apiContext, assessmentId)) as AssessmentQueryResponse;

      expect(queryResponse).toBeTruthy();
      expect(queryResponse.queries[0].result.answers).not.toHaveProperty('living_with');
      expect(queryResponse.queries[0].result.answers).not.toHaveProperty('type_of_settled_accommodation');
    });
  }
);
