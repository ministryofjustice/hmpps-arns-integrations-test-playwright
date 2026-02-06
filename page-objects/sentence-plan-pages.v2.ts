import { expect, Locator, Page } from '@playwright/test';

export class SentencePlanV2Page {
    readonly page: Page;
    readonly viewPreviousVersions: Locator;
    readonly previousVersionsHeading: Locator;
    readonly update: Locator;
    readonly changeGoalDetails: Locator;
    readonly goalInput: Locator;
    readonly saveGoal: Locator;
    readonly saveGoalAndSteps: Locator;
    readonly viewPlan: Locator;

    constructor(
        page: Page,
    ) {
        this.page = page;
        this.viewPreviousVersions = this.page.getByRole('link', { name: 'View previous versions' });
        this.previousVersionsHeading = this.page.getByRole('heading', { name: 'Previous versions' });
        this.update = this.page.getByRole('link', { name: 'Update' });
        this.changeGoalDetails = this.page.getByRole('link', { name: 'Change goal details' });
        this.goalInput = this.page.getByRole('textbox', { name: 'What goal should' });
        this.saveGoal = this.page.getByRole('button', { name: 'Save goal' });
        this.saveGoalAndSteps = this.page.getByRole('button', { name: 'Save goal and steps' });
        this.viewPlan = this.page.getByRole('link', { name: 'View   plan' }).first();
     }
}