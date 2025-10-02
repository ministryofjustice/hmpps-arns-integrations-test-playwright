/*import {test} from '@playwright/test';
import {StubHomePage} from '../page-objects/stub-home-page';
import {StrengthsAndNeedsLandingPage} from '../page-objects/strengths-and-needs-pages';


test('user creates a strengths and needs assessments via the prison location journey', async ({page}) => {


    const stubHomePage = new StubHomePage(page);
    const strengthsAndNeedsLandingPage = new StrengthsAndNeedsLandingPage(page);


    // Navigate to the stub home page
    await stubHomePage.goto();


    // Check the title of the page is correct
    await stubHomePage.checkPageTitle();


    // Click on practitioner-details tab
    await stubHomePage.clickPractionerDetailsTab();


    // Verify the default location is community
    await stubHomePage.getDefaultOptionInLocationDropdownMenu();


    // Click on Prison Location tab
    await stubHomePage.selectPrisonOptionInTheLocationDropdownMenuOfPractionerTab();


    // Click create handover button
    await stubHomePage.clickCreateHandoverButton();


    // Click open button
    await stubHomePage.clickOpenButton();


    // Check the data privacy page title is correct
    await strengthsAndNeedsLandingPage.checkPageTitle();


    // Tick confirm and submit
    await strengthsAndNeedsLandingPage.tickConfirmBox();
    await strengthsAndNeedsLandingPage.clickConfirmButtonOnDataPrivacyScreen();


    // Check page title
    await strengthsAndNeedsLandingPage.checkPageTitleStrengthsAndNeedsAfterDataPrivacyScreenNew();
});*/
