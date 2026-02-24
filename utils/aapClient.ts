import { APIRequestContext, APIResponse } from '@playwright/test';
import fs from 'fs';
import { CreateAssessmentResult } from './aap/assessmentTypes';

export const crn = Math.random().toString().substring(2, 7);

export const getToken = () => {
  return JSON.parse(fs.readFileSync('utils/aapToken.json', 'utf8')).access_token;
};

export const getBaseUrl = (baseUrl: string): string => {
  if (baseUrl.includes('test')) {
    return 'https://arns-assessment-platform-api-test.hmpps.service.justice.gov.uk';
  }
  return 'https://arns-assessment-platform-api-dev.hmpps.service.justice.gov.uk';
};

export async function createAssessment(request: APIRequestContext): Promise<CreateAssessmentResult> {
  const response: APIResponse = await request.post('/command', {
    data: {
      commands: [
        {
          type: 'CreateAssessmentCommand',
          assessmentType: 'TEST',
          formVersion: '1.0',
          properties: {},
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

export async function queryAssessment(request: APIRequestContext, assessmentUuid: string) {
  const response = await request.post('/query', {
    data: {
      queries: [
        {
          type: 'AssessmentVersionQuery',
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
