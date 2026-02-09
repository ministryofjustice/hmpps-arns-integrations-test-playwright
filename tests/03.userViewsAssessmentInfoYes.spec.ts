import { test } from '@playwright/test';
import { StubHomePage } from '../page-objects/stub-home-page';
import { SentencePlanPage } from '../page-objects/sentence-plan-pages';
import { Accessibility } from '../page-objects/accessibility';

test('User views assessment info when creating a goal - Yes answers', async ({ page }) => {
  const stubHomePage = new StubHomePage(page);
  const sentencePlanPage = new SentencePlanPage(page);
  const accessibility = new Accessibility(page);

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

  // Check the data privacy page title is correct
  await sentencePlanPage.checkPageTitleDataPrivacyScreen();

  // Tick confirm and submit
  await sentencePlanPage.tickConfirmBox();
  await sentencePlanPage.clickConfirmButtonOnDataPrivacyScreen();

  // Check page title
  await sentencePlanPage.checkPageTitleSentencePlanAfterDataPrivacyScreen();

  // Check information from accomodation assessment from create a goal page
  await sentencePlanPage.clickCreateGoalButton();

  // Check page has no accessiblity violations
  await accessibility.shouldHaveNoAccessibilityViolations();

  await sentencePlanPage.clickViewInfoFromAssessmentDropdown();

  // Check page has no accessiblity violations
  await accessibility.shouldHaveNoAccessibilityViolations();

  await sentencePlanPage.checkThisAreaIsNotMarkedAsCompleteWarningDisplays();
  await sentencePlanPage.checkNoInfoAvailableYetWarningDoesNotDisplay();
  await sentencePlanPage.checkAreaIsLinkedToRoSH();
  await sentencePlanPage.checkAreaIsLinkedToRiskOfReoffending();
  await sentencePlanPage.checkStrenghtsAndProtectiveFactorsAreInPlace();
  await sentencePlanPage.checkMissingInformationDisplays();
  await sentencePlanPage.checkMotivationResponseDisplaysAsMissingInfo();
  console.log('Information from accomodation assessment Yes answers verified');
});
