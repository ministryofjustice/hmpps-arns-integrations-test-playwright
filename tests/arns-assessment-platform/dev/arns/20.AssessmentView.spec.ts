import { test, expect, APIRequestContext } from '@playwright/test';
import { viewAssessment, getBaseUrl, getToken } from '../../../../utils/arnsClient';

let apiContext: APIRequestContext;
const TEST_CRN = 'C912155';

function validateStepStructure(step: any) {
    expect(step.description).toEqual(expect.any(String));
    expect(step.status).toEqual(expect.any(String));
    expect(step.actor).toEqual(expect.any(String));
    expect(step.statusDate).toEqual(expect.any(String));
    expect(isNaN(Date.parse(step.statusDate))).toBeFalsy(); 
}

test.beforeAll(async ({ playwright }) => {
  apiContext = await playwright.request.newContext({
    baseURL: getBaseUrl(),
    extraHTTPHeaders: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
});

test.afterAll(async () => {
  await apiContext?.dispose();
});

test('view ARNS assessment successfully returns correct data structure', async () => {
    const responseBody = await viewAssessment(apiContext, TEST_CRN);
    
    expect(Array.isArray(responseBody)).toBeTruthy();
    expect(responseBody.length).toBeGreaterThan(0);

    const assessment = responseBody[0];

    expect(assessment.crn).toEqual(expect.any(String));
    
    expect(assessment.nomis).toBeNull();
    expect(assessment.planStatus).toEqual(expect.any(String));

    expect(Array.isArray(assessment.goals)).toBeTruthy();

    for (const goal of assessment.goals) {
        expect(goal.titleLength).toEqual(expect.any(Number));
        expect(goal.titleHash).toEqual(expect.any(String));
        expect(goal.areaOfNeed).toEqual(expect.any(String));
        expect(goal.goalStatus).toEqual(expect.any(String));
        
        expect(goal.targetDate === null || typeof goal.targetDate === 'string').toBeTruthy();
        
        expect(Array.isArray(goal.relatedAreasOfNeed)).toBeTruthy();
        expect(Array.isArray(goal.steps)).toBeTruthy();

        for (const step of goal.steps) {
            validateStepStructure(step);
        }
    }
});