import { expect, Locator, Page } from '@playwright/test';

export class StrengthsAndNeedsPage {
  readonly page: Page;
  readonly settled: Locator;
  readonly homeowner: Locator;
  readonly livingWith: Locator;
  readonly suitableHousingLocation: Locator;
  readonly suitableHousing: Locator;
  readonly accommodationChanges: Locator;
  readonly saveAndContinue: Locator;
  readonly practitionerAnalysis: Locator;
  readonly noAccommodationFactors: Locator;
  readonly noRiskOfHarm: Locator;
  readonly noRiskOfReoffending: Locator;
  readonly markAsComplete: Locator;
  readonly accommodationComplete: Locator;
  readonly employmentAndEducation: Locator;
  readonly finances: Locator;
  readonly drugUse: Locator;
  readonly alcoholUse: Locator;
  readonly healthAndWellbeing: Locator;
  readonly personalRelationships: Locator;
  readonly behavioursAndAttitudes: Locator;
  readonly offenceAnalysis: Locator;

  constructor(page: Page) {
    this.page = page;
    this.settled = page.locator('#current_accommodation');
    this.homeowner = page.locator('#type_of_settled_accommodation');
    this.livingWith = page.locator('#living_with');
    this.suitableHousingLocation = page.locator('#suitable_housing_location');
    this.suitableHousing = page.locator('#suitable_housing');
    this.accommodationChanges = page.locator('#accommodation_changes');
    this.saveAndContinue = page.getByRole('button', { name: 'Save and continue' });
    this.practitionerAnalysis = page.locator('#tab_practitioner-analysis');
    this.noAccommodationFactors = page.locator(
      '#accommodation_practitioner_analysis_strengths_or_protective_factors-2'
    );
    this.noRiskOfHarm = page.locator('#accommodation_practitioner_analysis_risk_of_serious_harm-2');
    this.noRiskOfReoffending = page.locator('#accommodation_practitioner_analysis_risk_of_reoffending-2');
    this.markAsComplete = page.getByRole('button', { name: 'Mark as complete' });
    this.accommodationComplete = page.getByRole('link', { name: 'Accommodation ✓' });
    this.employmentAndEducation = page.getByRole('link', { name: 'Employment and education' });
    this.finances = page.getByRole('link', { name: 'Finances' });
    this.drugUse = page.getByRole('link', { name: 'Drug use' });
    this.alcoholUse = page.getByRole('link', { name: 'Alcohol use' });
    this.healthAndWellbeing = page.getByRole('link', { name: 'Health and wellbeing' });
    this.personalRelationships = page.getByRole('link', { name: 'Personal relationships and community' });
    this.behavioursAndAttitudes = page.getByRole('link', { name: 'Thinking, behaviours and attitudes' });
    this.offenceAnalysis = page.getByRole('link', { name: 'Offence analysis' });
  }

  // Accomodation

  async completeAccomodation() {
    await this.settled.check();
    await this.homeowner.check();
    await this.saveAndContinue.click();
    await this.livingWith.check();
    await this.suitableHousingLocation.check();
    await this.suitableHousing.check();
    await this.accommodationChanges.check();
    await this.saveAndContinue.click();

    await this.practitionerAnalysis.click();
    await this.noAccommodationFactors.check();
    await this.noRiskOfHarm.check();
    await this.noRiskOfReoffending.check();
    await this.markAsComplete.click();
    await expect(this.accommodationComplete).toBeVisible();
  }

  async completeEmployment() {
    await this.tickEmployed();
    await this.tickFullTime();
    await this.saveAndContinue.click();

    await this.tickContinuousEmployment();
    await this.tickCaringResponsibilities();
    await this.tickEntryLevel();
    await this.tickNoVocationalQualifications();
    await this.tickTransferrableSkills();
    await this.tickNoDifficultyReading();
    await this.tickPositiveEmploymentExperience();
    await this.tickPositiveExperienceOfEducation();
    await this.tickIHaveAlreadyMadeChanges();
    await this.saveAndContinue.click();

    await this.practitionerAnalysis.click();
    await this.tickEmploymentFactors();
    await this.tickEmploymentRiskOfHarm();
    await this.tickEmploymentRiskOfReoffending();
    await this.markAsComplete.click();
    await this.checkEmploymentSectionCompleteIconDisplays();
  }

