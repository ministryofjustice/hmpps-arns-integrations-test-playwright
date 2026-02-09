import { test } from '@playwright/test';
import { StubHomePage } from '../page-objects/stub-home-page';
import { SentencePlanPage } from '../page-objects/sentence-plan-pages';
import { Accessibility } from '../page-objects/accessibility';

test('user updates their goal agreement', async ({ page }) => {
  const stubHomePage = new StubHomePage(page);
  const sentencePlanPage = new SentencePlanPage(page);
  const accessibility = new Accessibility(page);

  // Navigate to the stub home page
  await stubHomePage.goto();

  // Check the title of the page is correct
  await stubHomePage.checkPageTitle();

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

  // Check page has no accessiblity violations
  await accessibility.shouldHaveNoAccessibilityViolations();

  // Create an accomodation goal from top nav
  await sentencePlanPage.clickCreateGoalButton();

  // Check page has no accessiblity violations
  await accessibility.shouldHaveNoAccessibilityViolations();

  await sentencePlanPage.fillInGoalTitle();
  await sentencePlanPage.tickGoalNotRelatedToAreaOfNeed();
  await sentencePlanPage.tickCanStartWorkingOnGoalNow();
  await sentencePlanPage.tickIn6Months();
  await sentencePlanPage.clickAddSTeps();

  await sentencePlanPage.checkAddSTepsToGoalPageTitle();

  // Check page has no accessiblity violations
  await accessibility.shouldHaveNoAccessibilityViolations();

  await sentencePlanPage.selectProbationPracticioner();
  await sentencePlanPage.fillInStepTitle();
  await sentencePlanPage.clickSaveAndContinueButton();
  console.log('Goal created');

  // Agree plan - cannot answer
  await sentencePlanPage.clickAgreePlanButton();
  await sentencePlanPage.checkDoTheyAgreeToThisPLanPageTitle();

  // Check page has no accessiblity violations
  await accessibility.shouldHaveNoAccessibilityViolations();

  await sentencePlanPage.tickCouldNotAnswer();
  await sentencePlanPage.fillInCouldNotAnswerDetails();
  await sentencePlanPage.fillInNotesAboutAgreeingPlan();
  await sentencePlanPage.clickSaveButtonOnAgreePlanPage();
  await sentencePlanPage.checkUserIsBAckOnSentencePlanLandingPage();

  // Check page has no accessiblity violations
  await accessibility.shouldHaveNoAccessibilityViolations();
  console.log('Plan agreed - could not answer');

  // Update agreement
  await sentencePlanPage.clickUpdateAgreementLink();
  await sentencePlanPage.checkUpdateAgreePlanPageTitle();

  // Back out
  await sentencePlanPage.clickBackLinkOnUpdateAgreePlanPage();
  await sentencePlanPage.checkUserIsBAckOnSentencePlanLandingPage();

  // Update agreement again
  await sentencePlanPage.clickUpdateAgreementLink();
  await sentencePlanPage.tickNoIDoNotAgree();
  await sentencePlanPage.fillInIDoNotAgreeDetails();
  await sentencePlanPage.clickSaveOnUpdateAgreePlanPage();
  await sentencePlanPage.checkUserIsBAckOnSentencePlanLandingPage();
  console.log('Agreement update saved');

  // Check plan history is updated correctly
  await sentencePlanPage.clickPlanHistoryTopNavLink();
  await sentencePlanPage.checkPlanHistoryPageTitle();
  await sentencePlanPage.checkAgreementDataCorrectlyDisplaysInPlanHistory();
  console.log('Plan history data following agreement update verified');
});
