import { test, expect, APIRequestContext } from '@playwright/test';
import { getBaseUrl, getModsecError, getToken } from '../../../../../utils/aapClient';

let apiContext: APIRequestContext;

test.beforeAll(async ({ playwright, baseURL }) => {
  apiContext = await playwright.request.newContext({
    baseURL: getBaseUrl(baseURL),
    extraHTTPHeaders: {
      Authorization: `Bearer ${getToken()}`,
      'Content-Type': 'application/json',
    },
  });
});

test.afterAll(async () => {
  await apiContext.dispose();
});

// https://dsdmoj.atlassian.net/wiki/spaces/ARN/pages/6150881391/ModSec+-+AAP+Team+Guide#Testing
test(
  'Modsec aap',
  {
    tag: '@security',
  },
  async () => {
    const modSecResponse: number = await getModsecError(apiContext);

    expect(modSecResponse).toBe(406);
  }
);
