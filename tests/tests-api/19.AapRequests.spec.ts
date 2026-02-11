import { test, expect } from '@playwright/test';
import { createAssessment, queryAssessment } from '../../utils/aapClient';

interface AssessmentQueryResponse {
  queries: {
    request: {
      type: 'AssessmentVersionQuery';
      user: { id: string; name: string };
      assessmentIdentifier: { type: string; uuid: string };
      timestamp: string | null;
    };
    result: {
      type: 'AssessmentVersionQueryResult';
      assessmentUuid: string;
      aggregateUuid: string;
      assessmentType: string;
      formVersion: string;
      createdAt: string;
      updatedAt: string;
      answers: Record<string, any>;
      properties: string;
      collections: any[];
      collaborators: { id: string; name: string }[];
      identifiers: string;
    };
  }[];
}

test('create and query AAP assessment', async ({ request }) => {
  const assessmentUuid = await test.step('Assert created AAP assessment', async () => {
    const createResponse = await createAssessment(request);
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

  await test.step('Query the created assessment', async () => {
    const queryResponse = (await queryAssessment(request, assessmentUuid)) as AssessmentQueryResponse;

    expect(queryResponse).toBeTruthy();
    expect(queryResponse.queries?.length).toBeGreaterThan(0);

    const query = queryResponse.queries[0];
    expect(query).toBeTruthy();
    expect(query.request.type).toBe('AssessmentVersionQuery');
    expect(query.request.assessmentIdentifier.type).toBe('UUID');
    expect(query.request.assessmentIdentifier.uuid).toBe(assessmentUuid);

    const queryResult = query.result;
    expect(queryResult.type).toBe('AssessmentVersionQueryResult');
    expect(queryResult).toHaveProperty('formVersion');
    expect(queryResult.formVersion).toBeDefined();
    expect(queryResult.createdAt).toBeDefined();
    expect(queryResult.updatedAt).toBeDefined();
    expect(queryResult.collections).toBeDefined();
    expect(queryResult.properties).toBeDefined();
    expect(queryResult.identifiers).toBeDefined();
    expect(queryResult).toHaveProperty('answers');
    expect(queryResult).toHaveProperty('collaborators');
    expect(queryResult.assessmentUuid).toBe(assessmentUuid);
    expect(queryResult.aggregateUuid).toBeDefined();
    expect(Array.isArray(queryResult.collaborators)).toBe(true);
  });
});
