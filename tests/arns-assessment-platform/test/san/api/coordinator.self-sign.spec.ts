import { test, expect, APIRequestContext } from '@playwright/test';
import { getBaseUrl, getToken } from '../../../../../utils/aapClient';
import {
  entityVersions,
  getCoordinatorUrl,
  getVersionDate,
  getAssociations,
  PreviousVersionsResponses,
} from '../../../../../utils/coordinator/coordinatorClient';
import { rollback, sign } from '../../../../../utils/coordinator/client/signing';
import { PreviousVersionsResponse } from '../../../../../utils/coordinator/coordinatorTypes';

let apiContext: APIRequestContext;
let coordinatorContext: APIRequestContext;
const today = getVersionDate();
let lastUpdatedDate = '';
const oasysPk = '7282419';
const name = 'Brennon Mayer';

test.beforeAll(async ({ playwright, baseURL }) => {
  apiContext = await playwright.request.newContext({
    baseURL: getBaseUrl(baseURL),
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

let association: { sentencePlanId: string; assessmentId: string };
let versions: { assessmentVersion: number; planVersion: number };

test.beforeEach(async () => {
  association = await test.step('OAsys association', async () => {
    const oasysResponse = await getAssociations(coordinatorContext, oasysPk);
    expect(oasysResponse).toBeTruthy();

    return { sentencePlanId: oasysResponse.sentencePlanId, assessmentId: oasysResponse.sanAssessmentId };
  });

  versions = await test.step('Get previous versions', async () => {
    const queryResponse: PreviousVersionsResponses = (await entityVersions(
      coordinatorContext,
      association.assessmentId
    )) as PreviousVersionsResponse;

    expect(queryResponse).toBeTruthy();
    expect(queryResponse).toHaveProperty('allVersions');
    const date =
      Object.entries(queryResponse.allVersions).find(([, e]) => Object.keys(e).includes('planVersion')) ?? [];
    lastUpdatedDate = date[0] ?? '';
    expect(queryResponse.allVersions[lastUpdatedDate].planVersion.entityType).toBe('AAP_PLAN');

    return {
      assessmentVersion: queryResponse.allVersions[lastUpdatedDate].assessmentVersion.version,
      planVersion: queryResponse.allVersions[lastUpdatedDate].planVersion.version,
    };
  });
});

test('Coordinator self signing', async () => {
  await test.step('Rollback plan', async () => {
    await rollback(coordinatorContext, oasysPk, name, versions.assessmentVersion, versions.planVersion);

    const queryResponse: PreviousVersionsResponses = (await entityVersions(
      coordinatorContext,
      association.sentencePlanId
    )) as PreviousVersionsResponse;

    expect(queryResponse).toBeTruthy();
    expect(queryResponse.allVersions[today].planVersion.status).toBe('ROLLED_BACK');
  });

  await test.step('Sign plan', async () => {
    await sign(coordinatorContext, oasysPk);

    const queryResponse: PreviousVersionsResponses = await entityVersions(
      coordinatorContext,
      association.sentencePlanId
    );

    expect(queryResponse).toBeTruthy();
    expect(queryResponse.allVersions[today].planVersion.status).toBe('SELF_SIGNED');
  });
});
