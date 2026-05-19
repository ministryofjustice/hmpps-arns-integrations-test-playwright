import { test, expect, APIRequestContext } from '@playwright/test';
import { getBaseUrl, getToken, queryAssessment } from '../../../../../utils/aapClient';
import { createGoalsCollection } from '../../../../../utils/aap/sentencePlan/goalsCommands';
import { AssessmentQueryResponse, CreateAssessmentResult } from '../../../../../utils/aap/assessmentTypes';
import { createAssessmentSP } from '../../../../../utils/aap/sentencePlan/assessmentCommands';

let apiContext: APIRequestContext;

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
  await apiContext.dispose();
});

test('create and query AAP sentence plan', async () => {
  const spAssessmentUuid: string = await test.step('Assert created AAP sentence plan', async () => {
    const createResponse: CreateAssessmentResult = await createAssessmentSP(apiContext);
    expect(createResponse).toBeTruthy();
    expect(createResponse.commands?.length).toBeGreaterThan(0);

    const command = createResponse.commands[0];
    expect(command.request.type).toBe('CreateAssessmentCommand');
    expect(command.request.formVersion).toBe('1.0');
    expect(command.request.user).toMatchObject({
      id: 'test-user',
      name: 'Test User',
    });

    const result = command.result;
    expect(result.type).toBe('CreateAssessmentCommandResult');
    expect(result.success).toBe(true);
    expect(result.assessmentUuid).toBeDefined();
    expect(typeof result.assessmentUuid).toBe('string');
    expect(result.message).toContain(result.assessmentUuid);
    return result.assessmentUuid;
  });

  await test.step('Create goals', async () => {
    await createGoalsCollection(apiContext, spAssessmentUuid);
  });

  await test.step('Query the created sentence plan', async () => {
    const queryResponse: AssessmentQueryResponse = await queryAssessment(apiContext, spAssessmentUuid);

    expect(queryResponse).toBeTruthy();
    expect(queryResponse.queries?.length).toBeGreaterThan(0);

    const query = queryResponse.queries[0];
    expect(query).toBeTruthy();
    expect(query.request.type).toBe('AssessmentVersionQuery');
    expect(query.request.assessmentIdentifier.type).toBe('UUID');
    expect(query.request.assessmentIdentifier.uuid).toBe(spAssessmentUuid);

    const queryResult = query.result;
    expect(queryResult.type).toBe('AssessmentVersionQueryResult');
    expect(queryResult).toHaveProperty('formVersion');
    expect(queryResult.formVersion).toBeDefined();
    expect(queryResult.createdAt).toBeDefined();
    expect(queryResult.updatedAt).toBeDefined();
    expect(queryResult.collections).toBeDefined();
    expect(queryResult.properties).toBeDefined();
    expect(queryResult.properties).toEqual(
      expect.objectContaining({
        PLAN_TYPE: {
          type: 'Single',
          value: 'INITIAL',
        },
      })
    );
    expect(queryResult.identifiers).toBeDefined();
    expect(queryResult.assessmentUuid).toBe(spAssessmentUuid);
  });
});
