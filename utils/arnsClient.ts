import { APIRequestContext } from '@playwright/test';
import fs from 'fs';
import path from 'path';

export interface AssessmentStep {
  description: string;
  status: string;
  actor: string;
  statusDate: string;
}
export interface AssessmentGoal {
  titleLength: number;
  titleHash: string;
  areaOfNeed: string;
  relatedAreasOfNeed: string[];
  targetDate: string | null;
  goalStatus: string;
  steps: AssessmentStep[];
}

export interface Assessment {
  crn: string;
  nomis: string | null;
  planStatus: string;
  goals: AssessmentGoal[];
}

export const getToken = () => {
  const tokenPath = path.join(__dirname, 'arnsAssessmentToken.json');
  return JSON.parse(fs.readFileSync(tokenPath, 'utf8')).access_token;
};

export const getBaseUrl = (baseUrl: string): string => {
  if (baseUrl.includes('test')) {
    return 'https://arns-assessment-view-api-test.hmpps.service.justice.gov.uk';
  }
  return 'https://arns-assessment-view-api-dev.hmpps.service.justice.gov.uk';
};

export async function viewAssessment(request: APIRequestContext, crn: string): Promise<Assessment[]> {
  const response = await request.get(`/sentence-plan/${crn}`);

  if (!response.ok()) {
    throw new Error(`ARNSViewAssessment failed: ${response.status()}`);
  }
  return await response.json();
}
