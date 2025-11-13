import { test, expect } from '@playwright/test';
import { createAssessment, queryAssessment } from '../utils/aapClient';

interface AssessmentQueryResponse {
  queries: {
    request: {
      type: 'AssessmentVersionQuery';
      user: { id: string; name: string };
      assessmentUuid: string;
      timestamp: string | null;
    };
    result: {
      type: 'AssessmentVersionQueryResult';
      formVersion: string | null;
      answers: Record<string, any>;
      collaborators: { id: string; name: string }[];
    };
  }[];
}

test('create and query AAP assessment', async () => {
  // Create AAP assessment
  const createResponse = await createAssessment();

  // Assert created AAP assessment
  expect(createResponse).toBeTruthy();
  expect(createResponse.commands?.length).toBeGreaterThan(0);

  const command = createResponse.commands[0];
  expect(command.request.type).toBe('CreateAssessmentCommand');
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

  const assessmentUuid = result.assessmentUuid;
  console.log('Created AAP assessment:', assessmentUuid);

  // Query the created assessment
  const queryResponse = (await queryAssessment(
    assessmentUuid
  )) as AssessmentQueryResponse;

  expect(queryResponse).toBeTruthy();
  expect(queryResponse.queries?.length).toBeGreaterThan(0);

  const query = queryResponse.queries[0];
  expect(query).toBeTruthy();
  expect(query.request.type).toBe('AssessmentVersionQuery');
  expect(query.request.assessmentUuid).toBe(assessmentUuid);

  const queryResult = query.result;
  expect(queryResult.type).toBe('AssessmentVersionQueryResult');
  expect(queryResult).toHaveProperty('formVersion');
  expect(queryResult.formVersion).toBeDefined();
  expect(queryResult).toHaveProperty('answers');
  expect(queryResult).toHaveProperty('collaborators');
  expect(Array.isArray(queryResult.collaborators)).toBe(true);

  console.log('Queried AAP assessment successfully');
});
