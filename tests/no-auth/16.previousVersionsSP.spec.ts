import { expect, Page, test } from '@playwright/test';
import { StubHomePage } from '../../page-objects/stub-home-page';
import { SentencePlanPage } from '../../page-objects/sentence-plan-pages';
import { SentencePlanV2Page } from '../../page-objects/sentence-plan-pages.v2';

let newTab: Page;
test.beforeEach(async ({ page }) => {
    const stubHomePage = new StubHomePage(page);

    await stubHomePage.goto();
    await stubHomePage.checkPageTitle();
    await stubHomePage.fillInPkPreviousAnswersSan();
    await stubHomePage.clickPractionerDetailsTab();
    await stubHomePage.selectViewAndEditAccessMode();
    await stubHomePage.selectSentencePlan();
    await stubHomePage.clickCreateHandoverButton();
    await stubHomePage.clickOpenButton();

    const sentencePlanPage = new SentencePlanPage(page);
    newTab = await sentencePlanPage.checkPageTitleDataPrivacyScreen();

    await sentencePlanPage.tickConfirmBox();
    await sentencePlanPage.clickConfirmButtonOnDataPrivacyScreen();
});

test.afterEach(async () => {
    // Make a change and save so previous sentence plan is available for tomorrow
    const spPage = new SentencePlanV2Page(newTab);
    const currentUrl = newTab.url().substring(0, newTab.url().indexOf("/", 10));
    await newTab.goto(`${currentUrl}/plan`);
    await spPage.update.click();
    await spPage.changeGoalDetails.click();
    await spPage.goalInput.fill(`new goal ${new Date().getMilliseconds()}`);
    await spPage.saveGoal.click();
    await spPage.saveGoalAndSteps.click();
    await expect(newTab).toHaveTitle('Plan - Sentence plan');
});

test('should display previous versions of sentence plan', async ({ context }) => {
    const sentencePlan = new SentencePlanV2Page(newTab);
    await expect(newTab).toHaveTitle('Plan - Sentence plan');

    await sentencePlan.viewPreviousVersions.click();
    await expect(sentencePlan.previousVersionsHeading).toBeVisible();

    await expect(newTab.getByText('Assessment Updated').first()).toBeVisible();

    const previousPage = context.waitForEvent('page');
    await sentencePlan.viewPlan.click();
    const previousSentencePlan = await previousPage;
    
    await expect(previousSentencePlan.getByText('This version is from')).toBeVisible();
});
