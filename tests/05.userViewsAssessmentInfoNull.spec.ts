import { test } from '@playwright/test';
import { StubHomePage } from '../page-objects/stub-home-page';
import { SentencePlanPage } from '../page-objects/sentence-plan-pages';

test('User views assessment info when creating a goal - Null answers', async ({ page }) => {
  const stubHomePage = new StubHomePage(page);
  const sentencePlanPage = new SentencePlanPage(page);

  // Navigate to the stub home page
  await stubHomePage.goto();

  // Check the title of the page is correct
  await stubHomePage.checkPageTitle();

  // Set up accomodation criminogenic needs Null answers
  await stubHomePage.clickCriminogenicNeedsTab();
  await stubHomePage.selectNullAccLinkedToHarmDropdown();
  await stubHomePage.selectNullAccLinkedToReoffending();
  await stubHomePage.selectNullAccStrengths();

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

  // Check information from accomodation assessment from create a goal page
  await sentencePlanPage.clickCreateGoalButton();
  await sentencePlanPage.clickViewInfoFromAssessmentDropdown();
  await sentencePlanPage.checkThisAreaIsNotMarkedAsCompleteWarningDoesNotDisplay();
  await sentencePlanPage.checkNoInfoAvailableYetWarningDisplays();
  console.log('Information from accomodation assessment Null answers verified');
});