  async completeFinances() {
    await this.tickCarersAllowance();
    await this.tickOwnBankAccount();
    await this.tickAbleToManageMoney();
    await this.tickFinanceGambling();
    await this.tickOwndebt();
    await this.tickDebtToOthers();
    await this.tickFinanceIHaveAlreadyMadechanges();
    await this.saveAndContinue.click();

    await this.practitionerAnalysis.click();
    await this.tickFinanceFactors();
    await this.tickFinanceRiskOfHarm();
    await this.tickFinanceRiskOfReoffending();
    await this.markAsComplete.click();
    await this.checkFinanceSectionCompleteIconDisplays();
  }

  async completeDrugUse() {
    await this.tickYesToDrugUse();
    await this.saveAndContinue.click();

    await this.tickAmphetamines();
    await this.tickUsedInTheLast6Months();
    await this.saveAndContinue.click();

    await this.tickUsedDaily();
    await this.tickNoneInjected();
    await this.tickNoToReceivingTreatment();
    await this.saveAndContinue.click();

    await this.tickCulturalPractice();
    await this.tickAffectedBehaviour();
    await this.tickWantToMakeChangesDrugUseNotApplicable();
    await this.saveAndContinue.click();

    await this.practitionerAnalysis.click();
    await this.tickDrugFactors();
    await this.tickDrugRiskOfHarm();
    await this.tickDrugRiskOfReoffending();
    await this.tickDrugNoMotivationToStop();
    await this.markAsComplete.click();
    await this.checkDrugSectionCompleteIconDisplays();
  }

  async completeAlcoholUse() {
    await this.tickNoAlcoholUse();
    await this.saveAndContinue.click();

    await this.practitionerAnalysis.click();
    await this.tickAlcoholFactors();
    await this.tickAlcoholRiskOfHarm();
    await this.tickAlcoholRiskOfReoffending();
    await this.markAsComplete.click();
    await this.checkAlcoholSectionCompleteIconDisplays();
  }

  async completeHealthAndWellbeing() {
    await this.tickHealthPhysicalHealthCondition();
    await this.tickMentalHealthCondition();
    await this.saveAndContinue.click();
    await this.tickPsychiatricTreatment();
    await this.tickHeadInjury();
    await this.tickNeuroDiverseCondition();
    await this.tickLearningDifficulties();
    await this.tickCoping();
    await this.tickAttitudeTowardsSelf();
    await this.tickNoSelfHarm();
    await this.tickNoSuicidalThoughts();
    await this.tickOptimisticAboutFuture();
    await this.tickHealthPositiveFactors();
    await this.tickHealthAlreadyMakingChanges();
    await this.saveAndContinue.click();

    await this.practitionerAnalysis.click();
    await this.tickHealthFactors();
    await this.tickHealthRiskOfHarm();
    await this.tickHealthRiskOfReoffending();
    await this.markAsComplete.click();
    await this.checkHealthSectionCompleteIconDisplays();
  }

  async completePersonalRelationships() {
    await this.tickYesChildrenLiving();
    await this.fillInInfoAboutChildren();
    await this.saveAndContinue.click();

    await this.tickPartnerImportantPeople();
    await this.saveAndContinue.click();

    await this.tickHappyWithRelationship();
    await this.tickStableRelationship();
    await this.tickStableFamilyRelationship();
    await this.enterChallengesInRelationshipsDetails();
    await this.tickPositiveChildhood();
    await this.tickChildBehaviouralProblem();
    await this.tickPersonalRelationshipsAlreadyMakingChanges();
    await this.saveAndContinue.click();

    await this.practitionerAnalysis.click();
    await this.tickPersonalRelationshipsFactors();
    await this.tickPersonalRelationshipsRiskOfHarm();
    await this.tickPersonalRelationshipsRiskOfReoffending();
    await this.markAsComplete.click();
    await this.checkPersonalRelationshipsSectionCompleteIconDisplays();
  }

