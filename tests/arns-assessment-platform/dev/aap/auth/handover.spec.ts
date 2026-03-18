import { test, expect, APIRequestContext } from '@playwright/test';
import { getToken } from '../../../../../utils/aapClient';
import {
  createOasysAssociation,
  entityVersions,
  getCoordinatorUrl,
  getVersionDate,
} from '../../../../../utils/coordinator/coordinatorClient';
import { PreviousVersionsResponse } from '../../../../../utils/coordinator/coordinatorTypes';
import { getHandoverLink, getHandoverUrl } from '../../../../../utils/handover/handoverClient';
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

let planVersion: number;
const crn = Math.random().toString().substring(2, 7);

test.beforeEach(async () => {
  const sentencePlanId: string = await test.step('OAsys association', async () => {
    const oasysResponse = await createOasysAssociation(coordinatorContext, crn);
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
  const handoverResponse: CreateHandoverLinkResponse = await getHandoverLink(handoverContext, planVersion);

  expect(handoverResponse).toBeTruthy();
  expect(handoverResponse.handoverLink).toContain('/handover/');
});
