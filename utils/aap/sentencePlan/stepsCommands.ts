import { APIRequestContext, APIResponse } from '@playwright/test';
import { CreateCollectionResult } from '../assessmentTypes';
import { crn } from './assessmentCommands';

export async function createStepsCollection(
  request: APIRequestContext,
  assessmentUuid: string,
  goalUuid: string
): Promise<string> {
  const response: APIResponse = await request.post('/command', {
    data: {
      commands: [
        {
          type: 'CreateCollectionCommand',
          name: 'STEPS',
          parentCollectionItemUuid: goalUuid,
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

  const body: CreateCollectionResult = await response.json();

  // Check the UUID exists
  const stepsCollectionUuid = body?.commands?.[0]?.result?.collectionUuid;
  if (!stepsCollectionUuid) throw new Error('No stepsCollectionUuid found');

  return stepsCollectionUuid;
}

export async function createStep(request: APIRequestContext, assessmentUuid: string, stepsCollectionUuid: string) {
  const response: APIResponse = await request.post('/command', {
    data: {
      commands: [
        {
          type: 'AddCollectionItemCommand',
          assessmentUuid: assessmentUuid,
          collectionUuid: stepsCollectionUuid,
          user: { id: 'test-user', name: 'Test User' },
          identifiers: {
            CRN: crn,
          },
          flags: ['SAN_BETA'],
          properties: {
            status_date: {
              type: 'Single',
              value: '2026-02-23T17:30:11.850Z',
            },
          },
          answers: {
            actor: {
              type: 'Single',
              value: 'probation_practitioner',
            },
            status: {
              type: 'Single',
              value: 'NOT_STARTED',
            },
            description: {
              type: 'Single',
              value: 'Step 1',
            },
          },
        },
      ],
    },
  });

  if (!response.ok()) {
    throw new Error(`CreateAssessment failed: ${response.status()} ${response.statusText()}`);
  }
}
