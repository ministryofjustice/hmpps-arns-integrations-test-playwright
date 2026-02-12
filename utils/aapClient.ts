import { APIRequestContext, APIResponse } from '@playwright/test';
import fs from 'fs';

export const BASE_URL = 'https://arns-assessment-platform-api-dev.hmpps.service.justice.gov.uk';

export interface CreateAssessmentResult {
  commands: {
    request: {
      type: 'CreateAssessmentCommand';
      formVersion: string;
      timeline?: {
        type: string;
        data: Record<string, any>;
      };
      user: {
        id: string;
        name: string;
      };
    };
    result: {
      type: 'CreateAssessmentCommandResult';
      assessmentUuid: string;
      message: string;
      success: boolean;
    };
  }[];
}

export interface AssessmentQueryResponse {
  queries: {
    request: {
      type: 'AssessmentVersionQuery';
      user: { id: string; name: string };
      assessmentIdentifier: { type: string; uuid: string };
      timestamp: string | null;
    };
    result: {
      type: 'AssessmentVersionQueryResult';
      assessmentUuid: string;
      aggregateUuid: string;
      assessmentType: string;
      formVersion: string;
      createdAt: string;
      updatedAt: string;
      answers: Record<string, any>;
      properties: string;
      collections: any[];
      collaborators: { id: string; name: string }[];
      identifiers: string;
    };
  }[];
}

export const getToken = () => {
  return JSON.parse(fs.readFileSync('utils/aapToken.json', 'utf8')).access_token;
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
  const response: APIResponse = await request.post('/query', {
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
