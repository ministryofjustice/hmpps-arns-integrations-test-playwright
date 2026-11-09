import { APIRequestContext, Page } from '@playwright/test';
import { updateAccommodationAnswers, updateAccommodationProperties, updateDrugAnswers, updateDrugProperties } from '../../../utils/aap/strengthsAndNeeds/assessmentCommands';

const extractCrn = (details: string): string => {
  const fields = details.split('|');
  const crnLabelIndex = fields.indexOf('CRN:');
  const crn = crnLabelIndex === -1 ? undefined : fields[crnLabelIndex + 1]?.trim();

  if (!crn) {
    throw new Error(`Unable to extract CRN from the person header: ${details}`);
  }

  return crn;
};

const extractDetails = async (page: Page): Promise<{ details: string; assessmentId: string }> => {
  const assessmentId = new URL(page.url()).pathname.match(
    /\/edit\/([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})(?:\/|$)/i
  )?.[1];

  if (!assessmentId) {
    throw new Error(`Unable to extract assessment ID from URL: ${page.url()}`);
  }

  const details = (await page.locator('[data-qa="person-header"] dl > *').allTextContents())
    .map((text) => text.trim())
    .join('|');
  return { details: details, assessmentId: assessmentId };
};

export const createDrugs = async (page: Page, apiContext: APIRequestContext): Promise<string> => {
  const details = await extractDetails(page);
  const crn = extractCrn(details.details);
  const assessmentId = details.assessmentId;

  await updateDrugProperties(apiContext, assessmentId, crn);
  await updateDrugAnswers(apiContext, assessmentId, crn);
  return assessmentId;
};

export const createAccommodation = async (page: Page, apiContext: APIRequestContext): Promise<string> => {
  const details = await extractDetails(page);
  const crn = extractCrn(details.details);
  const assessmentId = details.assessmentId;

  // Assuming there are similar functions for accommodation as for drugs
  await updateAccommodationProperties(apiContext, assessmentId, crn);
  await updateAccommodationAnswers(apiContext, assessmentId, crn);
  return assessmentId;
};
