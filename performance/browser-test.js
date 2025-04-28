import { browser } from 'k6/experimental/browser'
import { describe, expect } from 'https://jslib.k6.io/k6chaijs/4.3.4.3/index.js'
import { sleep } from 'k6'
import { Trend } from 'k6/metrics'

import { stubHomePage } from '../page-objects/stub-home-page'
import { strengthsAndNeedsLandingPage } from '../page-objects/strengths-and-needs-pages'


export async function browserTest() {
    const page = browser.newPage()

// Navigate to the stub home page
await stubHomePage.goto();

// Check the title of the page is correct
await stubHomePage.checkPageTitle();

// Select strenghts and needs reports assessment
await stubHomePage.selectStrenghtsAndNeeds();

// Click create handover button
await stubHomePage.clickCreateHandoverButton(); 

// Click open button
await stubHomePage.clickOpenButton();

// check page load duration
page.evaluate(() => window.performance.mark('page-visit'))
page.evaluate(() => window.performance.measure('page-visit', 'action-completed'))

// check the page title is correct
await strengthsAndNeedsLandingPage.checkPageTitle();

// Try to submit form - expect validation error
await strengthsAndNeedsLandingPage.clickSaveAndContinueButton();
await strengthsAndNeedsLandingPage.validationErrorDisplays();

// check page load duration
page.evaluate(() => window.performance.mark('page-visit'))
page.evaluate(() => window.performance.measure('page-visit', 'action-completed'))

// Fill in accomodation assessment
await strengthsAndNeedsLandingPage.tickSettled();
await strengthsAndNeedsLandingPage.tickHomeowner();
await strengthsAndNeedsLandingPage.clickSaveAndContinueButton();

// check page load duration
page.evaluate(() => window.performance.mark('page-visit'))
page.evaluate(() => window.performance.measure('page-visit', 'action-completed'))

await strengthsAndNeedsLandingPage.tickLivingWithFamily();
await strengthsAndNeedsLandingPage.tickSuitableHousingLocation();
await strengthsAndNeedsLandingPage.tickSuitableHousing();
await strengthsAndNeedsLandingPage.tickAccomodationChanges();
await strengthsAndNeedsLandingPage.clickSaveAndContinueButton();

// check page load duration
page.evaluate(() => window.performance.mark('page-visit'))
page.evaluate(() => window.performance.measure('page-visit', 'action-completed'))

// Fill in practicioner analysis 
await strengthsAndNeedsLandingPage.clickPracticionerAnalysisTab();
await strengthsAndNeedsLandingPage.tickNoAccomodationFactors();
await strengthsAndNeedsLandingPage.tickNoRiskOfHarm();
await strengthsAndNeedsLandingPage.tickNoRiskOfReoffending();
await strengthsAndNeedsLandingPage.clickMarkAsComplete();
await strengthsAndNeedsLandingPage.checkSectionCompleteIconDisplays();
console.log('Accomodation assessment completed');

// check page load duration
page.evaluate(() => window.performance.mark('page-visit'))
page.evaluate(() => window.performance.measure('page-visit', 'action-completed'))

// Fill in Employment assessment
await strengthsAndNeedsLandingPage.clickEmploymentAndEducationLeftNavLink();
await strengthsAndNeedsLandingPage.tickEmployed();
await strengthsAndNeedsLandingPage.tickFullTime();
await strengthsAndNeedsLandingPage.clickSaveAndContinueButton();

await strengthsAndNeedsLandingPage.tickContinuousEmployment();
await strengthsAndNeedsLandingPage.tickCaringResponsibilities();
await strengthsAndNeedsLandingPage.tickEntryLevel();
await strengthsAndNeedsLandingPage.tickNoVocationalQualifications();
await strengthsAndNeedsLandingPage.tickTransferrableSkills();
await strengthsAndNeedsLandingPage.tickNoDifficultyReading();
await strengthsAndNeedsLandingPage.tickPositiveEmploymentExperience();
await strengthsAndNeedsLandingPage.tickPositiveExperienceOfEducation();
await strengthsAndNeedsLandingPage.tickIHaveAlreadyMadeChanges();
await strengthsAndNeedsLandingPage.clickSaveAndContinueButton();

// Fill in practicioner analysis 
await strengthsAndNeedsLandingPage.clickPracticionerAnalysisTab();
await strengthsAndNeedsLandingPage.tickEmploymentFactors();
await strengthsAndNeedsLandingPage.tickEmploymentRiskOfHarm();
await strengthsAndNeedsLandingPage.tickEmploymentRiskOfReoffending();
await strengthsAndNeedsLandingPage.clickMarkAsComplete();
await strengthsAndNeedsLandingPage.checkEmploymentSectionCompleteIconDisplays();
console.log('Employment assessment completed');

// Fill in finances assessment
await strengthsAndNeedsLandingPage.clickFinancesLeftNavLink();
await strengthsAndNeedsLandingPage.tickCarersAllowance();
await strengthsAndNeedsLandingPage.tickOwnBankAccount();
await strengthsAndNeedsLandingPage.tickAbleToManageMoney();
await strengthsAndNeedsLandingPage.tickFinanceGambling();
await strengthsAndNeedsLandingPage.tickOwndebt();
await strengthsAndNeedsLandingPage.tickDebtToOthers();
await strengthsAndNeedsLandingPage.tickFinanceIHaveAlreadyMadechanges();
await strengthsAndNeedsLandingPage.clickSaveAndContinueButton();

// Fill in practicioner analysis 
await strengthsAndNeedsLandingPage.clickPracticionerAnalysisTab();
await strengthsAndNeedsLandingPage.tickFinanceFactors();
await strengthsAndNeedsLandingPage.tickFinanceRiskOfHarm();
await strengthsAndNeedsLandingPage.tickFinanceRiskOfReoffending();
await strengthsAndNeedsLandingPage.clickMarkAsComplete();
await strengthsAndNeedsLandingPage.checkFinanceSectionCompleteIconDisplays();
console.log('Finances assessment completed');

// Fill in drug use assessment
await strengthsAndNeedsLandingPage.clickDrugUseLeftNavLink();
await strengthsAndNeedsLandingPage.tickNoDrugUse();
await strengthsAndNeedsLandingPage.clickSaveAndContinueButton();

// Fill in practicioner analysis 
await strengthsAndNeedsLandingPage.clickPracticionerAnalysisTab();
await strengthsAndNeedsLandingPage.tickDrugFactors();
await strengthsAndNeedsLandingPage.tickDrugRiskOfHarm();
await strengthsAndNeedsLandingPage.tickDrugRiskOfReoffending();
await strengthsAndNeedsLandingPage.clickMarkAsComplete();
await strengthsAndNeedsLandingPage.checkDrugSectionCompleteIconDisplays();
console.log('Drug use assessment completed');

// Fill in alcohol use assessment
await strengthsAndNeedsLandingPage.clickAlcoholUseLeftNavLink();
await strengthsAndNeedsLandingPage.tickNoAlcoholUse();
await strengthsAndNeedsLandingPage.clickSaveAndContinueButton();

// Fill in practicioner analysis 
await strengthsAndNeedsLandingPage.clickPracticionerAnalysisTab();
await strengthsAndNeedsLandingPage.tickAlcoholFactors();
await strengthsAndNeedsLandingPage.tickAlcoholRiskOfHarm();
await strengthsAndNeedsLandingPage.tickAlcoholRiskOfReoffending();
await strengthsAndNeedsLandingPage.clickMarkAsComplete();
await strengthsAndNeedsLandingPage.checkAlcoholSectionCompleteIconDisplays();
console.log('Alcohol use assessment completed');

// Fill in health and wellbeing assessment
await strengthsAndNeedsLandingPage.clickHealthAndWellbeingLeftNavLink();
await strengthsAndNeedsLandingPage.tickHealthPhysicalHealthCondition();
await strengthsAndNeedsLandingPage.tickMentalHealthCondition();
await strengthsAndNeedsLandingPage.clickSaveAndContinueButton();
await strengthsAndNeedsLandingPage.tickPsychiatricTreatment();
await strengthsAndNeedsLandingPage.tickHeadInjury();
await strengthsAndNeedsLandingPage.tickNeuroDiverseCondition();
await strengthsAndNeedsLandingPage.tickLearningDifficulties();
await strengthsAndNeedsLandingPage.tickCoping();
await strengthsAndNeedsLandingPage.tickAttitudeTowardsSelf();
await strengthsAndNeedsLandingPage.tickNoSelfHarm();
await strengthsAndNeedsLandingPage.tickNoSuicidalThoughts();
await strengthsAndNeedsLandingPage.tickOptimisticAboutFuture();
await strengthsAndNeedsLandingPage.tickHealthPositiveFactors();
await strengthsAndNeedsLandingPage.tickHealthAlreadyMakingChanges();
await strengthsAndNeedsLandingPage.clickSaveAndContinueButton();

// Fill in practicioner analysis 
await strengthsAndNeedsLandingPage.clickPracticionerAnalysisTab();
await strengthsAndNeedsLandingPage.tickHealthFactors();
await strengthsAndNeedsLandingPage.tickHealthRiskOfHarm();
await strengthsAndNeedsLandingPage.tickHealthRiskOfReoffending();
await strengthsAndNeedsLandingPage.clickMarkAsComplete();
await strengthsAndNeedsLandingPage.checkHealthSectionCompleteIconDisplays();
console.log('Health and wellbeing assessment completed');

// Fill in personal relationships and community assessment
await strengthsAndNeedsLandingPage.clickPersonalRelationshipsLeftNavLink();
await strengthsAndNeedsLandingPage.tickYesChildrenLiving();
await strengthsAndNeedsLandingPage.fillInInfoAboutChildren();
await strengthsAndNeedsLandingPage.clickSaveAndContinueButton();

await strengthsAndNeedsLandingPage.tickPartnerImportantPeople();
await strengthsAndNeedsLandingPage.clickSaveAndContinueButton();

await strengthsAndNeedsLandingPage.tickHappyWithRelationship();
await strengthsAndNeedsLandingPage.tickStableRelationship();
await strengthsAndNeedsLandingPage.tickStableFamilyRelationship();
await strengthsAndNeedsLandingPage.enterChallengesInRelationshipsDetails();
await strengthsAndNeedsLandingPage.tickPositiveChildhood();
await strengthsAndNeedsLandingPage.tickChildBehaviouralProblem();
await strengthsAndNeedsLandingPage.tickPersonalRelationshipsAlreadyMakingChanges();
await strengthsAndNeedsLandingPage.clickSaveAndContinueButton();

// Fill in practicioner analysis
await strengthsAndNeedsLandingPage.clickPracticionerAnalysisTab();
await strengthsAndNeedsLandingPage.tickPersonalRelationshipsFactors();
await strengthsAndNeedsLandingPage.tickPersonalRelationshipsRiskOfHarm();
await strengthsAndNeedsLandingPage.tickPersonalRelationshipsRiskOfReoffending();
await strengthsAndNeedsLandingPage.clickMarkAsComplete();
await strengthsAndNeedsLandingPage.checkPersonalRelationshipsSectionCompleteIconDisplays();
console.log('Personal and relationships assessment completed');

// Fill in thinking behaviours and attitudes assessment
await strengthsAndNeedsLandingPage.clickThinkingAndAttitudesLeftNavLink();
await strengthsAndNeedsLandingPage.tickAwareOfConsequences();
await strengthsAndNeedsLandingPage.tickShowsStableBehaviour();
await strengthsAndNeedsLandingPage.tickEngagesInActivities();
await strengthsAndNeedsLandingPage.tickResilientTowardsPeerPressure();
await strengthsAndNeedsLandingPage.tickAbleToSolveProblems();
await strengthsAndNeedsLandingPage.tickUnderstandsPeoplesViews();
await strengthsAndNeedsLandingPage.tickNoManipulativeBehaviour();
await strengthsAndNeedsLandingPage.clickSaveAndContinueButton();

await strengthsAndNeedsLandingPage.tickTemperManagement();
await strengthsAndNeedsLandingPage.tickDoesntUseViolence();
await strengthsAndNeedsLandingPage.tickImpulsiveBehaviour();
await strengthsAndNeedsLandingPage.tickPositiveAttitude();
await strengthsAndNeedsLandingPage.tickAbleToHaveConstructiveConversations();
await strengthsAndNeedsLandingPage.tickAcceptsSupervision();
await strengthsAndNeedsLandingPage.tickDoesntSupportCriminalBehaviour();
await strengthsAndNeedsLandingPage.tickThinkingBehaviourAlreadyMakingChanges();
await strengthsAndNeedsLandingPage.clickSaveAndContinueButton();

await strengthsAndNeedsLandingPage.tickNoSexualRiskToOthers();
await strengthsAndNeedsLandingPage.clickSaveAndContinueButton();

// Fill in practicioner analysis
await strengthsAndNeedsLandingPage.clickPracticionerAnalysisTab();
await strengthsAndNeedsLandingPage.tickThinkingBehaviourFactors();
await strengthsAndNeedsLandingPage.fillProtectiveFactorsComment();
await strengthsAndNeedsLandingPage.tickThinkingBehaviourRiskOfHarm();
await strengthsAndNeedsLandingPage.tickThinkingBehaviourRiskOfReoffending();
await strengthsAndNeedsLandingPage.clickMarkAsComplete();
await strengthsAndNeedsLandingPage.checkThinkingBehaviourSectionCompleteIconDisplays();
console.log('Thinking behaviour assessment completed');

// Fill in offence analysis
await strengthsAndNeedsLandingPage.clickOffenceAnalysisLeftNavLink();
await strengthsAndNeedsLandingPage.fillBriefDescription();
await strengthsAndNeedsLandingPage.tickWeapon();
await strengthsAndNeedsLandingPage.fillReasonForOffence();
await strengthsAndNeedsLandingPage.tickThrillSeeking();
await strengthsAndNeedsLandingPage.tickOneOrMorePeople();
await strengthsAndNeedsLandingPage.clickSaveAndContinueButton();

await strengthsAndNeedsLandingPage.tickVictimIsAStranger();
await strengthsAndNeedsLandingPage.tickVictimAge50to64();
await strengthsAndNeedsLandingPage.tickVictimUnknownGender();
await strengthsAndNeedsLandingPage.selectVictimsRace();
await strengthsAndNeedsLandingPage.clickSaveAndContinueButton();
await strengthsAndNeedsLandingPage.clickSaveAndContinueButton();

await strengthsAndNeedsLandingPage.tickNoneInvolved();
await strengthsAndNeedsLandingPage.clickSaveAndContinueButton();

await strengthsAndNeedsLandingPage.tickRealizesImpactOnVictims();
await strengthsAndNeedsLandingPage.tickAcceptsResponsibility();
await strengthsAndNeedsLandingPage.fillPatternsOfOffending();
await strengthsAndNeedsLandingPage.tickNotApplicableEscalation();
await strengthsAndNeedsLandingPage.tickNoToriskOfSeriousHarm();
await strengthsAndNeedsLandingPage.fillDetailsAboutNoRiskOfSeriousHarm();
await strengthsAndNeedsLandingPage.tickNoToPerpetratorOfDomestic();
await strengthsAndNeedsLandingPage.tickNoToBeingAVictim();
await strengthsAndNeedsLandingPage.clickMarkAsComplete();
console.log('Offence analysis completed');

// Ensure user is on ofeence analysis summary page
await strengthsAndNeedsLandingPage.confirmUserIsOnOffenceAnalysisPage();

};