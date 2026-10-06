import { expect, test } from '@playwright/test';
import { PrivacyPage } from '../../../../../page-objects/arns-assessment-platform/privacy-page';
import { SentencePlanPage } from '../../../../../page-objects/arns-assessment-platform/sentence-plan-page';
import { CreateGoalPage } from '../../../../../page-objects/arns-assessment-platform/create-goal-page';
import { AreaOfNeedPage } from '../../../../../page-objects/arns-assessment-platform/area-of-need-page';
import { MpopPages } from '../../../../../page-objects/oastub-archive/mpop-pages';

const crn = 'X998795';

test.beforeEach(async ({ page }) => {
  const privacy = new PrivacyPage(page);
  const mpop = new MpopPages(page);

  await page.goto(`/access/sentence-plan/crn/${crn}`);

  await mpop.authenticateWithHmppsAuthCredentials();

  await expect(page).toHaveTitle('Close other applications - Sentence plan');
  await privacy.confirmPrivacy.click();
  await privacy.confirm.click();
  await expect(page).toHaveTitle('Plan - Sentence plan');
});

test(
  'should view Criminogenic Needs information as mpop user',
  {
    tag: '@dev',
  },
  async ({ page }) => {
    const sentencePlan = new SentencePlanPage(page);
    const createGoal = new CreateGoalPage(page);
    const areaOfNeed = new AreaOfNeedPage(page);

    await sentencePlan.createGoal.click();
    await areaOfNeed.select('Accommodation');
    await expect(page).toHaveTitle('Add goal details - Sentence plan');
    await createGoal.viewInformation.click();
    await expect(page.getByText('has already made positive changes and wants to maintain them.')).toBeVisible();

    await createGoal.changeAreaOfNeed.click();
    await areaOfNeed.select('Employment and education');
    await createGoal.viewInformation.click();
    await expect(page.getByText('does not want to answer.')).toBeVisible();
  }
);
