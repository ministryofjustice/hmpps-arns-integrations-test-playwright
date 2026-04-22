import { APIRequestContext, APIResponse } from '@playwright/test';
import {
  OasysCounterSignRequest,
  OasysCreateRequest,
  OasysCreateResponse,
  OasysRollbackRequest,
  OasysSignRequest,
  Outcome,
  PreviousVersionsResponse,
  SignType,
  UserDetails,
} from './coordinatorTypes';

export const getCoordinatorUrl = (baseUrl: string): string => {
  if (baseUrl.includes('test')) {
    return 'https://arns-coordinator-api-test.hmpps.service.justice.gov.uk';
  }
  return 'https://arns-coordinator-api-dev.hmpps.service.justice.gov.uk';
};

export const name = 'Test';

export const createOasysAssociation = async (
  request: APIRequestContext,
  crn: string,
  oasysPk: string
): Promise<OasysCreateResponse> => {
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

export const getAssociations = async (request: APIRequestContext, oasysPk: string = '7282419') => {
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

export const lock = async (request: APIRequestContext, oasysPk: string) => {
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

export const sign = async (
  request: APIRequestContext,
  oasysPk: string,
  name: string = 'Brennon Mayer',
  signType: SignType = 'SELF'
) => {
  const sign: OasysSignRequest = {
    signType: signType,
    userDetails: {
      id: oasysPk,
      name: name,
    },
  };

  const response = await request.post(`/oasys/${oasysPk}/sign`, { data: sign });
  if (!response.ok()) {
    throw new Error(`Oasys self signing failed: ${response.status()} ${response.statusText()}`);
  }

  return await response.json();
};

export const counterSign = async (
  request: APIRequestContext,
  oasysPk: string,
  name: string = 'Brennon Mayer',
  outcome: Outcome = 'COUNTERSIGNED',
  sanVersionNumber?: number,
  sentencePlanVersionNumber?: number
) => {
  const sign: OasysCounterSignRequest = {
    outcome: outcome,
    sanVersionNumber: sanVersionNumber,
    sentencePlanVersionNumber: sentencePlanVersionNumber,
    userDetails: {
      id: oasysPk,
      name: name,
    },
  };

  const response = await request.post(`/oasys/${oasysPk}/counter-sign`, { data: sign });
  if (!response.ok()) {
    throw new Error(`Oasys self signing failed: ${response.status()} ${response.statusText()}`);
  }

  return await response.json();
};

export const rollback = async (
  request: APIRequestContext,
  oasysPk: string,
  name: string = 'Brennon Mayer',
  sanVersionNumber?: number,
  sentencePlanVersionNumber?: number
) => {
  const rollback: OasysRollbackRequest = {
    sanVersionNumber: sanVersionNumber,
    sentencePlanVersionNumber: sentencePlanVersionNumber,
    userDetails: {
      id: oasysPk,
      name: name,
    },
  };

  try {
    const response = await request.post(`/oasys/${oasysPk}/rollback`, { data: rollback });
    if (!response.ok()) {
      throw new Error(`Oasys rollback failed: ${response.status()} ${response.statusText()}`);
    }

    return await response.json();
  } catch {
    return {};
  }
};
