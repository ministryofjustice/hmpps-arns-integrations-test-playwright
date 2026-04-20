import { APIRequestContext, APIResponse } from '@playwright/test';
import {
  OasysAssociationsResponse,
  OasysCreateRequest,
  OasysCreateResponse,
  PreviousVersionsResponse,
  UserDetails,
} from './coordinatorTypes';

export const getCoordinatorUrl = (baseUrl: string): string => {
  if (baseUrl.includes('test')) {
    return 'https://arns-coordinator-api-test.hmpps.service.justice.gov.uk';
  }
  return 'https://arns-coordinator-api-dev.hmpps.service.justice.gov.uk';
};

export const oasysPk = Math.floor(Math.random() * 1000000000).toString();
export const name = 'Test';

export const createOasysAssociation = async (request: APIRequestContext, crn: string): Promise<OasysCreateResponse> => {
  const create: OasysCreateRequest = {
    oasysAssessmentPk: oasysPk,
    planType: 'INITIAL',
    assessmentType: 'SAN_SP',
    userDetails: {
      id: oasysPk,
      name: name,
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

export type PreviousVersionsResponses = PreviousVersionsResponse | string;

export const entityVersions = async (
  request: APIRequestContext,
  assessmentUuid: string
): Promise<PreviousVersionsResponses> => {
  const response: APIResponse = await request.get(`/entity/versions/${assessmentUuid}`);

  if (response.status() === 404) {
    return await response.text();
  }

  if (!response.ok()) {
    throw new Error(`Entity Versions failed: ${response.status()} ${response.statusText()}`);
  }

  return await response.json();
};

export const getAssociations = async (
  request: APIRequestContext,
  oasysPk: string = '7282419'
): Promise<OasysAssociationsResponse> => {
  const response: APIResponse = await request.get(`/oasys/${oasysPk}/associations`);

  if (!response.ok()) {
    throw new Error(`OASys Associations failed: ${response.status()} ${response.statusText()}`);
  }

  return await response.json();
};

export const getVersionDate = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export const lock = async (request: APIRequestContext): Promise<OasysCreateResponse> => {
  const userDetails: UserDetails = {
    userDetails: {
      id: oasysPk,
      name: name,
    },
  };

  const response = await request.post(`/oasys/${oasysPk}/lock`, { data: userDetails });
  if (!response.ok()) {
    throw new Error(`Oasys lock failed: ${response.status()} ${response.statusText()}`);
  }

  return await response.json();
};
