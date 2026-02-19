import { test } from '@playwright/test';
import { StubHomePage } from '../page-objects/stub-home-page';
import { SentencePlanPage } from '../page-objects/sentence-plan-pages';
import * as fs from 'fs'; // import file system module

/* Note: this test feature will fail if the test data is wiped. 
It relies on pre-existing PK with a completed SAN assessment. */
test('User views their no flags sections and their info in About page', async ({ page }) => {
  const stubHomePage = new StubHomePage(page);
  const sentencePlanPage = new SentencePlanPage(page);

  // Navigate to the stub home page
  await stubHomePage.goto();

  // Check the title of the page is correct
  await stubHomePage.checkPageTitle();

  // Select sentence plan
  await stubHomePage.selectSentencePlan();

  // Simulate user interaction before clipboard usage
  await stubHomePage.clickCriminogenicNeedsTab();

  // Read json file and convert to string
  const filePath = './data/noFlagData.json';
  const jsonData = fs.readFileSync(filePath, 'utf-8');

  // Copy json data to clipboard
  await page.evaluate(async (text) => {
    await navigator.clipboard.writeText(text);
  }, jsonData);
  console.log('no flag data JSON file copied to clipboard');

  // Paste configuration using UI
  await stubHomePage.clickPasteConfigurationButton();

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

  // Check user info is displaying in the expected order on the about page
  await sentencePlanPage.checkBannerDoesntDisplayForCompleteAssessment();
  await sentencePlanPage.checkInfoSectionNoFlagsListsCorrectOrder();
  console.log('About page complete assessment with no flags - info order verified');
});