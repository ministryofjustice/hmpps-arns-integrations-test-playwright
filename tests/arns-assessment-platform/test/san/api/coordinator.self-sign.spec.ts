import { test, expect, APIRequestContext } from '@playwright/test';
import { getBaseUrl, getToken } from '../../../../../utils/aapClient';
import {
  entityVersions,
  getCoordinatorUrl,
  getVersionDate,
  getAssociations,
  rollback,
  sign,
} from '../../../../../utils/coordinator/coordinatorClient';
import { PreviousVersionsResponse } from '../../../../../utils/coordinator/coordinatorTypes';

let apiContext: APIRequestContext;
let coordinatorContext: APIRequestContext;
const today = getVersionDate();
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
    const queryResponse: PreviousVersionsResponse = await entityVersions(coordinatorContext, association.assessmentId);

    expect(queryResponse).toBeTruthy();
    expect(queryResponse).toHaveProperty('allVersions');
    expect(queryResponse.allVersions[today].planVersion.entityType).toBe('AAP_PLAN');

    return {
      assessmentVersion: queryResponse.allVersions[today].assessmentVersion.version,
      planVersion: queryResponse.allVersions[today].planVersion.version,
    };
  });
});

test('Coordinator self signing', async () => {
  await test.step('Rollback plan', async () => {
    await rollback(coordinatorContext, oasysPk, name, versions.assessmentVersion, versions.planVersion);

    const queryResponse: PreviousVersionsResponse = await entityVersions(
      coordinatorContext,
      association.sentencePlanId
    );

    expect(queryResponse).toBeTruthy();
    expect(queryResponse.allVersions[today].planVersion.status).toBe('ROLLED_BACK');
  });

  await test.step('Sign plan', async () => {
    await sign(coordinatorContext, oasysPk);

    const queryResponse: PreviousVersionsResponse = await entityVersions(
      coordinatorContext,
      association.sentencePlanId
    );

    expect(queryResponse).toBeTruthy();
    expect(queryResponse.allVersions[today].planVersion.status).toBe('SELF_SIGNED');
  });
});
