import { expect, Locator, Page } from '@playwright/test';

const mpopDevLink = process.env.MPOP_DEV_LINK;
const hmppsAuthUsername = process.env.DELIUS_USERNAME;
const hmppsAuthPassword = process.env.DELIUS_PASSWORD;

let newTabGlobal: Page | null = null;

export class MpopPages {
    constructor(
        private page: Page,
        private usernameInput: Locator = page.locator('#username'),
        private passwordInput: Locator = page.locator('#password'),
        private signInButton: Locator = page.locator('#submit'),
        private managePeopleOnProbationLink = page.locator('#hmpps-manage-supervisions'),
        private topNavCasesLink = page.locator('body > div.moj-primary-navigation > div > div.moj-primary-navigation__nav > nav > ul > li:nth-child(2) > a'),
        private crnLink = page.locator('#main-content > div > div > table > tbody > tr:nth-child(3) > td:nth-child(1) > a'),
        private riskAndPlanLink = page.locator('#main-content > div.govuk-grid-row > div > nav > ul > li:nth-child(5) > a'),
        private sentencePlanLink = page.locator('#main-content > div.govuk-grid-row.govuk-\!-margin-top-4 > div.govuk-grid-column-one-third > section > div > p:nth-child(2) > a');
    ) { }

    async navigateToMpopLink() {
        await this.page.goto(mpopDevLink);
    }

    async authenticateWithHmppsAuthCredentials() {
        await this.usernameInput.fill(hmppsAuthUsername);
        await this.passwordInput.fill(hmppsAuthPassword);
        await this.signInButton.click();
    }

    async clickManagePeopleOnProbationLink() {
        await this.managePeopleOnProbationLink.click();
    }

    async clickCasesTopNavLink() {
        await this.topNavCasesLink.click();
    }

    async clickCrnLink() {
        await this.crnLink.click();
    }

    async checkPageTitle() {
        // wait for new tab to open
        const newTabPromise = this.page.waitForEvent('popup');
        const newTab = await newTabPromise;
        // wait for Load 
        await newTab.waitForLoadState();
        newTabGlobal = newTab;
        await expect(newTab).toHaveTitle('Overview - Manage people on probation');
    }

    async clickRiskAndPlanLink() {
        await this.riskAndPlanLink.click();
    }

    async clickSentencePlanLink() {
        await this.sentencePlanLink.click();
    }

}