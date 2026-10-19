import { APIRequestContext, expect, test } from '@playwright/test';
import { PrivacyPage } from '../../../../../page-objects/arns-assessment-platform/privacy-page';
import { getToken } from '../../../../../utils/aapClient';
import { createHandoverLink, getHandoverUrl } from '../../../../../utils/handover/handoverClient';
import {
  createOasysAssociation,
  entityVersions,
  getCoordinatorUrl,
  getVersionDate,
  lock,
  PreviousVersionsResponses,
} from '../../../../../utils/coordinator/coordinatorClient';

let apiContext: APIRequestContext;
let coordinatorContext: APIRequestContext;
const today = getVersionDate();

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
const oasysPk = Math.floor(Math.random() * 1000000000).toString();
let planVersion: number;

test.describe(
  'Private beta',
  {
    tag: '@dev',
  },
  () => {
    test.beforeEach(async () => {
      const oasysResponse = await createOasysAssociation(coordinatorContext, crn, oasysPk);
      await lock(coordinatorContext, oasysPk);
      const previousVersion: PreviousVersionsResponses = await entityVersions(
        coordinatorContext,
        oasysResponse.sentencePlanId
      );
      planVersion = previousVersion.allVersions[today].planVersion.version;
    });

    test('should navigate directly to historic version', async ({ page }) => {
      const handoverLink = await createHandoverLink(apiContext, planVersion, oasysPk);
      const privacy = new PrivacyPage(page);

      await page.goto(`${handoverLink}?clientId=sentence-plan`);
      await privacy.toHistoricPlan();

      await expect(page.getByText('This version is from')).toBeVisible();
    });
  }
);