  async completeBehavioursAndAttitudes() {
    await this.tickAwareOfConsequences();
    await this.tickShowsStableBehaviour();
    await this.tickEngagesInActivities();
    await this.tickResilientTowardsPeerPressure();
    await this.tickAbleToSolveProblems();
    await this.tickUnderstandsPeoplesViews();
    await this.tickNoManipulativeBehaviour();
    await this.tickTemperManagement();
    await this.tickDoesntUseViolence();
    await this.tickImpulsiveBehaviour();
    await this.tickPositiveAttitude();
    await this.tickAbleToHaveConstructiveConversations();
    await this.tickAcceptsSupervision();
    await this.tickDoesntSupportCriminalBehaviour();
    await this.tickThinkingBehaviourAlreadyMakingChanges();
    await this.saveAndContinue.click();

    await this.tickNoSexualRiskToOthers();
    await this.saveAndContinue.click();

    await this.practitionerAnalysis.click();
    await this.tickThinkingBehaviourFactors();
    await this.fillProtectiveFactorsComment();
    await this.tickThinkingBehaviourRiskOfHarm();
    await this.tickThinkingBehaviourRiskOfReoffending();
    await this.markAsComplete.click();
    await this.checkThinkingBehaviourSectionCompleteIconDisplays();
  }

  async completeOffenceAnalysis() {
    await this.fillBriefDescription();
    await this.tickWeapon();
    await this.fillReasonForOffence();
    await this.tickThrillSeeking();
    await this.tickOneOrMorePeople();
    await this.saveAndContinue.click();

    await this.tickVictimIsAStranger();
    await this.tickVictimAge50to64();
    await this.tickVictimUnknownGender();
    await this.selectVictimsRace();
    await this.saveAndContinue.click();
    await this.saveAndContinue.click();

    await this.tickNoneInvolved();
    await this.saveAndContinue.click();

    await this.tickRealizesImpactOnVictims();
    await this.tickAcceptsResponsibility();
    await this.fillPatternsOfOffending();
    await this.tickNotApplicableEscalation();
    await this.tickNoToriskOfSeriousHarm();
    await this.fillDetailsAboutNoRiskOfSeriousHarm();
    await this.tickNoToPerpetratorOfDomestic();
    await this.tickNoToBeingAVictim();
    await this.markAsComplete.click();
  }

  async checkSaveAndContinueButtonHidden() {
    await expect(this.page.getByRole('button', { name: 'Save and continue' })).toBeHidden();
  }

  async clickPracitionerAnalysisButton() {
    await this.page.getByRole('button', { name: 'Go to practitioner analysis' }).click();
  }

  async clickSummaryTab() {
    await this.page.locator('#tab_summary').click();
  }

  async tickYesFactors() {
    await this.page.locator('#accommodation_practitioner_analysis_strengths_or_protective_factors').check();
  }

  async tickYesRiskOfHarm() {
    await this.page.locator('#accommodation_practitioner_analysis_risk_of_serious_harm-2').check();
  }

  async tickYesRiskOfReoffending() {
    await this.page.locator('#accommodation_practitioner_analysis_risk_of_reoffending-2').check();
  }

  async tickNoAccomodationFactors() {
    await this.page.locator('#accommodation_practitioner_analysis_strengths_or_protective_factors-2').check();
  }

  async tickNoRiskOfHarm() {
    await this.page.locator('#accommodation_practitioner_analysis_risk_of_serious_harm-2').check();
  }

  async tickNoRiskOfReoffending() {
    await this.page.locator('#accommodation_practitioner_analysis_risk_of_reoffending-2').check();
  }

  async checkSectionCompleteIconDisplays() {
    await expect(this.page.getByRole('link', { name: 'Accommodation ✓' })).toBeVisible();
  }

  async clickAccomodationFactorsChangeLink() {
    await this.page.getByRole('link', { name: 'Change  value for Strengths' }).click();
  }

  async clickAccomodationRiskOfHarmChangeLink() {
    await this.page.getByRole('link', { name: 'Change  value for Linked to risk of serious harm' }).click();
  }

  async clickRiskOfReOffendingChangeLink() {
    await this.page.getByRole('link', { name: 'Change  value for Linked to risk of reoffending' }).click();
  }

  async selectShelterAnswer() {
    await this.page.getByLabel('Shelter').click();
  }

  async selectCampsiteAnswer() {
    await this.page.getByLabel('Campsite').click();
  }

  async changeFirstAccommodationQuestion() {
    await this.page.getByRole('link', { name: 'Change  value for What type' }).click();
  }

  async changeSecondAccommodationQuestion() {
    await this.page.getByRole('link', { name: 'Change  value for Why does' }).click();
  }

  async fillInOptionalInfo() {
    await this.page.locator('#employment_history_unknown_details').fill('test');
  }

  // Employment

  async tickEmployed() {
    await this.page.locator('#employment_status').check();
  }

  async tickFullTime() {
    await this.page.locator('#employment_type').check();
  }

