import { APIRequestContext, APIResponse } from '@playwright/test';
import fs from 'fs';
import path from 'path';

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

export async function viewAssessment(request: APIRequestContext, crn: string): Promise<any> {
  const response = await request.get(`/sentence-plan/${crn}`);

  if (!response.ok()) {
    throw new Error(`ARNSViewAssessment failed: ${response.status()}`);
  }
  return await response.json();
}