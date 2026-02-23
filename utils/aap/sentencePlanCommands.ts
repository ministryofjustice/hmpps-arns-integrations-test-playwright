import { APIRequestContext, APIResponse } from '@playwright/test';
import { AddCollectionItemCommandResult, CreateAssessmentResult, CreateCollectionResult } from './assessmentTypes';

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
