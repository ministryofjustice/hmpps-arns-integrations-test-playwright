import fs from 'fs';
import fetch from 'node-fetch';

const BASE_URL = 'https://arns-assessment-platform-api-dev.hmpps.service.justice.gov.uk';

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

export async function createAssessment(): Promise<CreateAssessmentResult> {
  const token = JSON.parse(fs.readFileSync('utils/aapToken.json', 'utf8')).access_token;

  const response = await fetch(`${BASE_URL}/command`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      commands: [
        {
          type: 'CreateAssessmentCommand',
          assessmentType: 'TEST',
          formVersion: '1.0',
          properties: {},
          user: { id: 'test-user', name: 'Test User' },
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`CreateAssessment failed: ${response.status} ${response.statusText}`);
  }

  const body: CreateAssessmentResult = await response.json();

  // Check the UUID exists
  const assessmentUuid = body?.commands?.[0]?.result?.assessmentUuid;
  if (!assessmentUuid) throw new Error('No assessmentUuid found');

  return body; // Return full API response
}

export async function queryAssessment(assessmentUuid: string) {
  const token = JSON.parse(fs.readFileSync('utils/aapToken.json', 'utf8')).access_token;

  const response = await fetch(`${BASE_URL}/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      queries: [
        {
          type: 'AssessmentVersionQuery',
          user: { id: 'test-user', name: 'Test User' },
          assessmentIdentifier: { type: 'UUID', uuid: assessmentUuid },
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`QueryAssessment failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}
