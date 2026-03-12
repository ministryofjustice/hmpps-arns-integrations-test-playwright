import { APIRequestContext, Page } from '@playwright/test';
import { createGoal, createGoalsCollection } from '../../../utils/aap/sentencePlan/goalsCommands';
import { createStep, createStepsCollection } from '../../../utils/aap/sentencePlan/stepsCommands';

export const createGoalAndStep = async (page: Page, apiContext: APIRequestContext): Promise<string> => {
  const info = await page.locator('pre').textContent();
  const assessmentId = info
    .substring(info.lastIndexOf('Assessment ID:'), info.indexOf('OASys PK:'))
    .substring(14)
    .replace('/n', '')
    .trim();

  const goalsCollectionUuid = await createGoalsCollection(apiContext, assessmentId);
  const goalUuid = await createGoal(apiContext, assessmentId, goalsCollectionUuid);
  const stepCollectionUuid = await createStepsCollection(apiContext, assessmentId, goalUuid);
  await createStep(apiContext, assessmentId, stepCollectionUuid);
  return assessmentId;
};
