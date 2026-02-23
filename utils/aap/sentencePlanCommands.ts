import { APIRequestContext, APIResponse } from '@playwright/test';
import { CreateAssessmentResult } from './assessmentTypes';

export const crn = Math.random().toString().substring(2, 7);

export async function createAssessmentSP(request: APIRequestContext): Promise<CreateAssessmentResult> {
  const response: APIResponse = await request.post('/command', {
    data: {
      commands: [
        {
          type: 'CreateAssessmentCommand',
          assessmentType: 'SENTENCE_PLAN',
          formVersion: '1.0',
          properties: {
            AGREEMENT_STATUS: { type: 'Single', value: 'DRAFT' },
            AGREEMENT_DATE: { type: 'Single', value: '' },
            AGREEMENT_NOTES: { type: 'Single', value: '' },
            PLAN_TYPE: { type: 'Single', value: 'INITIAL' },
          },
          user: { id: 'test-user', name: 'Test User' },
          identifiers: {
            CRN: crn,
          },
          flags: ['SAN_BETA'],
        },
      ],
    },
  });

  if (!response.ok()) {
    throw new Error(`CreateAssessment failed: ${response.status()} ${response.statusText()}`);
  }

  const body: CreateAssessmentResult = await response.json();

  // Check the UUID exists
  const assessmentUuid = body?.commands?.[0]?.result?.assessmentUuid;
  if (!assessmentUuid) throw new Error('No assessmentUuid found');

  return body; // Return full API response
}

export async function createGoalsCollection(request: APIRequestContext, assessmentUuid: string) {
  const response: APIResponse = await request.post('/command', {
    data: {
      commands: [
        {
          type: 'CreateCollectionCommand',
          name: 'GOALS',
          assessmentUuid: assessmentUuid,
          user: { id: 'test-user', name: 'Test User' },
          identifiers: {
            CRN: crn,
          },
          flags: ['SAN_BETA'],
        },
      ],
    },
  });

  if (!response.ok()) {
    throw new Error(`CreateAssessment failed: ${response.status()} ${response.statusText()}`);
  }
}