  async tickContinuousEmployment() {
    await this.page.locator('#employment_history').check();
  }

  async tickCaringResponsibilities() {
    await this.page.locator('#employment_other_responsibilities').check();
  }

  async tickEntryLevel() {
    await this.page.locator('#education_highest_level_completed').check();
  }

  async tickNoVocationalQualifications() {
    await this.page.locator('#education_professional_or_vocational_qualifications-2').check();
  }

  async tickTransferrableSkills() {
    await this.page.locator('#education_transferable_skills').check();
  }

  async tickNoDifficultyReading() {
    await this.page.locator('#education_difficulties-5').check();
  }

  async tickPositiveEmploymentExperience() {
    await this.page.locator('#employment_experience').check();
  }

  async tickPositiveExperienceOfEducation() {
    await this.page.locator('#education_experience').check();
  }

  async tickIHaveAlreadyMadeChanges() {
    await this.page.locator('#employment_education_changes').check();
  }

  async tickEmploymentFactors() {
    await this.page.locator('#employment_education_practitioner_analysis_strengths_or_protective_factors-2').check();
  }

  async tickEmploymentRiskOfHarm() {
    await this.page.locator('#employment_education_practitioner_analysis_risk_of_serious_harm-2').check();
  }

  async tickEmploymentRiskOfReoffending() {
    await this.page.locator('#employment_education_practitioner_analysis_risk_of_reoffending-2').check();
  }

  async checkEmploymentSectionCompleteIconDisplays() {
    await expect(this.page.getByRole('link', { name: 'Employment and education ✓' })).toBeVisible();
  }

  // Finances

  async clickFinancesLeftNavLink() {
    await this.page.getByRole('link', { name: 'Finances' }).click();
  }

  async tickCarersAllowance() {
    await this.page.locator('#finance_income').check();
  }

  async tickOwnBankAccount() {
    await this.page.locator('#finance_bank_account').check();
  }

  async tickAbleToManageMoney() {
    await this.page.locator('#finance_money_management').check();
  }

  async tickFinanceGambling() {
    await this.page.locator('#finance_gambling').check();
  }

  async tickOwndebt() {
    await this.page.locator('#finance_debt').check();
  }

  async tickDebtToOthers() {
    await this.page.locator('#yes_type_of_debt').check();
  }

  async tickFinanceIHaveAlreadyMadechanges() {
    await this.page.locator('#finance_changes').check();
  }

  async tickFinanceFactors() {
    await this.page.locator('#finance_practitioner_analysis_strengths_or_protective_factors-2').check();
  }

  async tickFinanceRiskOfHarm() {
    await this.page.locator('#finance_practitioner_analysis_risk_of_serious_harm-2').check();
  }

  async tickFinanceRiskOfReoffending() {
    await this.page.locator('#finance_practitioner_analysis_risk_of_reoffending-2').check();
  }

  async checkFinanceSectionCompleteIconDisplays() {
    await expect(this.page.getByRole('link', { name: 'Finances ✓' })).toBeVisible();
  }

  // Drug use

  async tickYesToDrugUse() {
    await this.page.locator('#drug_use').check();
  }

  async tickNoDrugUse() {
    await this.page.locator('#drug_use-2').check();
  }

  async tickUsedInTheLast6Months() {
    await this.page.locator('#drug_last_used_amphetamines').check();
  }

  async tickAmphetamines() {
    await this.page.locator('#select_misused_drugs').check();
  }

  async tickUsedDaily() {
    await this.page.locator('#how_often_used_last_six_months_amphetamines').check();
  }

  async tickNoneInjected() {
    await this.page.locator('#drugs_injected').check();
  }

  async tickNoToReceivingTreatment() {
    await this.page.locator('#drugs_is_receiving_treatment-2').check();
  }

  async tickCulturalPractice() {
    await this.page.locator('#drugs_reasons_for_use').check();
  }

  async tickAffectedBehaviour() {
    await this.page.locator('#drugs_affected_their_life').check();
  }

  async tickWantToMakeChangesDrugUseNotApplicable() {
    await this.page.locator('#drug_use_changes-10').check();
  }

  async tickDrugNoMotivationToStop() {
    await this.page.locator('#drugs_practitioner_analysis_motivated_to_stop').check();
  }

