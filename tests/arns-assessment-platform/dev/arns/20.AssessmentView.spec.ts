import { test, expect, APIRequestContext } from '@playwright/test';
import { viewAssessment, getBaseUrl, getToken } from '../../../../utils/arnsClient';

let apiContext: APIRequestContext;

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
  await apiContext.dispose();
});

test('view ARNS assessment successfully returns data', async () => {
    const responseBody = await viewAssessment(apiContext);
    
    expect(Array.isArray(responseBody)).toBeTruthy();

    if (responseBody.length > 0) {
        const assessment = responseBody[0];

        expect(assessment).toHaveProperty('crn');
        expect(assessment.crn).toEqual(expect.any(String));
        
        expect(assessment.nomis === null || typeof assessment.nomis === 'string').toBeTruthy();
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
                expect(step.description).toEqual(expect.any(String));
                expect(step.status).toEqual(expect.any(String));
                expect(step.actor).toEqual(expect.any(String));
                
                
                expect(step.statusDate).toEqual(expect.any(String));
                expect(!isNaN(Date.parse(step.statusDate))).toBeTruthy(); 
            }
        }
    }
});