import { test } from '@playwright/test';
import { StubHomePage } from '../page-objects/stub-home-page';
import { StrengthsAndNeedsLandingPage } from "../page-objects/strengths-and-needs-pages";

test('User checks previous versions of SAN', async ({ page }) => {

    const stubHomePage = new StubHomePage(page);
    const strengthsAndNeedsLandingPage = new StrengthsAndNeedsLandingPage(page);

    // Navigate to the stub home page
    await stubHomePage.goto();

    // Check the title of the page is correct
    await stubHomePage.checkPageTitle();

    // Paste PK of existing user
    await stubHomePage.fillInPkPreviousAnswersSan();

    // Select view only level of access
    await stubHomePage.clickPractionerDetailsTab();
    await stubHomePage.selectViewAndEditAccessMode();

    // Select strengths and needs
    await stubHomePage.selectStrenghtsAndNeeds();

    // Click create handover button
    await stubHomePage.clickCreateHandoverButton();

    // Click open button
    await stubHomePage.clickOpenButton();

    // Check the page title is correct
    await strengthsAndNeedsLandingPage.checkPageTitle();

    // Tick confirm and submit
    await strengthsAndNeedsLandingPage.tickConfirmBox();
    await strengthsAndNeedsLandingPage.clickConfirmButtonOnDataPrivacyScreen();

    // Make a change and save so previous assessment is available for tomorrow
    await strengthsAndNeedsLandingPage.clickPersonalRelationshipsLeftNavLink();
    await strengthsAndNeedsLandingPage.changeYesChildrenLiving();
    await strengthsAndNeedsLandingPage.fillInInfoAboutChildrenDynamic();
    await strengthsAndNeedsLandingPage.clickSaveAndContinueButton();
    await strengthsAndNeedsLandingPage.clickSaveAndContinueButton();
    await strengthsAndNeedsLandingPage.clickSaveAndContinueButton();
    await strengthsAndNeedsLandingPage.clickPracticionerAnalysisTab();
    await strengthsAndNeedsLandingPage.clickMarkAsComplete();

    // Click previous version link
    await strengthsAndNeedsLandingPage.clickViewPreviousVersions();

    // Check previous version tab opens and latest previous assessment is there
    await strengthsAndNeedsLandingPage.checkPreviousVersionsHeader();
    await strengthsAndNeedsLandingPage.checkPreviousAssessment();

    // Click on view for previous version
    await strengthsAndNeedsLandingPage.clickLatestPreviousVersion();

    // Check new tab opens and title is correct
    await strengthsAndNeedsLandingPage.checkPageTitlePreviousVersion();

    // Check previous version banner appears
    // await strengthsAndNeedsLandingPage.checkSaveAndContinueButtonHidden();

    console.log('Previous version tab works as expected');
});