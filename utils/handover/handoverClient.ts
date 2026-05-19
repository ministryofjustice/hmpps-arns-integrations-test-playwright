import { APIRequestContext, APIResponse } from '@playwright/test';
import {
  CreateHandoverLinkRequest,
  CreateHandoverLinkResponse,
  CriminogenicNeedsData,
  HandoverSubjectDetails,
} from './handoverTypes';

let OasysReturnUrl: string = 'https://t2.oasys.service.justice.gov.uk';

export const getHandoverUrl = (baseUrl: string): string => {
  if (baseUrl.includes('test')) {
    OasysReturnUrl = 'https://t2-b.oasys.service.justice.gov.uk';
    return 'https://arns-handover-service-test.hmpps.service.justice.gov.uk';
  }
  return 'https://arns-handover-service-dev.hmpps.service.justice.gov.uk';
};

export const crn = Math.random().toString().substring(2, 7);

const subjectDetails: HandoverSubjectDetails = {
  crn: crn,
  pnc: 'UNKNOWN',
  givenName: 'INTEGRATIONS',
  familyName: 'PLAYWRIGHT',
  gender: '1',
  dateOfBirth: '1988-01-01',
  location: 'COMMUNITY',
};

const criminogenicNeedsData: CriminogenicNeedsData = {
  accommodation: {
    accLinkedToHarm: 'YES',
    accLinkedToReoffending: 'YES',
    accStrengths: 'NO',
    accOtherWeightedScore: '4',
  },
  educationTrainingEmployability: {
    eteLinkedToHarm: 'NO',
    eteLinkedToReoffending: 'YES',
    eteStrengths: 'NO',
    eteOtherWeightedScore: '2',
  },
  drugMisuse: {
    drugLinkedToHarm: 'YES',
    drugLinkedToReoffending: 'YES',
    drugStrengths: 'NO',
    drugOtherWeightedScore: '3',
  },
  alcoholMisuse: {
    alcoholLinkedToHarm: 'YES',
    alcoholLinkedToReoffending: 'NO',
    alcoholStrengths: 'NO',
    alcoholOtherWeightedScore: '3',
  },
  personalRelationshipsAndCommunity: {
    relLinkedToHarm: 'NO',
    relLinkedToReoffending: 'NO',
    relStrengths: 'YES',
    relOtherWeightedScore: '0',
  },
  thinkingBehaviourAndAttitudes: {
    thinkLinkedToHarm: 'YES',
    thinkLinkedToReoffending: 'YES',
    thinkStrengths: 'NO',
    thinkOtherWeightedScore: '4',
  },
};

export function generateUserId(prefix: string = 'int-test'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');

  return `${prefix}-${timestamp}-${random}`;
}

export const getHandoverLink = async (
  request: APIRequestContext,
  planVersion: number,
  oasysPk: string
): Promise<CreateHandoverLinkResponse> => {
  const createRequest: CreateHandoverLinkRequest = {
    user: {
      identifier: generateUserId(),
      displayName: 'Test User',
      accessMode: 'READ_WRITE',
      planAccessMode: 'READ_WRITE',
      returnUrl: OasysReturnUrl,
    },
    subjectDetails,
    oasysAssessmentPk: oasysPk,
    criminogenicNeedsData: criminogenicNeedsData,
    sentencePlanVersion: planVersion,
  };

  const response: APIResponse = await request.post(`/handover`, { data: createRequest });

  if (!response.ok()) {
    throw new Error(`Handover failed: ${response.status()} ${response.statusText()}`);
  }

  return await response.json();
};

export const createHandoverLink = async (request: APIRequestContext, planVersion: number, oasysPk: string) => {
  const handoverResponse: CreateHandoverLinkResponse = await getHandoverLink(request, planVersion, oasysPk);

  return handoverResponse.handoverLink;
};