  async checkDrugMotivationErrorDisplays() {
    await expect(
      this.page.locator('#main-content div').filter({ hasText: 'There is a problem Select if' }).nth(3)
    ).toBeVisible();
    await expect(this.page.locator('#drugs_practitioner_analysis_motivated_to_stop-error')).toBeVisible();
  }

  async tickDrugFactors() {
    await this.page.locator('#drug_use_practitioner_analysis_strengths_or_protective_factors-2').check();
  }

  async tickDrugRiskOfHarm() {
    await this.page.locator('#drug_use_practitioner_analysis_risk_of_serious_harm-2').check();
  }

  async tickDrugRiskOfReoffending() {
    await this.page.locator('#drug_use_practitioner_analysis_risk_of_reoffending-2').check();
  }

  async checkDrugSectionCompleteIconDisplays() {
    await expect(this.page.getByRole('link', { name: 'Drug use ✓' })).toBeVisible();
  }

  // Alcohol use

  async tickNoAlcoholUse() {
    await this.page.locator('#alcohol_use-3').check();
  }

  async tickPhysicalHealthCondition() {
    await this.page.locator('#health_wellbeing_physical_health_condition').check();
  }

  async tickAlcoholFactors() {
    await this.page.locator('#alcohol_use_practitioner_analysis_strengths_or_protective_factors-2').check();
  }

  async tickAlcoholRiskOfHarm() {
    await this.page.locator('#alcohol_use_practitioner_analysis_risk_of_serious_harm-2').check();
  }

  async tickAlcoholRiskOfReoffending() {
    await this.page.locator('#alcohol_use_practitioner_analysis_risk_of_reoffending-2').check();
  }

  async checkAlcoholSectionCompleteIconDisplays() {
    await expect(this.page.getByRole('link', { name: 'Alcohol use ✓' })).toBeVisible();
  }

  // Health and wellbeing

  async tickHealthPhysicalHealthCondition() {
    await this.page.locator('#health_wellbeing_physical_health_condition').check();
  }

  async tickMentalHealthCondition() {
    await this.page.locator('#health_wellbeing_mental_health_condition').check();
  }

  async tickPsychiatricTreatment() {
    await this.page.locator('#health_wellbeing_psychiatric_treatment').check();
  }

  async tickHeadInjury() {
    await this.page.locator('#health_wellbeing_head_injury_or_illness').check();
  }

  async tickNeuroDiverseCondition() {
    await this.page.locator('#health_wellbeing_neurodiverse_conditions').check();
  }

  async tickLearningDifficulties() {
    await this.page.locator('#health_wellbeing_learning_difficulties').check();
  }

  async tickCoping() {
    await this.page.locator('#health_wellbeing_coping_day_to_day_life').check();
  }

  async tickAttitudeTowardsSelf() {
    await this.page.locator('#health_wellbeing_attitude_towards_self').check();
  }

  async tickNoSelfHarm() {
    await this.page.locator('#health_wellbeing_self_harmed-2').check();
  }

  async tickNoSuicidalThoughts() {
    await this.page.locator('#health_wellbeing_attempted_suicide_or_suicidal_thoughts-2').check();
  }

  async tickOptimisticAboutFuture() {
    await this.page.locator('#health_wellbeing_outlook').check();
  }

  async tickHealthPositiveFactors() {
    await this.page.locator('#health_wellbeing_positive_factors').check();
  }

  async tickHealthAlreadyMakingChanges() {
    await this.page.locator('#health_wellbeing_changes').check();
  }

  async tickHealthFactors() {
    await this.page.locator('#health_wellbeing_practitioner_analysis_strengths_or_protective_factors-2').check();
  }

  async tickHealthRiskOfHarm() {
    await this.page.locator('#health_wellbeing_practitioner_analysis_risk_of_serious_harm-2').check();
  }

  async tickHealthRiskOfReoffending() {
    await this.page.locator('#health_wellbeing_practitioner_analysis_risk_of_reoffending-2').check();
  }

  async checkHealthSectionCompleteIconDisplays() {
    await expect(this.page.getByRole('link', { name: 'Health and wellbeing ✓' })).toBeVisible();
  }

  // Personal relationships and community

  async clickPersonalRelationshipsLeftNavLink() {
    await this.page.getByRole('link', { name: 'Personal relationships and community' }).click();
  }

  async tickYesChildrenLiving() {
    await this.page.locator('#personal_relationships_community_children_details').check();
  }

