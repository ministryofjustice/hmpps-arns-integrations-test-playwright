import { test, expect, APIRequestContext } from '@playwright/test';
import { getBaseUrl, getToken } from '../../../../utils/aapClient';
import {
  createOasysAssociation,
  entityVersions,
  getCoordinatorUrl,
  getVersionDate,
} from '../../../../utils/coordinator/coordinatorClient';
import { updateAnswers } from '../../../../utils/aap/sentencePlan/assessmentCommands';
import { PreviousVersionsResponse } from '../../../../utils/coordinator/coordinatorTypes';
import { GroupCommandResult } from '../../../../utils/aap/assessmentTypes';

let apiContext: APIRequestContext;
let coordinatorContext: APIRequestContext;
const today = getVersionDate();
const crn = Math.random().toString().substring(2, 7);

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

let sentencePlanId: string;
let planVersion: number;

test.beforeEach(async () => {
  sentencePlanId = await test.step('OAsys association', async () => {
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

test('Coordinator get previous versions', async () => {
  await test.step('Update answers', async () => {
    const updateResponse: GroupCommandResult = await updateAnswers(apiContext, sentencePlanId, crn);

    expect(updateResponse).toBeTruthy();
    expect(updateResponse.commands[0].result.success).toBeTruthy();
  });

  await test.step('Get plan versions', async () => {
    const queryResponse: PreviousVersionsResponse = await entityVersions(coordinatorContext, sentencePlanId);

    expect(queryResponse).toBeTruthy();
    expect(queryResponse.allVersions[today].planVersion.status).toBe('UNSIGNED');
    expect(queryResponse.allVersions[today].planVersion.version).not.toBe(planVersion);
  });
});
