import { APIRequestContext } from '@playwright/test';
import {
  OasysCounterSignRequest,
  OasysCreateResponse,
  OasysRollbackRequest,
  OasysSignRequest,
  Outcome,
  SignType,
} from '../coordinatorTypes';

export const sign = async (
  request: APIRequestContext,
  oasysPk: string,
  name: string = 'Brennon Mayer',
  signType: SignType = 'SELF'
): Promise<OasysCreateResponse> => {
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
): Promise<OasysCreateResponse> => {
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
): Promise<OasysCreateResponse> => {
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
    return {} as OasysCreateResponse;
  }
};
