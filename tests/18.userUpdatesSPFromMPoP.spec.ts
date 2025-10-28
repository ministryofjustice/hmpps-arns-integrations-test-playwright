import {test} from '@playwright/test';
import { MpopPages } from '../page-objects/mpop-pages';
import { SentencePlanPage } from '../page-objects/sentence-plan-pages';

test('user updates a sentence plan from mpop', async ({ page }) => {

  const mpopPages = new MpopPages(page);
  const sentencePlanPage = new SentencePlanPage(page);

  // Navigate to the MPoP landing page
  await mpopPages.navigateToMpopLink();

  // Authenticate via hmpps auth
  await mpopPages.authenticateWithHmppsAuthCredentials();

  // Access caseload
  await mpopPages.clickCasesTopNavLink();

  // Access test crn
  await mpopPages.clickCrnLink();

  // navigate to risk and plan section
  await mpopPages.clickRiskAndPlanLink();

  // click sentence plan link
  await mpopPages.clickSentencePlanLink();

  // assert page title
  await sentencePlanPage.checkPageTitleDataPrivacyScreen();

  // confirm on data privacy screen
  await sentencePlanPage.tickConfirmBox();
  await sentencePlanPage.clickConfirmButtonOnDataPrivacyScreen();

  // assert user is taken to sentence plan
  await sentencePlanPage.checkPageTitleSentencePlanAfterDataPrivacyScreen

  // Change step status and add notes
  await sentencePlanPage.clickUpdateLink();
  await sentencePlanPage.checkUpdateStepsPageTitle();
  await sentencePlanPage.updateStepStatustoInProgress();
  await sentencePlanPage.addNotesAboutStepUpdate();
  await sentencePlanPage.clickSaveGoalAndStepsButton();
  await sentencePlanPage.clickViewStepsElement();
  await sentencePlanPage.checkStepStatusIsSetToInProgress();
  console.log('Goal step status updated to in progress via MPoP');

  // Revert step status back to not started
  await sentencePlanPage.clickPlanTopNavLink();
  await sentencePlanPage.clickUpdateLink();
  await sentencePlanPage.checkUpdateStepsPageTitle();
  await sentencePlanPage.updateStepStatusBackToNotStarted();
  await sentencePlanPage.addNotesAboutStepUpdate();
  await sentencePlanPage.clickSaveGoalAndStepsButton();
  await sentencePlanPage.clickViewStepsElement();
  await sentencePlanPage.checkStepStatusBackToNotStarted();
  console.log('Goal step status updated back to not started via MPoP');

  });
