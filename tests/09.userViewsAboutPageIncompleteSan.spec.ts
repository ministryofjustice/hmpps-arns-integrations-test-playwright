import { test } from '@playwright/test';
import { StubHomePage } from '../page-objects/stub-home-page';
import { SentencePlanPage } from '../page-objects/sentence-plan-pages';

test('User views about page when they have not completed SAN assessment', async ({ page }) => {
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
  await stubHomePage.selectNullAccOtherWeightedScore();
  await stubHomePage.selectNullAccThreshold();

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

  // Check banner displays
  await sentencePlanPage.checkBannerDisplaysForIncompleteAssessment();

  // Check sections are listed in the missing information area
  await sentencePlanPage.checkSectionsAreListedAsIncompleteInformation();

  // Check no sections are listed in high and low-scoring area
  await sentencePlanPage.checkThereAreNoHighOrLowScoringAreas();

  // Check no information available yet for accomodation is displayed
  await sentencePlanPage.checkNoInfoAvailableDisplays();
  console.log('About page incomplete assessment - info verified');
});
