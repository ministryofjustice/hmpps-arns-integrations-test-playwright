import { test } from '@playwright/test';
import { StubHomePage } from '../page-objects/stub-home-page';
import { SentencePlanPage } from '../page-objects/sentence-plan-pages';

/* Note: this test feature will fail if the test data is wiped. 
It relies on pre-existing PK with a completed SAN assessment. */
test.skip('User updates their step status and checks plan history', async ({ page }) => {
  const stubHomePage = new StubHomePage(page);
  const sentencePlanPage = new SentencePlanPage(page);

  // Navigate to the stub home page
  await stubHomePage.goto();

  // Check the title of the page is correct
  await stubHomePage.checkPageTitle();

  // Paste PK of existing user
  await stubHomePage.fillInPkNumberOfCompletedAssessment();

  // Select sentence plan
  await stubHomePage.selectSentencePlan();

  // Click create handover button
  await stubHomePage.clickCreateHandoverButton();

  // Click open button
  await stubHomePage.clickOpenButton();

  // Check the data privacy page title is correct
  await sentencePlanPage.checkPageTitleDataPrivacyScreen();

  // Tick confirm and submit
  await sentencePlanPage.tickConfirmBox();
  await sentencePlanPage.clickConfirmButtonOnDataPrivacyScreen();

  // Check page title
  await sentencePlanPage.checkPageTitleSentencePlanAfterDataPrivacyScreen();

  // Change step status and add notes
  await sentencePlanPage.clickUpdateLink();
  await sentencePlanPage.checkUpdateStepsPageTitle();
  await sentencePlanPage.updateStepStatustoInProgress();
  await sentencePlanPage.addNotesAboutStepUpdate();
  await sentencePlanPage.clickSaveGoalAndStepsButton();
  await sentencePlanPage.clickViewStepsElement();
  await sentencePlanPage.checkStepStatusIsSetToInProgress();
  console.log('Goal step status updated to in progress');

  // Check information from plan history page
  await sentencePlanPage.clickPlanHistoryTopNavLink();
  await sentencePlanPage.checkPlanCreationUpdateIsUnique();
  await sentencePlanPage.checkPlanCreationIsNotOverwritten();
  console.log('Update information from plan history verified');

  // Revert step status back to not started
  await sentencePlanPage.clickPlanTopNavLink();
  await sentencePlanPage.clickUpdateLink();
  await sentencePlanPage.checkUpdateStepsPageTitle();
  await sentencePlanPage.updateStepStatusBackToNotStarted();
  await sentencePlanPage.addNotesAboutStepUpdate();
  await sentencePlanPage.clickSaveGoalAndStepsButton();
  await sentencePlanPage.clickViewStepsElement();
  await sentencePlanPage.checkStepStatusBackToNotStarted();
  console.log('Goal step status updated back to not started');
});
