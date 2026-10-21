import { APIRequestContext, APIResponse } from '@playwright/test';
import { CommandResult } from '../assessmentTypes';

export async function updateDrugProperties(
  request: APIRequestContext,
  assessmentUuid: string,
  crn: string
): Promise<CommandResult> {
  const response: APIResponse = await request.post('/command', {
    data: {
      commands: [
        {
          type: 'UpdateAssessmentPropertiesCommand',
          assessmentUuid: assessmentUuid,
          user: { id: 'test-user', name: 'Test User' },
          identifiers: {
            CRN: crn,
          },
          removed: [],
          flags: ['SAN_BETA'],
          added: {
            is_user_submitted_drug_use_status: {
              type: 'Single',
              value: 'TRUE',
            },
            is_user_submitted_drug_use_types: {
              type: 'Single',
              value: 'TRUE',
            },
            is_user_submitted_drug_use_details: {
              type: 'Single',
              value: 'TRUE',
            },
            drug_use_section_complete: {
              type: 'Single',
              value: 'NO',
            },
          },
        },
      ],
    },
  });

  if (!response.ok()) {
    throw new Error(`UpdateAssessmentProperties failed: ${response.status()} ${response.statusText()}`);
  }

  return await response.json();
}

export async function updateDrugAnswers(
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
            drug_use: {
              type: 'Single',
              value: 'YES',
            },
            select_misused_drugs: {
              type: 'Multi',
              values: ['AMPHETAMINES'],
            },
            drug_last_used_amphetamines: {
              type: 'Single',
              value: 'LAST_SIX',
            },
            drugs_injected: {
              type: 'Multi',
              values: ['AMPHETAMINES'],
            },
            drugs_injected_amphetamines: {
              type: 'Multi',
              values: ['LAST_SIX'],
            },
            drugs_is_receiving_treatment: {
              type: 'Single',
              value: 'YES',
            },
            how_often_used_last_six_months_amphetamines: {
              type: 'Single',
              value: 'DAILY',
            },
            how_often_used_last_six_months_amphetamines_details: {
              type: 'Single',
              value: 'multiple times a day',
            },
          },
        },
      ],
    },
  });

  if (!response.ok()) {
    throw new Error(`UpdateAssessmentAnswers failed: ${response.status()} ${response.statusText()}`);
  }

  return await response.json();
}
