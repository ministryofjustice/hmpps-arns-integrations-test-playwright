import { APIRequestContext, Page } from '@playwright/test';
import { updateDrugAnswers, updateDrugProperties } from '../../../utils/aap/strengthsAndNeeds/assessmentCommands';

const extractCrn = (details: string): string => {
  const fields = details.split('|');
  const crnLabelIndex = fields.indexOf('CRN:');
  const crn = crnLabelIndex === -1 ? undefined : fields[crnLabelIndex + 1]?.trim();

  if (!crn) {
    throw new Error(`Unable to extract CRN from the person header: ${details}`);
  }

  return crn;
};

export const createDrugs = async (page: Page, apiContext: APIRequestContext): Promise<string> => {
  const assessmentId = new URL(page.url()).pathname.match(
    /\/edit\/([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})(?:\/|$)/i
  )?.[1];

  if (!assessmentId) {
    throw new Error(`Unable to extract assessment ID from URL: ${page.url()}`);
  }

  const details = (await page.locator('[data-qa="person-header"] dl > *').allTextContents())
    .map((text) => text.trim())
    .join('|');

  const crn = extractCrn(details);

  await updateDrugProperties(apiContext, assessmentId, crn);
  await updateDrugAnswers(apiContext, assessmentId, crn);
  return assessmentId;
};
