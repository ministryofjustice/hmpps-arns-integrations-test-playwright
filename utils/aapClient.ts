import { APIRequestContext, APIResponse } from '@playwright/test';
import fs from 'fs';

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

export const getModsecError = async (request: APIRequestContext): Promise<number> => {
  const response: APIResponse = await request.get(`?q=<script>>alert(1)</script>`);

  return response.status();
};
