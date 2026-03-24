import { APIRequestContext, expect, test } from '@playwright/test';
import { PrivacyPage } from '../../../../../page-objects/arns-assessment-platform/privacy-page';
import { getToken } from '../../../../../utils/aapClient';
import { createHandoverLink, getHandoverUrl } from '../../../../../utils/handover/handoverClient';
import {
  createOasysAssociation,
  entityVersions,
  getCoordinatorUrl,
  getVersionDate,
} from '../../../../../utils/coordinator/coordinatorClient';

let apiContext: APIRequestContext;
let coordinatorContext: APIRequestContext;

test.beforeAll(async ({ playwright, baseURL }) => {
  apiContext = await playwright.request.newContext({
    baseURL: getHandoverUrl(baseURL),
    extraHTTPHeaders: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
  coordinatorContext = await playwright.request.newContext({
    baseURL: getCoordinatorUrl(baseURL),
    extraHTTPHeaders: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
});

test.afterAll(async () => {
  await apiContext.dispose();
  await coordinatorContext.dispose();
});

const crn = Math.random().toString().substring(2, 7);
const today = getVersionDate();
let planVersion: number;

test.describe('Private beta', () => {
  test.beforeEach(async () => {
    const oasysResponse = await createOasysAssociation(coordinatorContext, crn);
    const queryResponse = await entityVersions(coordinatorContext, oasysResponse.sentencePlanId);
    planVersion = queryResponse.allVersions[today].planVersion.version;
  });

  test('should navigate directly to historic version', async ({ page }) => {
    const handoverLink = await createHandoverLink(apiContext, planVersion);
    const privacy = new PrivacyPage(page);

    await page.goto(`${handoverLink}?clientId=sentence-plan`);
    await privacy.toHistoricPlan();

    await expect(page.getByText('This version is from')).toBeVisible();
  });
});
