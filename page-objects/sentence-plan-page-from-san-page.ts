import { expect, Locator, Page } from '@playwright/test';

let newTabGlobal: Page | null = null;

//#region high scoring content details
const highScoringInfoContentDetails =
    'This area is linked to RoSH (risk of serious harm)'
'Test yes serious harm'
'This area is linked to risk of reoffending'
'Test yes reoffending'
'Motivation to make changes in this area'
'wants to make changes but needs help.'
'There are strengths or protective factors related to this area'
'Test yes factors'
'Employment and education need score 4 out of 4'
'Create employment and education goal';
//#endregion

//#region low scoring content details
const lowScoringInfoContentDetails =
    'This area is not linked to RoSH (risk of serious harm)'
'Test no serious harm'
'This area is not linked to risk of reoffending'
'Test no reoffending'
'Motivation to make changes in this area'
'has already made positive changes and wants to maintain them.'
'There are no strengths or protective factors related to this area'
'Test no factors'
'Accommodation need score 1 out of 6'
'Create accommodation goal';
//#endregion


export class SentencePlanfromSanPage {
    constructor(
        private page: Page,
    ) { }

    async checkPageTitle() {
        const context = this.page.context();
        const pages = context.pages();
        const latestPage = pages[pages.length - 1];
        await latestPage.bringToFront();
        //wait for Load 
        await latestPage.waitForLoadState();
        newTabGlobal = latestPage;
        await expect(latestPage).toHaveTitle('Remember to close any other applications  before starting an appointment - Sentence plan');
    }

    async checkPageTitleSentencePlanAfterDataPrivacyScreen() {
        await expect(newTabGlobal).toHaveTitle('Plan - Sentence plan');
    }

    async tickConfirmBox() {
        await newTabGlobal!.locator('#confirm-privacy-checkbox').check();
    }

    async clickConfirmButtonOnDataPrivacyScreen() {
        await newTabGlobal!.locator('#confirm-privacy-form > div.govuk-button-group > button').click();
    }

    async clickAboutPageAfterNavigatingToSPWithoutOasysStep() {
        const aboutLink = await newTabGlobal!.getByRole('link', { name: 'About', exact: false })
        await aboutLink.waitFor({ state: 'visible' });
        await aboutLink.click();
    }

    async checkAboutPageDisplaysCorrectInfoForIncompleteSan() {
        // Check banner displays for incomplete assessment
        const warning = await newTabGlobal!.getByLabel('Warning');
        await expect(warning).toHaveCount(1);
        const incompleteInfo = await newTabGlobal!.locator('h2.govuk-heading-m').first();
        await expect(incompleteInfo).toHaveText('Some areas have incomplete information');

        // Check high-scoring area displays the right info
        const highScoringInfoAccordion = await newTabGlobal!.locator('#assessment-accordion-highScoring');
        await expect(highScoringInfoAccordion).toContainText('Employment and education');
        const employmentAndEducationSection = await newTabGlobal!.getByLabel('Employment and education ,');
        await employmentAndEducationSection.click();
        const highScoringInfoContent = await newTabGlobal!.locator('#assessment-accordion-highScoring-content-1');
        const highScoringInfoText = await highScoringInfoContent.textContent();
        await expect(highScoringInfoText).toContain(highScoringInfoContentDetails);
        await employmentAndEducationSection.click();

        // Check low-scoring area displays the right info
        const lowScoringInfoAccordion = await newTabGlobal!.locator('#assessment-accordion-lowScoring');
        await expect(lowScoringInfoAccordion).toContainText('Accommodation');
        const accommodationSection = await newTabGlobal!.getByLabel('Accommodation , , Show this')
        await accommodationSection.click();
        const lowScoringInfoContent = await newTabGlobal!.locator('#assessment-accordion-lowScoring-content-1');
        const lowScoringInfoText = await lowScoringInfoContent.textContent();
        await expect(lowScoringInfoText).toContain(lowScoringInfoContentDetails);
    }
}