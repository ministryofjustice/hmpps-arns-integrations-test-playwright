import { test } from '@playwright/test';
import { StubHomePage } from '../page-objects/stub-home-page';
import { SentencePlanPage } from '../page-objects/sentence-plan-pages';

test('User views assessment info when creating a goal - Yes answers', async ({ page }) => {
  
  const stubHomePage = new StubHomePage(page);
  const sentencePlanPage = new SentencePlanPage(page);
  
  // Navigate to the stub home page
  await stubHomePage.goto();

  // Check the title of the page is correct
  await stubHomePage.checkPageTitle();

  // Set up accomodation criminogenic needs Yes answers
  await stubHomePage.clickCriminogenicNeedsTab();
  await stubHomePage.selectYesAccLinkedToHarmDropdown();
  await stubHomePage.selectYesAccLinkedToReoffending();
  await stubHomePage.selectYesAccStrengths();

  // Select sentence plan
  await stubHomePage.selectSentencePlan();

  // Click create handover button
  await stubHomePage.clickCreateHandoverButton(); 

  // Click open button
  await stubHomePage.clickOpenButton();

  // Check the page title is correct
  await sentencePlanPage.checkPageTitle();

  // Check information from accomodation assessment from create a goal page
  await sentencePlanPage.clickCreateGoalButton();
  await sentencePlanPage.clickViewInfoFromAssessmentDropdown();
  await sentencePlanPage.checkThisAreaIsNotMarkedAsCompleteWarningDisplays();
  await sentencePlanPage.checkNoInfoAvailableYetWarningDoesNotDisplay();
  await sentencePlanPage.checkAreaIsLinkedToRoSH();
  await sentencePlanPage.checkAreaIsLinkedToRiskOfReoffending();
  await sentencePlanPage.checkStrenghtsAndProtectiveFactorsAreInPlace();
  await sentencePlanPage.checkMissingInformationDisplays();
  await sentencePlanPage.checkMotivationResponseDisplaysAsMissingInfo();
  console.log('Information from accomodation assessment Yes answers verified');
});