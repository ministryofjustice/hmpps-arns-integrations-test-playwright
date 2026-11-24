import { test, expect, APIRequestContext } from '@playwright/test';
import { getToken } from '../../../../../utils/aapClient';
import { createOasysAssociation, getCoordinatorUrl } from '../../../../../utils/coordinator/coordinatorClient';
import { getHandoverLink, getHandoverUrl, getModsecError } from '../../../../../utils/handover/handoverClient';
import { CreateHandoverLinkResponse } from '../../../../../utils/handover/handoverTypes';

let handoverContext: APIRequestContext;
let coordinatorContext: APIRequestContext;

test.beforeAll(async ({ playwright, baseURL }) => {
  handoverContext = await playwright.request.newContext({
    baseURL: getHandoverUrl(baseURL),
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
  await handoverContext.dispose();
  await coordinatorContext.dispose();
});

test.describe(
  'Handover API',
  {
    tag: '@dev',
  },
  () => {
    let assessmentVersion: number | null;
    const crn = Math.random().toString().substring(2, 7);
    const oasysPk = Math.floor(Math.random() * 1000000000).toString();

    test.beforeEach(async () => {
      assessmentVersion = await test.step('OAsys association', async () => {
        const oasysResponse = await createOasysAssociation(coordinatorContext, crn, oasysPk);
        expect(oasysResponse).toBeTruthy();

        const sanVersion = oasysResponse.sanAssessmentVersion === 0 ? null : oasysResponse.sanAssessmentVersion;

        return sanVersion;
      });
    });
  });

    test('Get Handover link', async () => {
      const handoverResponse: CreateHandoverLinkResponse = await getHandoverLink(
        handoverContext,
        oasysPk,
        null,
        assessmentVersion
      );

    expect(handoverResponse).toBeTruthy();
    expect(handoverResponse.handoverLink).toContain('/handover/');
  });
});

// https://dsdmoj.atlassian.net/wiki/spaces/ARN/pages/6150881391/ModSec+-+AAP+Team+Guide#Testing
test(
  'Modsec handover',
  {
    tag: '@security',
  },
  async () => {
    const modSecResponse: number = await getModsecError(handoverContext);

    expect(modSecResponse).toBe(406);
  }
);
