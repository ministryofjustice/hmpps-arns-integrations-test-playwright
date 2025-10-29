import { expect, Locator, Page } from '@playwright/test';
import { PLAN_CREATED_DATA } from './pages-common';

const { chromium } = require('playwright');
const getTodayDateFormatted = (): string => {
    const today = new Date();
    return today.toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

let newTabGlobal: Page | null = null;

export class SentencePlanPage {
    constructor(
        private page: Page,
    ) { }

    async checkPageTitle() {
        const newTabPromise = this.page.waitForEvent('popup');
        const newTab = await newTabPromise;
        //wait for Load 
        await newTab.waitForLoadState();
        newTabGlobal = newTab;
        await expect(newTab).toHaveTitle('Plan - Sentence plan');
    }

    async checkPageTitleDataPrivacyScreen() {
        const newTabPromise = this.page.waitForEvent('popup');
        const newTab = await newTabPromise;
        //wait for Load 
        await newTab.waitForLoadState();
        newTabGlobal = newTab;
        await expect(newTab).toHaveTitle('Remember to close any other applications before starting an appointment - Sentence plan');
    }

    async checkPageTitleDataPrivacyScreenAfterNavigatingToSP() {
        await expect(newTabGlobal).toHaveTitle('Remember to close any other applications before starting an appointment - Sentence plan');
    }

    async checkPageTitleSentencePlanAfterDataPrivacyScreen() {
        await expect(newTabGlobal).toHaveTitle('Plan - Sentence plan');
    }

    async clickConfirmButtonOnDataPrivacyScreen() {
        await newTabGlobal!.locator('#confirm-privacy-form > div.govuk-button-group > button').click();
    }

    async clickBackButtonOnDataPrivacyScreen() {
        await newTabGlobal!.locator('#main-content > a').click();
    }

    async validationErrorDisplaysOnDataPrivacyScreen() {
        await expect(newTabGlobal!.locator('#main-content > div:nth-child(5) > div > div')).toBeVisible();
        await expect(newTabGlobal!.locator('#confirm-privacy-checkbox-error')).toBeVisible();
    }

    async tickConfirmBox() {
        await newTabGlobal!.locator('#confirm-privacy-checkbox').check();
    }

    async validationErrorDisplays() {
        await expect(newTabGlobal!.getByRole('alert')).toBeVisible();
    }

    async clickViewInfoFromAssessmentDropdown() {
        await newTabGlobal!.locator('summary').click();
    }

    async checkThisAreaIsNotMarkedAsCompleteWarningDisplays() {
        await expect(newTabGlobal!.getByText('Warning This area has not')).toBeVisible();
    }

    async checkThisAreaIsNotMarkedAsCompleteWarningDoesNotDisplay() {
        await expect(newTabGlobal!.getByText('Warning This area has not')).toHaveCount(0);
    }

    async checkNoInfoAvailableYetWarningDisplays() {
        await expect(newTabGlobal!.getByText('Warning No information is')).toBeVisible();
    }

    async checkNoInfoAvailableYetWarningDoesNotDisplay() {
        await expect(newTabGlobal!.getByText('Warning No information is')).toHaveCount(0);
    }

    async checkAreaIsLinkedToRoSH() {
        await expect(newTabGlobal!.getByText('This area is linked to RoSH (risk of serious harm)')).toBeVisible();
    }

    async checkAreaIsLinkedToRiskOfReoffending() {
        await expect(newTabGlobal!.getByText('This area is linked to risk of reoffending')).toBeVisible();
    }

    async checkStrenghtsAndProtectiveFactorsAreInPlace() {
        await expect(newTabGlobal!.getByText('There are strengths or protective factors related to this area')).toBeVisible();
    }

    async checkAreaIsNotLinkedToRoSH() {
        await expect(newTabGlobal!.getByText('This area is not linked to RoSH (risk of serious harm)')).toBeVisible();
    }

    async checkAreaIsNotLinkedToRiskOfReoffending() {
        await expect(newTabGlobal!.getByText('This area is not linked to risk of reoffending')).toBeVisible();
    }

    async checkStrenghtsAndProtectiveFactorsAreNotInPlace() {
        await expect(newTabGlobal!.getByText('There are no strengths or protective factors related to this area')).toBeVisible();
    }

    async checkMotivationResponseDisplaysAsMissingInfo() {
        await expect(newTabGlobal!.locator('#main-content > div > div.govuk-grid-column-two-thirds > details > div > ul > li'))
            .toContainText('motivation to make changes')
    }

    async checkMissingInformationDisplays() {
        await expect(newTabGlobal!.getByText('Missing information')).toBeVisible();
    }

    async clickCreateGoalButton() {
        await newTabGlobal!.getByRole('button', { name: 'Create goal' }).click();
    }

    async clickAgreePlanButton() {
        await newTabGlobal!.getByRole('button', { name: 'Agree plan' }).click();
    }

    async fillInGoalTitle() {
        await newTabGlobal!.locator('#goal-input-autocomplete')
            .fill('Test Accomodation goal');
    }

    async tickGoalNotRelatedToAreaOfNeed() {
        await newTabGlobal!.locator('#related-area-of-need-radio-2').check();
    }

    async tickCanStartWorkingOnGoalNow() {
        await newTabGlobal!.locator('#start-working-goal-radio').check();
    }

    async tickIn3Months() {
        await newTabGlobal!.locator('#date-selection-radio').check();
    }

    async tickIn6Months() {
        await newTabGlobal!.locator('#date-selection-radio-2').check();
    }

    async tickFutureGoal() {
        await newTabGlobal!.locator('#start-working-goal-radio-2').check();
    }

    async clickAddSTeps() {
        await newTabGlobal!.getByRole('button', { name: 'Add steps' }).click();
    }

    async checkAddSTepsToGoalPageTitle() {
        await expect(newTabGlobal!).toHaveTitle('Add or change steps - Sentence plan');
    }

    async selectProbationPracticioner() {
        await newTabGlobal!.locator('#step-actor-1').selectOption('Probation practitioner');
    }

    async selectProgrammeStaff() {
        await newTabGlobal!.locator('#step-actor-2').selectOption('Programme staff');
    }

    async fillInStepTitle() {
        await newTabGlobal!.locator('#step-description-1')
            .fill('Accomodation step title')
    }

    async fillInSecondStepTitle() {
        await newTabGlobal!.locator('#step-description-2')
            .fill('Second step title');
    }

    async clickRemoveStepButton() {
        await newTabGlobal!.getByRole('button', { name: 'Remove' }).nth(1).click();
    }

    async clickSaveAndContinueButton() {
        await newTabGlobal!.getByRole('button', { name: 'Save and continue' }).click();
    }

    async clickChangeGoalLink() {
        await newTabGlobal!.getByRole('link', { name: 'Change goal' }).click();
    }

    async clickAddOrChangeStepsLink() {
        await newTabGlobal!.getByRole('link', { name: 'Add or change steps' }).click();
    }

    async checkChangeGoalPageTitle() {
        await expect(newTabGlobal!).toHaveTitle('Change goal - Sentence plan');
    }

    async checkUpdateStepsPageTitle() {
        await expect(newTabGlobal!).toHaveTitle('Update goal and steps - Sentence plan');
    }

    async checkAddStepsToGoalPageTitle() {
        await expect(newTabGlobal!).toHaveTitle('Add or change steps - Sentence plan');
    }

    async fillInNewGoalTitle() {
        await newTabGlobal!.locator('#goal-input-autocomplete')
            .fill('Test New Accomodation goal');
    }

    async changeToFutureGoal() {
        await newTabGlobal!.locator('#start-working-goal-radio-2').check();
    }

    async clickSaveGoalButton() {
        await newTabGlobal!.locator('#change-goal-form > div.govuk-button-group > button').click();
    }

    async clickFutureGoalTab() {
        await newTabGlobal!.locator('#main-content > div > div > nav > ul > li:nth-child(2) > a').click();
    }

    async checkGoalTitleChangeIsStoredCorrectly() {
        await expect(newTabGlobal!.getByRole('heading', { name: 'Test New Accomodation goal' })).toBeVisible();
    }

    async clickViewStepsElement() {
        await newTabGlobal!.locator('summary').click();
    }

    async checkViewStepsExpandsWhenClicked() {
        await expect(newTabGlobal!.getByRole('columnheader', { name: 'Who will do this' })).toBeVisible();
    }

    async checkViewStepsIsNotExpanded() {
        await expect(newTabGlobal!.getByRole('columnheader', { name: 'Who will do this' })).toBeHidden();
    }

    async checkExpectedStepIsListedWhenViewStepsElementIsToggled() {
        await expect(newTabGlobal!.locator('#goal-summary-card-1 > div > div.govuk-summary-card__content > details > div > table > tbody > tr:nth-child(1) > td:nth-child(2)'))
            .toHaveText('Accomodation step title');
    }

    async checkRemovedStepIsNotShowingWhenViewStepsElementIsToggled() {
        await expect(newTabGlobal!.locator('#goal-summary-card-1 > div > div.govuk-summary-card__content > details > div > table > tbody > tr:nth-child(2) > td:nth-child(2)'))
            .toHaveCount(0);
    }

    async checkNewStepIsStoredCorrectly() {
        await expect(newTabGlobal!.locator('#goal-summary-card-1 > div > div.govuk-summary-card__content > div.govuk-details__text_inactive > table > tbody > tr:nth-child(2) > td:nth-child(2)'))
            .toHaveText('Second step title');
    }

    async checkNewStepIsRemoved() {
        await expect(newTabGlobal!.locator('#goal-summary-card-1 > div > div.govuk-summary-card__content > details > div > table > tbody > tr:nth-child(2) > td:nth-child(2)'))
            .toHaveCount(0);
    }

    async checkExistingStepHasNotBeenDeleted() {
        await expect(newTabGlobal!.locator('#goal-summary-card-1 > div > div.govuk-summary-card__content > div.govuk-details__text_inactive > table > tbody > tr > td:nth-child(2)'))
            .toBeVisible();
    }

    async clickAddAnotherStepButton() {
        await newTabGlobal!.getByRole('button', { name: 'Add another step' }).click();
    }

    async checkDoTheyAgreeToThisPLanPageTitle() {
        await expect(newTabGlobal!).toHaveTitle('Do they agree to this plan? - Sentence plan');
    }

    async tickYesIAgreeToThisPlan() {
        await newTabGlobal!.locator('#agree-plan-radio').check();
    }

    async tickNoIDoNotAgree() {
        await newTabGlobal!.locator('#agree-plan-radio-2').check();
    }

    async fillInIDoNotAgreeDetails() {
        await newTabGlobal!.locator('#does-not-agree-details')
            .fill('I do not agree');
    }

    async tickCouldNotAnswer() {
        await newTabGlobal!.locator('#agree-plan-radio-4').check();
    }

    async fillInCouldNotAnswerDetails() {
        await newTabGlobal!.locator('#could-not-answer-details')
            .fill('I could not answer');
    }

    async fillInNotesAboutAgreeingPlan() {
        await newTabGlobal!.locator('#notes')
            .fill('Test notes about agreeing the plan.')
    }

    async clickSaveButtonOnAgreePlanPage() {
        await newTabGlobal!.locator('#agree-plan-form > button').click();
    }

    async checkUserIsBAckOnSentencePlanLandingPage() {
        await expect(newTabGlobal!).toHaveTitle('Plan - Sentence plan');
    }

    async checkCreateAGoalPageTitle() {
        await expect(newTabGlobal!).toHaveTitle('Create a goal - Sentence plan');
    }

    async clickSaveWithoutStepsButton() {
        await newTabGlobal!.getByRole('button', { name: 'Save without steps' }).click();
    }

    async checkAddStepsValidationErrorDisplays() {
        await expect(newTabGlobal!.locator('div').filter({ hasText: 'There is a problem Add steps' }).nth(3))
            .toBeVisible();
    }

    async checkUserIsNotifiedGoalHasBeenAdded() {
        await expect(newTabGlobal!.getByLabel('Success')).toBeVisible();
    }

    async clickGoalsToWorkOnTab() {
        await newTabGlobal!.locator('#main-content > div > div > nav > ul > li:nth-child(1) > a').click();
    }

    async checkNumberOfGoalsToWorkOnNowIsCorrect() {
        await expect(newTabGlobal!.getByRole('link', { name: 'Goals to work on now (2)' }))
            .toBeVisible();
    }

    async checkNumberOfFutureGoalsIsCorrect() {
        await expect(newTabGlobal!.getByRole('link', { name: 'Future goals (1)' }))
            .toBeVisible();
    }

    async clickPlanTopNavLink() {
        await newTabGlobal!.locator('a.moj-primary-navigation__link').first().click();
    }

    async clickPlanHistoryTopNavLink() {
        await newTabGlobal!.getByRole('link', { name: 'Plan history', exact: true }).click();
    }

    async clickEmbeddedViewPlanHistoryLink() {
        await newTabGlobal!.locator('#main-content > p > a').click();
    }

    async checkPlanHistoryTabOpens() {
        await expect(newTabGlobal!.getByRole('heading', { name: 'Plan history' })).toBeVisible();
    }
    async clickAboutTopNavLink() {
        await newTabGlobal!.getByRole('link', { name: 'About', exact: false }).click();
    }

    async checkAboutTabOpens() {
        await expect(newTabGlobal!.getByText('Sentence information')).toBeVisible();
    }

    async clickUpdateLink() {
        await newTabGlobal!.getByRole('link', { name: 'Update   (test goal)' }).click();
    }

    async updateStepStatustoInProgress() {
        await newTabGlobal!.getByRole('row', { name: 'Probation practitioner test 1' }).getByLabel('Status').selectOption('IN_PROGRESS');
    }

    async checkStepStatusIsSetToInProgress() {
        await expect(newTabGlobal!.getByRole('row', { name: 'Probation practitioner test 1' }).getByRole('strong'))
            .toHaveText('In progress');
    }

    async updateStepStatusBackToNotStarted() {
        await newTabGlobal!.getByRole('cell', { name: 'In progress' }).getByLabel('Status').selectOption('NOT_STARTED');
    }

    async checkStepStatusBackToNotStarted() {
        await expect(newTabGlobal!.getByRole('row', { name: 'Probation practitioner test 1' }).getByRole('strong'))
            .toHaveText('Not started');
    }

    async addNotesAboutStepUpdate() {
        await newTabGlobal!.getByLabel('Add notes about progress (').fill('Status update test note');
    }

    async clickSaveGoalAndStepsButton() {
        await newTabGlobal!.getByRole('button', { name: 'Save goal and steps' }).click();
    }

    async checkPlanCreationUpdateIsUnique() {
        await expect(newTabGlobal!.locator('p').filter({ hasText: PLAN_CREATED_DATA }).getByRole('strong'))
            .toHaveCount(1);
    }

    async checkPlanCreationIsNotOverwritten() {
        const todayDate = getTodayDateFormatted();
        await expect(newTabGlobal!.locator('p').filter({ hasText: 'Plan agreed on ' + todayDate }).getByRole('strong'))
            .toHaveCount(0);
    }

    async checkAboutPageTitle() {
        await expect(newTabGlobal!).toHaveTitle('About - Sentence plan');
    }

    async checkBannerDisplaysForIncompleteAssessment() {
        await expect(newTabGlobal!.getByLabel('Warning'))
            .toHaveCount(1);
        await expect(newTabGlobal!.locator('h2.govuk-heading-m').first())
            .toHaveText('Some areas have incomplete information');
    }

    async checkBannerDoesntDisplayForCompleteAssessment() {
        await expect(newTabGlobal!.getByLabel('Warning'))
            .toHaveCount(0);
    }

    async clickShowAllSectionsAccordion() {
        await newTabGlobal!.locator('#assessment-accordion-highScoring').getByRole('button', { name: 'Show all sections' })
            .click();
    }

    async clickCreateAGoalLinkFromWithinSection() {
        await newTabGlobal!.locator('#assessment-accordion-highScoring-content-1 > p.goal-link > a')
            .click();
    }

    async clickBackButtonFromCreateGoalPage() {
        await newTabGlobal!.getByRole('link', { name: 'Back', exact: true }).click();
    }

    async checkSectionsAreListedAsIncompleteInformation() {
        const missingInfoAccordion = newTabGlobal!.locator('#assessment-accordion-incompleteAreas')
        await expect(missingInfoAccordion).toBeVisible();
        const missingInfoSections = [
            newTabGlobal!.getByLabel('Accommodation'),
            newTabGlobal!.getByLabel('Alcohol use'),
            newTabGlobal!.getByLabel('Drug use'),
            newTabGlobal!.getByLabel('Employment and education'),
            newTabGlobal!.getByLabel('Finances'),
            newTabGlobal!.getByLabel('Health and wellbeing'),
            newTabGlobal!.getByLabel('Personal relationships and'),
            newTabGlobal!.getByLabel('Thinking, behaviours and')
        ];
        for (const locator of missingInfoSections) {
            await expect(locator).toBeVisible();
            // Ensure the sections above are displayed in that order
            const positions = await locator.evaluateAll(items => items.map(item => item.getBoundingClientRect().y));
            const sortedPositions = [...positions].sort((a, b) => a - b);
            expect(positions).toEqual(sortedPositions);
        }
    }

    async checkThereAreNoHighOrLowScoringAreas() {
        await expect(newTabGlobal!.locator('#main-content > div > div > p:nth-child(9)')).toHaveText('No high-scoring areas at the moment.');
        await expect(newTabGlobal!.locator('#main-content > div > div > p:nth-child(11)')).toHaveText('No low-scoring areas at the moment.');
    }

    async checkNoInfoAvailableDisplays() {
        await newTabGlobal!.locator('#accommodation > div.govuk-accordion__section-header > h3 > button').click();
        await expect(newTabGlobal!.getByText('No information is available yet'))
            .toBeVisible();
    }

    async checkInfoSectionNoFlagsListsCorrectOrder() {
        // High scoring
        const highScoringInfoAccordion = newTabGlobal!.locator('#assessment-accordion-highScoring')
        await expect(highScoringInfoAccordion).toBeVisible();
        const highScoringInfoSections = [
            newTabGlobal!.getByLabel('Accommodation'),
            newTabGlobal!.getByLabel('Personal relationships and'),
            newTabGlobal!.getByLabel('Thinking, behaviours and'),
            newTabGlobal!.getByLabel('Drug use'),
            newTabGlobal!.getByLabel('Employment and education')
        ];
        for (const locator of highScoringInfoSections) {
            await expect(locator).toBeVisible();
            const positions = await locator.evaluateAll(items => items.map(item => item.getBoundingClientRect().y));
            const sortedPositions = [...positions].sort((a, b) => a - b);
            expect(positions).toEqual(sortedPositions);
        }
        // Low scoring
        const lowScoringInfoAccordion = newTabGlobal!.locator('#assessment-accordion-lowScoring')
        await expect(lowScoringInfoAccordion).toBeVisible();
        await expect(lowScoringInfoAccordion).toContainText('Alcohol use');
        // Without a need score
        const withoutScoringInfoAccordion = newTabGlobal!.locator('#assessment-accordion-withoutScoring')
        await expect(withoutScoringInfoAccordion).toBeVisible();
        const withoutScoringInfoSections = [
            newTabGlobal!.getByLabel('Health and wellbeing'),
            newTabGlobal!.getByLabel('Finances')
        ];
        for (const locator of withoutScoringInfoSections) {
            await expect(locator).toBeVisible();
            const positions = await locator.evaluateAll(items => items.map(item => item.getBoundingClientRect().y));
            const sortedPositions = [...positions].sort((a, b) => a - b);
            expect(positions).toEqual(sortedPositions);
        }
    }

    async checkCompletedAssessmentHighScoringSectionDisplaysCorrectly() {
        // High scoring
        const highScoringInfoAccordion = newTabGlobal!.locator('#assessment-accordion-highScoring')
        await expect(highScoringInfoAccordion).toBeVisible();
        const highScoringInfoSections = [
            newTabGlobal!.getByLabel('Drug use'),
            newTabGlobal!.getByLabel('Employment and education'),
            newTabGlobal!.getByLabel('Personal relationships and'),
            newTabGlobal!.getByLabel('Thinking, behaviours and')
        ];
        for (const locator of highScoringInfoSections) {
            await expect(locator).toBeVisible();
            const positions = await locator.evaluateAll(items => items.map(item => item.getBoundingClientRect().y));
            const sortedPositions = [...positions].sort((a, b) => a - b);
            expect(positions).toEqual(sortedPositions);
        }
    }
    async checkCompletedAssessmentLowScoringSectionDisplaysCorrectly() {
        // Low scoring
        const lowScoringInfoAccordion = newTabGlobal!.locator('#assessment-accordion-lowScoring')
        await expect(lowScoringInfoAccordion).toBeVisible();
        const lowScoringInfoSections = [
            newTabGlobal!.getByLabel('Accommodation'),
            newTabGlobal!.getByLabel('Alcohol use')
        ];
        for (const locator of lowScoringInfoSections) {
            await expect(locator).toBeVisible();
            const positions = await locator.evaluateAll(items => items.map(item => item.getBoundingClientRect().y));
            const sortedPositions = [...positions].sort((a, b) => a - b);
            expect(positions).toEqual(sortedPositions);
        }
    }
    async checkCompletedAssessmentWithoutAScoreSectionDisplaysCorrectly() {
        // Without a need score
        const withoutScoringInfoAccordion = newTabGlobal!.locator('#assessment-accordion-withoutScoring')
        await expect(withoutScoringInfoAccordion).toBeVisible();
        const withoutScoringInfoSections = [
            newTabGlobal!.getByLabel('Finances'),
            newTabGlobal!.getByLabel('Health and wellbeing')
        ];
        for (const locator of withoutScoringInfoSections) {
            await expect(locator).toBeVisible();
            const positions = await locator.evaluateAll(items => items.map(item => item.getBoundingClientRect().y));
            const sortedPositions = [...positions].sort((a, b) => a - b);
            expect(positions).toEqual(sortedPositions);
        }
    }

    async clickUpdateAgreementLink() {
        await newTabGlobal!.locator('#update-assessment-text > a').click();
    }

    async checkUpdateAgreePlanPageTitle() {
        await expect(newTabGlobal!).toHaveTitle('Do they agree? - Sentence plan')
    }

    async clickBackLinkOnUpdateAgreePlanPage() {
        await newTabGlobal!.getByRole('link', { name: 'Back', exact: true }).click();
    }

    async tickYesIAgreeOnUpdateAgreePlanPage() {
        await newTabGlobal!.locator('#agree-plan-radio').check();
    }

    async tickNoIDoNotAgreeOnUpdateAgreePlanPage() {
        await newTabGlobal!.locator('#agree-plan-radio-2').check();
    }

    async clickSaveOnUpdateAgreePlanPage() {
        await newTabGlobal!.locator('#update-agree-plan-form > div.govuk-button-group > button').click();
    }

    async checkAgreementDataCorrectlyDisplaysInPlanHistory() {
        await expect(newTabGlobal!.locator('#main-content > div > div > p:nth-child(2) > strong'))
            .toContainText("Agreement updated");
        await expect(newTabGlobal!.locator('#main-content > div > div > p:nth-child(3)'))
            .toContainText("did not agree to this plan.");
        await expect(newTabGlobal!.locator('#main-content > div > div > div:nth-child(4)'))
            .toContainText("I do not agree");
        await expect(newTabGlobal!.locator('#main-content > div > div > p:nth-child(6) > strong'))
            .toContainText("Plan created");
        await expect(newTabGlobal!.locator('#main-content > div > div > p:nth-child(7)'))
            .toContainText("could not agree to this plan.");
        await expect(newTabGlobal!.locator('#main-content > div > div > div:nth-child(8)'))
            .toContainText("I could not answer");
        await expect(newTabGlobal!.locator('#main-content > div > div > div.plan-additional-note'))
            .toContainText("Test notes about agreeing the plan.");
    }

    async checkPlanHistoryPageTitle() {
        await expect(newTabGlobal!).toHaveTitle('Plan history - Sentence plan')
    }

    async checkUpdateButtonAppears() {
        await expect(newTabGlobal!.getByRole('link', { name: 'Update' })).toBeVisible();
    }

    async checkUpdateButtonHidden() {
        await expect(newTabGlobal!.getByRole('link', { name: 'Update)' })).toBeHidden();
    }

    async clickRemovedGoalsButton() {
        await newTabGlobal!.locator('#main-content > div > div > nav > ul > li:nth-child(3) > a').click();
    }

    async checkRemovedGoalsTabIsThere() {
        await expect(newTabGlobal!.locator('#goal-summary-card-1 div').filter({ hasText: 'test' }).nth(1)).toBeVisible();
    }

    async checkReturnToAsysButtonIsNotDisplayedWhenInMpop() {
        await expect(newTabGlobal!.getByRole('button', { name: 'Return to OASys' })).toBeHidden();
    }

    async checkAboutLinkIsNotDisplayedWhenInMpop() {
        await expect(newTabGlobal!.getByRole('link', { name: 'About', exact: false })).toBeHidden();
    }
}