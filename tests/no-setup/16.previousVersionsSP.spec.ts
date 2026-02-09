import { expect, Page, test } from '@playwright/test';
import { StubHomePage } from '../../page-objects/stub-home-page';
import { SentencePlanPage } from '../../page-objects/sentence-plan-pages';
import { SentencePlanV2Page } from '../../page-objects/sentence-plan-pages.v2';

let spTab: Page;

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
    spTab = await sentencePlanPage.checkPageTitleDataPrivacyScreen();

    await sentencePlanPage.tickConfirmBox();
    await sentencePlanPage.clickConfirmButtonOnDataPrivacyScreen();
});

test('should display previous version of sentence plan', async ({ context }) => {
    const sentencePlan = new SentencePlanV2Page(spTab);
    await expect(spTab).toHaveTitle('Plan - Sentence plan');

    await sentencePlan.viewPreviousVersions.click();

    await expect(sentencePlan.previousVersionsHeading).toBeVisible();
    await expect(spTab.getByText('Assessment Updated').first()).toBeVisible();

    const previousVersion = await sentencePlan.viewPreviousVersion(context);
    
    await expect(previousVersion.getByText('This version is from')).toBeVisible();
});

/* TODO: API Test for updating / checking previous versions */
