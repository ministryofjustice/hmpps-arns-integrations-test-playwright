import { APIRequestContext } from '@playwright/test';
import { OasysCreateResponse, UserDetails } from '../coordinatorTypes';
import { oasysPk, name } from '../coordinatorClient';

export const softDelete = async (request: APIRequestContext): Promise<OasysCreateResponse> => {
  const userDetails: UserDetails = {
    userDetails: {
      id: oasysPk,
      name: name,
    },
  };

  const response = await request.post(`/oasys/${oasysPk}/soft-delete`, { data: userDetails });
  if (!response.ok()) {
    throw new Error(`Oasys soft-delete failed: ${response.status()} ${response.statusText()}`);
  }

  return await response.json();
};

export const undelete = async (request: APIRequestContext): Promise<OasysCreateResponse> => {
  const userDetails: UserDetails = {
    userDetails: {
      id: oasysPk,
      name: name,
    },
  };

  const response = await request.post(`/oasys/${oasysPk}/undelete`, { data: userDetails });
  if (!response.ok()) {
    throw new Error(`Oasys undelete failed: ${response.status()} ${response.statusText()}`);
  }

  return await response.json();
};
