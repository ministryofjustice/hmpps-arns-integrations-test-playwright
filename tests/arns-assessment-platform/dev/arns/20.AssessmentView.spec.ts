import { test, expect, APIRequestContext } from '@playwright/test';
import { viewAssessment, getBaseUrl, getToken, AssessmentStep } from '../../../../utils/arnsClient';

let apiContext: APIRequestContext;
const TEST_CRN = 'C912155';

function validateStepStructure(step: AssessmentStep) {
  expect(step).toEqual(
    expect.objectContaining({
      description: expect.any(String),
      status: expect.any(String),
      actor: expect.any(String),
      statusDate: expect.any(String),
    })
  );

  expect(new Date(step.statusDate).toString()).not.toBe('Invalid Date');
}

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
  await apiContext?.dispose();
});

test(
  'view ARNS assessment successfully returns correct data structure',
  {
    tag: '@dev',
  },
  async () => {
    const responseBody = await viewAssessment(apiContext, TEST_CRN);

    expect(Array.isArray(responseBody)).toBeTruthy();
    expect(responseBody.length).toBeGreaterThan(0);

    const assessment = responseBody[0];

    expect(assessment).toEqual(
      expect.objectContaining({
        crn: TEST_CRN,
        nomis: null,
        planStatus: expect.any(String),
        goals: expect.any(Array),
      })
    );

    for (const goal of assessment.goals) {
      expect(goal).toEqual(
        expect.objectContaining({
          titleLength: expect.any(Number),
          titleHash: expect.any(String),
          areaOfNeed: expect.any(String),
          goalStatus: expect.any(String),
          relatedAreasOfNeed: expect.any(Array),
          steps: expect.any(Array),
        })
      );

      expect(
        goal.targetDate === null || typeof goal.targetDate === 'string',
        `Type Error: Expected goal.targetDate to be 'string' or 'null', but received type '${typeof goal.targetDate}' with value: ${goal.targetDate}`
      ).toBeTruthy();

      for (const step of goal.steps) {
        validateStepStructure(step);
      }
    }
  }
);
