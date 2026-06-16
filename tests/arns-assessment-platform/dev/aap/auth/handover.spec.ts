import { test, expect, APIRequestContext, APIResponse } from '@playwright/test';
import { getToken } from '../../../../../utils/aapClient';
import {
  createOasysAssociation,
  entityVersions,
  getCoordinatorUrl,
  getVersionDate,
} from '../../../../../utils/coordinator/coordinatorClient';
import { OasysCreateResponse, PreviousVersionsResponse } from '../../../../../utils/coordinator/coordinatorTypes';
import {
  getHandoverLink,
  getHandoverResponse,
  getHandoverUrl,
  getModsecError,
} from '../../../../../utils/handover/handoverClient';
import { CreateHandoverLinkResponse } from '../../../../../utils/handover/handoverTypes';

let handoverContext: APIRequestContext;
let coordinatorContext: APIRequestContext;
const today = getVersionDate();

test.beforeAll(async ({ playwright, baseURL }) => {
  handoverContext = await playwright.request.newContext({
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
  await handoverContext.dispose();
  await coordinatorContext.dispose();
});

test.describe(
  'Handover API',
  {
    tag: '@dev',
  },
  () => {
    let planVersion: number;
    const crn = Math.random().toString().substring(2, 7);
    const oasysPk = Math.floor(Math.random() * 1000000000).toString();

    test.beforeEach(async () => {
      const sentencePlanId: string = await test.step('OAsys association', async () => {
        const oasysResponse: OasysCreateResponse = await createOasysAssociation(coordinatorContext, crn, oasysPk);
        expect(oasysResponse).toBeTruthy();

        return oasysResponse.sentencePlanId;
      });

      planVersion = await test.step('Get previous versions', async () => {
        const queryResponse: PreviousVersionsResponse = await entityVersions(coordinatorContext, sentencePlanId);

        expect(queryResponse).toBeTruthy();
        expect(queryResponse).toHaveProperty('allVersions');
        expect(queryResponse.allVersions[today].planVersion.entityType).toBe('AAP_PLAN');
        expect(queryResponse.allVersions[today].planVersion.status).toBe('CREATED');
        return queryResponse.allVersions[today].planVersion.version;
      });
    });

    test('Get Handover link', async () => {
      const handoverResponse: CreateHandoverLinkResponse = await getHandoverLink(handoverContext, planVersion, oasysPk);

      expect(handoverResponse).toBeTruthy();
      expect(handoverResponse.handoverLink).toContain('/handover/');
    });
  }
);

// https://dsdmoj.atlassian.net/wiki/spaces/ARN/pages/6150881391/ModSec+-+AAP+Team+Guide#Testing
test.describe(
  'Modsec handover',
  {
    tag: '@security',
  },
  () => {
    let planVersion: number;
    const crn = Math.random().toString().substring(2, 7);
    const oasysPk = Math.floor(Math.random() * 1000000000).toString();

    test.beforeEach(async () => {
      const sentencePlanId: string = await test.step('OAsys association', async () => {
        const oasysResponse: OasysCreateResponse = await createOasysAssociation(coordinatorContext, crn, oasysPk);
        expect(oasysResponse).toBeTruthy();

        return oasysResponse.sentencePlanId;
      });

      planVersion = await test.step('Get previous versions', async () => {
        const queryResponse: PreviousVersionsResponse = await entityVersions(coordinatorContext, sentencePlanId);

        expect(queryResponse).toBeTruthy();
        expect(queryResponse).toHaveProperty('allVersions');
        expect(queryResponse.allVersions[today].planVersion.entityType).toBe('AAP_PLAN');
        expect(queryResponse.allVersions[today].planVersion.status).toBe('CREATED');
        return queryResponse.allVersions[today].planVersion.version;
      });
    });

    test('Modsec Not Acceptable', async () => {
      await test.step('Url script', async () => {
        const modSecResponse: number = await getModsecError(handoverContext);

        expect(modSecResponse).toBe(406);
      });

      await test.step('SQL Injection', async () => {
        const query = `SELECT * FROM assessments WHERE user_id = ${oasysPk}`;
        const apiResponse: APIResponse = await getHandoverResponse(handoverContext, planVersion, query);

        expect(apiResponse.status()).toBe(406);
      });
    });
  }
);
