import { test, expect, APIRequestContext } from '@playwright/test';
import { getBaseUrl, getToken } from '../../../../../utils/aapClient';
import { getCoordinatorUrl, getModsecError } from '../../../../../utils/coordinator/coordinatorClient';

let apiContext: APIRequestContext;
let coordinatorContext: APIRequestContext;

test.beforeAll(async ({ playwright, baseURL }) => {
  apiContext = await playwright.request.newContext({
    baseURL: getBaseUrl(baseURL),
    extraHTTPHeaders: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
  coordinatorContext = await playwright.request.newContext({
    baseURL: getCoordinatorUrl(baseURL),
    extraHTTPHeaders: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
});

test.afterAll(async () => {
  await apiContext.dispose();
  await coordinatorContext.dispose();
});

// https://dsdmoj.atlassian.net/wiki/spaces/ARN/pages/6150881391/ModSec+-+AAP+Team+Guide#Testing
test(
  'Modsec coordinator',
  {
    tag: '@security',
  },
  async () => {
    const modSecResponse: number = await getModsecError(coordinatorContext);

    expect(modSecResponse).toBe(406);
  }
);
