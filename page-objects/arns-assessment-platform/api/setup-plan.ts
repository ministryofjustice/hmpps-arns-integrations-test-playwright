import { APIRequestContext, Page } from '@playwright/test';
import {
  createGoal,
  createGoalsCollection,
  createStep,
  createStepsCollection,
} from '../../../utils/aap/sentencePlanCommands';

export const createGoalAndStep = async (page: Page, apiContext: APIRequestContext): Promise<string> => {
  const info = await page.locator('pre').textContent();
  const assessmentId = info.substring(info.lastIndexOf('Assessment ID:'), info.indexOf('OASys PK:')).substring(14);

  const goalsCollectionUuid = await createGoalsCollection(apiContext, assessmentId);
  const goalUuid = await createGoal(apiContext, assessmentId, goalsCollectionUuid);
  const stepCollectionUuid = await createStepsCollection(apiContext, assessmentId, goalUuid);
  await createStep(apiContext, assessmentId, stepCollectionUuid);
  return assessmentId;
};
