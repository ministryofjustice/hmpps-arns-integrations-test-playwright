import { test, expect, APIRequestContext } from '@playwright/test';
import { getBaseUrl, getToken } from '../../../../../utils/aapClient';
import {
  entityVersions,
  getCoordinatorUrl,
  getVersionDate,
  getAssociations,
  rollback,
  sign,
  counterSign,
} from '../../../../../utils/coordinator/coordinatorClient';
import { PreviousVersionsResponse } from '../../../../../utils/coordinator/coordinatorTypes';

let apiContext: APIRequestContext;
let coordinatorContext: APIRequestContext;
const today = getVersionDate();
const oasysPk = '3173002';
const name = 'Burley Zieme';

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
    const queryResponse: PreviousVersionsResponse = await entityVersions(
      coordinatorContext,
      association.sentencePlanId
    );

    expect(queryResponse).toBeTruthy();
    expect(queryResponse).toHaveProperty('allVersions');
    const planDate =
      Object.entries(queryResponse.countersignedVersions).find(([, e]) => Object.keys(e).includes('planVersion')) ?? [];
    const planLastUpdatedDate = planDate[0] ?? '';
    expect(queryResponse.countersignedVersions[planLastUpdatedDate].planVersion.entityType).toBe('AAP_PLAN');
    const assessmentDate =
      Object.entries(queryResponse.allVersions).find(([, e]) => Object.keys(e).includes('assessmentVersion')) ?? [];
    const assessmentLastUpdatedDate = assessmentDate[0] ?? '';
    expect(queryResponse.allVersions[assessmentLastUpdatedDate].assessmentVersion.entityType).toBe('ASSESSMENT');

    return {
      assessmentVersion: queryResponse.allVersions[assessmentLastUpdatedDate].assessmentVersion.version,
      planVersion: queryResponse.countersignedVersions[planLastUpdatedDate].planVersion.version,
    };
  });
});

test('Coordinator counter signing', async () => {
  await test.step('Rollback plan', async () => {
    await rollback(coordinatorContext, oasysPk, name, versions.assessmentVersion, versions.planVersion);

    const queryResponse: PreviousVersionsResponse = await entityVersions(
      coordinatorContext,
      association.sentencePlanId
    );

    expect(queryResponse).toBeTruthy();
    expect(queryResponse.allVersions[today].planVersion.status).toBe('ROLLED_BACK');
    versions = {
      assessmentVersion: queryResponse.allVersions[today].assessmentVersion.version,
      planVersion: queryResponse.allVersions[today].planVersion.version,
    };
  });

  await test.step('Sign plan', async () => {
    await sign(coordinatorContext, oasysPk, name, 'COUNTERSIGN');

    const queryResponse: PreviousVersionsResponse = await entityVersions(
      coordinatorContext,
      association.sentencePlanId
    );

    expect(queryResponse).toBeTruthy();
    expect(queryResponse.allVersions[today].planVersion.status).toBe('AWAITING_COUNTERSIGN');
  });

  await test.step('Counter-sign plan', async () => {
    await counterSign(
      coordinatorContext,
      oasysPk,
      name,
      'COUNTERSIGNED',
      versions.assessmentVersion,
      versions.planVersion
    );

    const queryResponse: PreviousVersionsResponse = await entityVersions(
      coordinatorContext,
      association.sentencePlanId
    );

    expect(queryResponse).toBeTruthy();
    expect(queryResponse.countersignedVersions[today].planVersion.status).toBe('COUNTERSIGNED');
  });
});
