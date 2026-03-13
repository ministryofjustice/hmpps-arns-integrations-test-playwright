import { APIRequestContext, APIResponse } from '@playwright/test';
import { OasysCreateRequest, OasysCreateResponse, PreviousVersionsResponse } from './coordinatorTypes';

export const getCoordinatorUrl = (baseUrl: string): string => {
  if (baseUrl.includes('test')) {
    return 'https://arns-coordinator-api-test.hmpps.service.justice.gov.uk';
  }
  return 'https://arns-coordinator-api-dev.hmpps.service.justice.gov.uk';
};

export const crn = Math.random().toString().substring(2, 7);
export const oasysPk = Math.floor(Math.random() * 1000000000).toString();

export const createOasysAssociation = async (request: APIRequestContext, crn: string): Promise<OasysCreateResponse> => {
  const create: OasysCreateRequest = {
    oasysAssessmentPk: oasysPk,
    planType: 'INITIAL',
    assessmentType: 'SAN_SP',
    userDetails: {
      id: oasysPk,
      name: 'Test',
      location: 'PRISON',
    },
    subjectDetails: {
      crn: crn,
    },
    newPeriodOfSupervision: 'N',
    previousOasysSanPk: undefined,
    previousOasysSpPk: undefined,
    regionPrisonCode: 'MDI',
  };
  const response = await request.post(`/oasys/create`, { data: create });

  if (!response.ok()) {
    throw new Error(`Oasys association failed: ${response.status()} ${response.statusText()}`);
  }

  return await response.json();
};

export const entityVersions = async (
  request: APIRequestContext,
  assessmentUuid: string
): Promise<PreviousVersionsResponse> => {
  const response: APIResponse = await request.get(`/entity/versions/${assessmentUuid}`);

  if (!response.ok()) {
    throw new Error(`Entity Versions failed: ${response.status()} ${response.statusText()}`);
  }

  return await response.json();
};

export const getVersionDate = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};
