import { APIRequestContext, APIResponse } from '@playwright/test';
import { AddCollectionItemCommandResult, CreateCollectionResult } from '../assessmentTypes';
import { crn } from './assessmentCommands';

export async function createGoalsCollection(request: APIRequestContext, assessmentUuid: string): Promise<string> {
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

  const body: CreateCollectionResult = await response.json();

  // Check the UUID exists
  const goalsCollectionUuid = body?.commands?.[0]?.result?.collectionUuid;
  if (!goalsCollectionUuid) throw new Error('No goalsCollectionUuid found');

  return goalsCollectionUuid;
}

export async function createGoal(request: APIRequestContext, assessmentUuid: string, goalsCollectionUuid: string) {
  const response: APIResponse = await request.post('/command', {
    data: {
      commands: [
        {
          type: 'AddCollectionItemCommand',
          name: 'GOALS',
          assessmentUuid: assessmentUuid,
          collectionUuid: goalsCollectionUuid,
          user: { id: 'test-user', name: 'Test User' },
          identifiers: {
            CRN: crn,
          },
          flags: ['SAN_BETA'],
          properties: {
            status: {
              type: 'Single',
              value: 'ACTIVE',
            },
            status_date: {
              type: 'Single',
              value: '2026-02-23T17:30:11.179Z',
            },
          },
          answers: {
            title: {
              type: 'Single',
              value: 'I will work towards finding accommodation, so that I am no longer homeless',
            },
            target_date: {
              type: 'Single',
              value: '2026-05-23T16:30:11.151Z',
            },
            area_of_need: {
              type: 'Single',
              value: 'accommodation',
            },
            related_areas_of_need: {
              type: 'Multi',
              values: ['alcohol-use'],
            },
          },
        },
      ],
    },
  });

  if (!response.ok()) {
    throw new Error(`CreateAssessment failed: ${response.status()} ${response.statusText()}`);
  }

  const body: AddCollectionItemCommandResult = await response.json();

  // Check the UUID exists
  const goalUuid = body?.commands?.[0]?.result?.collectionItemUuid;
  if (!goalUuid) throw new Error('No goalUuid found');

  return goalUuid;
}
