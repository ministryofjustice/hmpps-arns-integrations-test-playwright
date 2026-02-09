import { test } from '@playwright/test';
import { StubHomePage } from '../page-objects/stub-home-page';
import { SentencePlanPage } from '../page-objects/sentence-plan-pages';
import { Accessibility } from '../page-objects/accessibility';

/* Note: this test feature will fail if the test data is wiped. 
It relies on pre-existing PK with a completed SAN assessment. */
test('User views about page when they have completed SAN assessment', async ({ page }) => {
  const stubHomePage = new StubHomePage(page);
  const sentencePlanPage = new SentencePlanPage(page);
  const accessibility = new Accessibility(page);

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

  // Access About section
  await sentencePlanPage.clickAboutTopNavLink();
  await sentencePlanPage.checkAboutPageTitle();

  // Check no banner displays
  await sentencePlanPage.checkBannerDoesntDisplayForCompleteAssessment();
  console.log('About page complete assessment - info verified');

  // Check page has no accessiblity violations
  await accessibility.shouldHaveNoAccessibilityViolations();

  // Click show all sections accordion and check there are still no accessibility violations
  await sentencePlanPage.clickShowAllSectionsAccordion();
  await accessibility.shouldHaveNoAccessibilityViolations();

  // Click create a goal from section
  await sentencePlanPage.clickCreateAGoalLinkFromWithinSection();
  await sentencePlanPage.checkCreateAGoalPageTitle();

  // Back out from page and ensure user is back on About page
  await sentencePlanPage.clickBackButtonFromCreateGoalPage();
  await sentencePlanPage.checkAboutPageTitle();
});