  async changeYesChildrenLiving() {
    await this.page.getByRole('link', { name: 'Change  value for Are there' }).click();
  }

  async fillInInfoAboutChildren() {
    await this.page
      .locator('#personal_relationships_community_children_details_yes_children_living_with_pop_details')
      .fill('child 1');
  }

  async tickPartnerImportantPeople() {
    await this.page.locator('#personal_relationships_community_important_people').check();
  }

  async tickHappyWithRelationship() {
    await this.page.locator('#personal_relationships_community_current_relationship').check();
  }

  async tickStableRelationship() {
    await this.page.locator('#personal_relationships_community_intimate_relationship').check();
  }

  async tickStableFamilyRelationship() {
    await this.page.locator('#personal_relationships_community_family_relationship').check();
  }

  async enterChallengesInRelationshipsDetails() {
    await this.page
      .locator('#personal_relationships_community_challenges_intimate_relationship')
      .fill('person is comfortable addressing challenges.');
  }

  async tickPositiveChildhood() {
    await this.page.locator('#personal_relationships_community_childhood').check();
  }

  async tickChildBehaviouralProblem() {
    await this.page.locator('#personal_relationships_community_childhood_behaviour').check();
  }

  async tickPersonalRelationshipsAlreadyMakingChanges() {
    await this.page.locator('#personal_relationships_community_changes').check();
  }

  async tickPersonalRelationshipsFactors() {
    await this.page
      .locator('#personal_relationships_community_practitioner_analysis_strengths_or_protective_factors-2')
      .check();
  }

  async tickPersonalRelationshipsRiskOfHarm() {
    await this.page.locator('#personal_relationships_community_practitioner_analysis_risk_of_serious_harm-2').check();
  }

  async tickPersonalRelationshipsRiskOfReoffending() {
    await this.page.locator('#personal_relationships_community_practitioner_analysis_risk_of_reoffending-2').check();
  }

  async checkPersonalRelationshipsSectionCompleteIconDisplays() {
    await expect(this.page.getByRole('link', { name: 'Personal relationships and community ✓' })).toBeVisible();
  }

  // Thinking, behaviours and attitudes

  async clickThinkingAndAttitudesLeftNavLink() {
    await this.page.getByRole('link', { name: 'Thinking, behaviours and attitudes' }).click();
  }

  async tickAwareOfConsequences() {
    await this.page.locator('#thinking_behaviours_attitudes_consequences').check();
  }

  async tickShowsStableBehaviour() {
    await this.page.locator('#thinking_behaviours_attitudes_stable_behaviour').check();
  }

  async tickEngagesInActivities() {
    await this.page.locator('#thinking_behaviours_attitudes_offending_activities').check();
  }

  async tickResilientTowardsPeerPressure() {
    await this.page.locator('#thinking_behaviours_attitudes_peer_pressure').check();
  }

  async tickAbleToSolveProblems() {
    await this.page.locator('#thinking_behaviours_attitudes_problem_solving').check();
  }

  async tickUnderstandsPeoplesViews() {
    await this.page.locator('#thinking_behaviours_attitudes_peoples_views').check();
  }

  async tickNoManipulativeBehaviour() {
    await this.page.locator('#thinking_behaviours_attitudes_manipulative_predatory_behaviour').check();
  }

  async tickNoSexualRiskToOthers() {
    await this.page.locator('#thinking_behaviours_attitudes_risk_sexual_harm-2').check();
  }

  async tickNoSexualPreoccupations() {
    await this.page.locator('#thinking_behaviours_attitudes_sexual_preoccupation-3').check();
  }

  async tickNoSexualInterest() {
    await this.page.locator('#thinking_behaviours_attitudes_offence_related_sexual_interest-3').check();
  }

  async tickSeeksEmotionalIntimacyWithAdults() {
    await this.page.locator('#thinking_behaviours_attitudes_emotional_intimacy-3').check();
  }

  async tickTemperManagement() {
    await this.page.locator('#thinking_behaviours_attitudes_temper_management').check();
  }

  async tickDoesntUseViolence() {
    await this.page.locator('#thinking_behaviours_attitudes_violence_controlling_behaviour').check();
  }

  async tickImpulsiveBehaviour() {
    await this.page.locator('#thinking_behaviours_attitudes_impulsive_behaviour').check();
  }

  async tickPositiveAttitude() {
    await this.page.locator('#thinking_behaviours_attitudes_positive_attitude').check();
  }

