import { test } from '@playwright/test';
import { StubHomePage } from '../page-objects/stub-home-page';
import { SentencePlanPage } from '../page-objects/sentence-plan-pages';
import { StrengthsAndNeedsLandingPage } from "../page-objects/strengths-and-needs-pages";

test('User tries editing capabilities on view only for sentence plan', async ({ page }) => {

    const stubHomePage = new StubHomePage(page);
    const sentencePlanPage = new SentencePlanPage(page);

    // Navigate to the stub home page
    await stubHomePage.goto();

    // Check the title of the page is correct
    await stubHomePage.checkPageTitle();

    // Paste PK of existing user
    await stubHomePage.fillInPkNumberOfCompletedAssessment();

    // Select view only level of access
    await stubHomePage.clickPractionerDetailsTab();
    await stubHomePage.selectViewOnlyAccessMode();

    // Select sentence plan
    await stubHomePage.selectSentencePlan();

    // Click create handover button
    await stubHomePage.clickCreateHandoverButton();

    // Click open button
    await stubHomePage.clickOpenButton();

    // Check the page title is correct
    await sentencePlanPage.checkPageTitle();

    // Interacts with what is possible for view only
    await sentencePlanPage.checkUpdateButtonHidden();

    // Future Goals interaction
    await sentencePlanPage.clickFutureGoalTab();

    // Remove goals interactions
    await sentencePlanPage.clickRemovedGoalsButton();
    await sentencePlanPage.checkRemovedGoalsTabIsThere();
    await sentencePlanPage.clickGoalsToWorkOnTab();

    // View Steps interactions
    await sentencePlanPage.checkViewStepsIsNotExpanded();
    await sentencePlanPage.clickViewStepsElement();
    await sentencePlanPage.checkViewStepsExpandsWhenClicked();
    await sentencePlanPage.clickViewStepsElement();
    await sentencePlanPage.checkViewStepsIsNotExpanded();

    // Check plan history via both ways
    await sentencePlanPage.clickEmbeddedViewPlanHistoryLink();
    await sentencePlanPage.checkPlanHistoryTabOpens();
    await sentencePlanPage.clickAboutTopNavLink();
    await sentencePlanPage.clickPlanHistoryTopNavLink();
    await sentencePlanPage.checkPlanHistoryTabOpens();

    // About tab
    await sentencePlanPage.clickAboutTopNavLink();
    await sentencePlanPage.checkAboutTabOpens();

    console.log('Sentence plan view only works as expected');
});

// test('User tries editing capabilities on view only for strengths and needs assessment', async ({ page }) => {

//     const stubHomePage = new StubHomePage(page);
//     const strengthsAndNeedsLandingPage = new StrengthsAndNeedsLandingPage(page);

//     // Navigate to the stub home page
//     await stubHomePage.goto();

//     // Check the title of the page is correct
//     await stubHomePage.checkPageTitle();

//     // Paste PK of existing user
//     await stubHomePage.fillInPkViewOnlySan();

//     // Select view only level of access
//     await stubHomePage.clickPractionerDetailsTab();
//     await stubHomePage.selectViewOnlyAccessMode();

//     // Select strengths and needs
//     await stubHomePage.selectStrenghtsAndNeeds();

//     // Click create handover button
//     await stubHomePage.clickCreateHandoverButton();

//     // Click open button
//     await stubHomePage.clickOpenButton();

//     // Check the page title is correct
//     await strengthsAndNeedsLandingPage.checkViewOnlyPageTitle();

//     // Check previous version banner appears
//     await strengthsAndNeedsLandingPage.checkViewOnlyPreviousVersionBanner();

//     // Accommodation tab has visible question but no save/continue button
//     await strengthsAndNeedsLandingPage.checkSaveAndContinueButtonHidden();
//     await strengthsAndNeedsLandingPage.checkAccommodationTypeQuestion();
//     await strengthsAndNeedsLandingPage.checkSectionIsComplete();
//     await strengthsAndNeedsLandingPage.clickPracitionerAnalysisButton();

//     // Employments and education tabs
//     await strengthsAndNeedsLandingPage.clickEmploymentAndEducationLeftNavLink();
//     await strengthsAndNeedsLandingPage.checkSectionIsIncomplete();
//     await strengthsAndNeedsLandingPage.checkSaveAndContinueButtonHidden();

//     // Finance Tab
//     await strengthsAndNeedsLandingPage.clickFinancesLeftNavLink();
//     await strengthsAndNeedsLandingPage.checkSectionIsComplete();
//     await strengthsAndNeedsLandingPage.checkSaveAndContinueButtonHidden();
//     // await strengthsAndNeedsLandingPage.clickPracticionerAnalysisTab();

//     // Drug use tab
//     await strengthsAndNeedsLandingPage.clickDrugUseLeftNavLink();
//     await strengthsAndNeedsLandingPage.checkSectionIsIncomplete();
//     await strengthsAndNeedsLandingPage.checkSaveAndContinueButtonHidden();

//     // Alcohol use tab
//     await strengthsAndNeedsLandingPage.clickAlcoholUseLeftNavLink();
//     await strengthsAndNeedsLandingPage.checkSectionIsIncomplete();
//     await strengthsAndNeedsLandingPage.checkSaveAndContinueButtonHidden();

//     // Health and wellbeing tab
//     await strengthsAndNeedsLandingPage.clickHealthAndWellbeingLeftNavLink();
//     await strengthsAndNeedsLandingPage.checkSectionIsIncomplete();
//     await strengthsAndNeedsLandingPage.checkSaveAndContinueButtonHidden();

//     // Personal relationships and community tab
//     await strengthsAndNeedsLandingPage.clickPersonalRelationshipsLeftNavLink();
//     await strengthsAndNeedsLandingPage.checkSectionIsIncomplete();
//     await strengthsAndNeedsLandingPage.checkSaveAndContinueButtonHidden();

//     // Thinking, behaviours and attitudes tab
//     await strengthsAndNeedsLandingPage.clickThinkingAndAttitudesLeftNavLink();
//     await strengthsAndNeedsLandingPage.checkSectionIsIncomplete();
//     await strengthsAndNeedsLandingPage.checkSaveAndContinueButtonHidden();

//     // Offence analysis tab
//     await strengthsAndNeedsLandingPage.clickOffenceAnalysisLeftNavLink();
//     await strengthsAndNeedsLandingPage.checkSectionIsIncomplete();
//     await strengthsAndNeedsLandingPage.checkSaveAndContinueButtonHidden();

//     console.log('View only SAN works as expected');
// });