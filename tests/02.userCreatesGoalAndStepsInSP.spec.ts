import { test } from '@playwright/test';
import { StubHomePage } from '../page-objects/stub-home-page';
import { SentencePlanPage } from '../page-objects/sentence-plan-pages';
import { Accessibility } from '../page-objects/accessibility';

test('user creates and updates a goal, adds, updates and removes steps and agrees plan in sentence plan', async ({
  page,
}) => {
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

  // Check page has no accessiblity violations
  await accessibility.shouldHaveNoAccessibilityViolations();

  // Submit empty form
  await sentencePlanPage.clickConfirmButtonOnDataPrivacyScreen();

  // Check validation errors display
  await sentencePlanPage.validationErrorDisplaysOnDataPrivacyScreen();

  // Check page has no accessiblity violations
  await accessibility.shouldHaveNoAccessibilityViolations();

  // Tick confirm and submit
  await sentencePlanPage.tickConfirmBox();
  await sentencePlanPage.clickConfirmButtonOnDataPrivacyScreen();

  // Check page title
  await sentencePlanPage.checkPageTitleSentencePlanAfterDataPrivacyScreen();

  // Create an accomodation goal from top nav
  await sentencePlanPage.clickCreateGoalButton();

  // Check page has no accessiblity violations
  await accessibility.shouldHaveNoAccessibilityViolations();

  await sentencePlanPage.fillInGoalTitle();
  await sentencePlanPage.tickGoalNotRelatedToAreaOfNeed();
  await sentencePlanPage.tickCanStartWorkingOnGoalNow();
  await sentencePlanPage.tickIn3Months();
  await sentencePlanPage.clickAddSTeps();

  await sentencePlanPage.checkAddSTepsToGoalPageTitle();

  // Check page has no accessiblity violations
  await accessibility.shouldHaveNoAccessibilityViolations();

  await sentencePlanPage.selectProbationPracticioner();
  await sentencePlanPage.fillInStepTitle();
  await sentencePlanPage.clickSaveAndContinueButton();
  console.log('Goal created');

  // Change goal
  await sentencePlanPage.clickChangeGoalLink();
  await sentencePlanPage.checkChangeGoalPageTitle();

  // Check page has no accessiblity violations
  await accessibility.shouldHaveNoAccessibilityViolations();

  await sentencePlanPage.fillInNewGoalTitle();
  await sentencePlanPage.changeToFutureGoal();
  await sentencePlanPage.clickSaveGoalButton();
  await sentencePlanPage.clickFutureGoalTab();
  await sentencePlanPage.checkGoalTitleChangeIsStoredCorrectly();
  console.log('Goal updated');

  // Add step
  await sentencePlanPage.clickAddOrChangeStepsLink();
  await sentencePlanPage.checkAddStepsToGoalPageTitle();

  // Check page has no accessiblity violations
  await accessibility.shouldHaveNoAccessibilityViolations();

  await sentencePlanPage.clickAddAnotherStepButton();
  await sentencePlanPage.selectProgrammeStaff();
  await sentencePlanPage.fillInSecondStepTitle();
  await sentencePlanPage.clickSaveAndContinueButton();
  await sentencePlanPage.checkNewStepIsStoredCorrectly();
  console.log('Step added');

  // Remove step
  await sentencePlanPage.clickAddOrChangeStepsLink();
  await sentencePlanPage.clickRemoveStepButton();

  // Check page has no accessiblity violations
  await accessibility.shouldHaveNoAccessibilityViolations();

  await sentencePlanPage.clickSaveAndContinueButton();
  await sentencePlanPage.checkNewStepIsRemoved();
  await sentencePlanPage.checkExistingStepHasNotBeenDeleted();
  console.log('Step removed');

  // Change goal back to work on now
  await sentencePlanPage.clickChangeGoalLink();

  // Check page has no accessiblity violations
  await accessibility.shouldHaveNoAccessibilityViolations();

  await sentencePlanPage.tickCanStartWorkingOnGoalNow();
  await sentencePlanPage.tickIn3Months();
  await sentencePlanPage.clickSaveGoalButton();

  // Agree plan
  await sentencePlanPage.clickAgreePlanButton();
  await sentencePlanPage.checkDoTheyAgreeToThisPLanPageTitle();

  // Check page has no accessiblity violations
  await accessibility.shouldHaveNoAccessibilityViolations();

  await sentencePlanPage.tickYesIAgreeToThisPlan();
  await sentencePlanPage.fillInNotesAboutAgreeingPlan();
  await sentencePlanPage.clickSaveButtonOnAgreePlanPage();
  await sentencePlanPage.checkUserIsBAckOnSentencePlanLandingPage();
  await sentencePlanPage.clickViewStepsElement();

  // Check page has no accessiblity violations
  await accessibility.shouldHaveNoAccessibilityViolations();

  await sentencePlanPage.checkExpectedStepIsListedWhenViewStepsElementIsToggled();
  await sentencePlanPage.checkRemovedStepIsNotShowingWhenViewStepsElementIsToggled();

  console.log('Plan agreed');

  // Create a goal without steps
  await sentencePlanPage.clickCreateGoalButton();
  await sentencePlanPage.fillInGoalTitle();
  await sentencePlanPage.tickGoalNotRelatedToAreaOfNeed();
  await sentencePlanPage.tickCanStartWorkingOnGoalNow();
  await sentencePlanPage.tickIn3Months();
  await sentencePlanPage.clickSaveWithoutStepsButton();

  await sentencePlanPage.checkAddStepsValidationErrorDisplays();
  await sentencePlanPage.checkUserIsNotifiedGoalHasBeenAdded();
  await sentencePlanPage.checkNumberOfGoalsToWorkOnNowIsCorrect();

  // Check page has no accessiblity violations
  await accessibility.shouldHaveNoAccessibilityViolations();

  console.log('Goals without steps created');

  // Create future goal
  await sentencePlanPage.clickCreateGoalButton();
  await sentencePlanPage.fillInGoalTitle();
  await sentencePlanPage.tickGoalNotRelatedToAreaOfNeed();
  await sentencePlanPage.tickFutureGoal();
  await sentencePlanPage.clickSaveWithoutStepsButton();

  await sentencePlanPage.checkAddStepsValidationErrorDisplays();
  await sentencePlanPage.checkUserIsNotifiedGoalHasBeenAdded();
  await sentencePlanPage.checkNumberOfFutureGoalsIsCorrect();
  console.log('Future goal created');
});
