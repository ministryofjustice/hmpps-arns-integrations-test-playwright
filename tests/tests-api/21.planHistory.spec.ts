import { test, expect, APIRequestContext } from '@playwright/test';
import { AssessmentQueryResponse, BASE_URL, getToken } from '../../utils/aapClient';
import { queryPlanHistory } from '../../utils/sentencePlan/sentencePlanClient';

let apiContext: APIRequestContext;

test.beforeAll(async ({ playwright }) => {
  apiContext = await playwright.request.newContext({
    baseURL: BASE_URL,
    extraHTTPHeaders: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
});

test.afterAll(async () => {
  await apiContext.dispose();
});

test('query AAP plan history', async () => {
  const assessmentUuid = '9a26528e-b9e0-4959-8aa2-3736f801870c';
  const queryResponse = (await queryPlanHistory(apiContext, assessmentUuid)) as AssessmentQueryResponse;

  expect(queryResponse).toBeTruthy();
  expect(queryResponse.queries?.length).toBeGreaterThan(0);

  const query = queryResponse.queries[0];
  expect(query).toBeTruthy();

  const queryResult = query.result;
  expect(queryResult.type).toBe('TimelineQueryResult');
});
