import { APIRequestContext, APIResponse } from '@playwright/test';

export async function queryPlanHistory(request: APIRequestContext, assessmentUuid: string) {
  const response: APIResponse = await request.post('/query', {
    data: {
      queries: [
        {
          type: 'TimelineQuery',
          includeCustomTypes: ['GOAL_ACHIEVED', 'GOAL_REMOVED', 'GOAL_READDED', 'GOAL_UPDATED'],
          user: { id: 'test-user', name: 'Test User' },
          assessmentIdentifier: { type: 'UUID', uuid: assessmentUuid },
        },
      ],
    },
  });

  if (!response.ok()) {
    throw new Error(`QueryAssessment failed: ${response.status()} ${response.statusText()}`);
  }

  return response.json();
}
