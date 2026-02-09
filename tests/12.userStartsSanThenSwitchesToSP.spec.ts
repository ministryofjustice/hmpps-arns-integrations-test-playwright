/*import { test } from '@playwright/test';
import { StubHomePage } from '../page-objects/stub-home-page';
import { SentencePlanPage } from '../page-objects/sentence-plan-pages';
import { StrengthsAndNeedsLandingPage } from '../page-objects/strengths-and-needs-pages';
import { SentencePlanfromSanPage } from '../page-objects/sentence-plan-page-from-san-page';
import * as fs from 'fs'; // import file system module

/* Note: this test feature will fail if the test data is wiped. 
It relies on pre-existing PK with a completed SAN assessment. */
/*test('User navigates to their About page from an incomplete San assessment', async ({ page }) => {

  const stubHomePage = new StubHomePage(page);
  const sentencePlanPage = new SentencePlanPage(page);
  const strengthsAndNeedsLandingPage = new StrengthsAndNeedsLandingPage(page);
  const sentencePlanfromSanPage = new SentencePlanfromSanPage(page);

  // Navigate to the stub home page
  await stubHomePage.goto();

  // Check the title of the page is correct
  await stubHomePage.checkPageTitle();

  // Select sentence plan
  await stubHomePage.selectStrenghtsAndNeeds();

  // Simulate user interaction before clipboard usage
  await stubHomePage.clickCriminogenicNeedsTab();

  // Read json file and convert to string
  // This json contains an incomplete SAN assessment PK
  const filePath = './data/incompleteSanData.json'
  const jsonData = fs.readFileSync(filePath, 'utf-8');

  // Copy json data to clipboard
  await page.evaluate(async (text) => { await navigator.clipboard.writeText(text); }, jsonData);
  console.log('incomplete SAN data JSON file copied to clipboard')

  // Paste configuration using UI
  await stubHomePage.clickPasteConfigurationButton();

  // Click create handover button
  await stubHomePage.clickCreateHandoverButton();

  // Click open button
  await stubHomePage.clickOpenButton();

  // Check the data privacy page title is correct
  await strengthsAndNeedsLandingPage.checkPageTitleDataPrivacyScreen();

  // Tick confirm and submit
  await strengthsAndNeedsLandingPage.tickConfirmBox();
  await strengthsAndNeedsLandingPage.clickConfirmButtonOnDataPrivacyScreen();

  // Check page title
  await strengthsAndNeedsLandingPage.checkPageTitleStrengthsAndNeedsAfterDataPrivacyScreenExisting();

  // Simulate navigating to SP without going via OASYS
  await strengthsAndNeedsLandingPage.navigateToSPLink();

  // Check user lands on the data privacy screen
  await sentencePlanfromSanPage.checkPageTitle();

  // Tick confirm and submit
  await sentencePlanfromSanPage.tickConfirmBox();
  await sentencePlanfromSanPage.clickConfirmButtonOnDataPrivacyScreen();

  // Access About section
  await sentencePlanfromSanPage.clickAboutPageAfterNavigatingToSPWithoutOasysStep();

  // Check user info is displaying as expected on the about page
  await sentencePlanfromSanPage.checkAboutPageDisplaysCorrectInfoForIncompleteSan();
  console.log('About page incomplete assessment without OASYS step verified');
});
*/
