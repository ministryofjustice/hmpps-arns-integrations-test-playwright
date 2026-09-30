import { APIRequestContext, APIResponse } from '@playwright/test';
import { CommandResult } from '../assessmentTypes';

export const crn = Math.random().toString().substring(2, 7);

export async function updateAnswers(
  request: APIRequestContext,
  assessmentUuid: string,
  crn: string
): Promise<CommandResult> {
  const response: APIResponse = await request.post('/command', {
    data: {
      commands: [
        {
          type: 'UpdateAssessmentAnswersCommand',
          assessmentUuid: assessmentUuid,
          user: { id: 'test-user', name: 'Test User' },
          identifiers: {
            CRN: crn,
          },
          removed: [],
          flags: ['SAN_BETA'],
          added: {
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
    throw new Error(`UpdateAssessment failed: ${response.status()} ${response.statusText()}`);
  }

  return await response.json();
}