  async tickAbleToHaveConstructiveConversations() {
    await this.page.locator('#thinking_behaviours_attitudes_hostile_orientation').check();
  }

  async tickAcceptsSupervision() {
    await this.page.locator('#thinking_behaviours_attitudes_supervision').check();
  }

  async tickDoesntSupportCriminalBehaviour() {
    await this.page.locator('#thinking_behaviours_attitudes_criminal_behaviour').check();
  }

  async tickThinkingBehaviourAlreadyMakingChanges() {
    await this.page.locator('#thinking_behaviours_attitudes_changes').check();
  }

  async tickThinkingBehaviourFactors() {
    await this.page
      .locator('#thinking_behaviours_attitudes_practitioner_analysis_strengths_or_protective_factors')
      .check();
  }

  async fillProtectiveFactorsComment() {
    await this.page
      .locator('#thinking_behaviours_attitudes_practitioner_analysis_strengths_or_protective_factors_yes_details')
      .fill('Yes comment to thinking and behaviour protective factors');
  }

  async tickThinkingBehaviourRiskOfHarm() {
    await this.page.locator('#thinking_behaviours_attitudes_practitioner_analysis_risk_of_serious_harm-2').check();
  }

  async tickThinkingBehaviourRiskOfReoffending() {
    await this.page.locator('#thinking_behaviours_attitudes_practitioner_analysis_risk_of_reoffending-2').check();
  }

  async checkThinkingBehaviourSectionCompleteIconDisplays() {
    await expect(this.page.getByRole('link', { name: 'Thinking, behaviours and attitudes ✓' })).toBeVisible();
  }

  // Offence analysis

  async clickOffenceAnalysisLeftNavLink() {
    await this.page.getByRole('link', { name: 'Offence analysis' }).click();
  }

  async fillBriefDescription() {
    await this.page
      .locator('#offence_analysis_description_of_offence')
      .fill('This is a brief description for the offence analysis.');
  }

  async tickWeapon() {
    await this.page.locator('#offence_analysis_elements-9').check();
  }

  async fillReasonForOffence() {
    await this.page.locator('#offence_analysis_reason').fill('This is why this took place.');
  }

  async tickThrillSeeking() {
    await this.page.locator('#offence_analysis_motivations-8').check();
  }

  async tickOneOrMorePeople() {
    await this.page.locator('#offence_analysis_who_was_the_victim').check();
  }

  async tickVictimIsAStranger() {
    await this.page.locator('#offence_analysis_victim_relationship').check();
  }

  async tickVictimAge50to64() {
    await this.page.locator('#offence_analysis_victim_age-8').check();
  }

  async tickVictimUnknownGender() {
    await this.page.locator('#offence_analysis_victim_sex-4').check();
  }

  async selectVictimsRace() {
    // select option from dropdown
    await this.page.locator('#offence_analysis_victim_race').selectOption('White - Gypsy or Irish Traveller');
  }

  async tickNoneInvolved() {
    await this.page.locator('#offence_analysis_how_many_involved').check();
  }

  async tickRealizesImpactOnVictims() {
    await this.page.locator('#offence_analysis_impact_on_victims').check();
  }

  async tickAcceptsResponsibility() {
    await this.page.locator('#offence_analysis_accept_responsibility').check();
  }

  async fillPatternsOfOffending() {
    await this.page
      .locator('#offence_analysis_patterns_of_offending')
      .fill('There are no obvious patterns at this point.');
  }

  async tickNotApplicableEscalation() {
    await this.page.locator('#offence_analysis_escalation-3').check();
  }

  async tickNoToriskOfSeriousHarm() {
    await this.page.locator('#offence_analysis_risk-2').check();
  }

  async fillDetailsAboutNoRiskOfSeriousHarm() {
    await this.page.locator('#offence_analysis_risk_no_details').fill('No risk of serious harm.');
  }

  async tickNoToPerpetratorOfDomestic() {
    await this.page.locator('#offence_analysis_perpetrator_of_domestic_abuse-2').check();
  }

  async tickNoToBeingAVictim() {
    await this.page.locator('#offence_analysis_victim_of_domestic_abuse-2').check();
  }

  async confirmUserIsOnOffenceAnalysisPage() {
    await expect(this.page.getByRole('heading', { name: 'Offence analysis' })).toBeVisible();
    await expect(this.page.getByText('Complete', { exact: true })).toBeVisible();
  }
}
