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
  readonly accommodationFactorsYes: Locator;
  readonly accommodationRiskOfHarmYes: Locator;
  readonly accommodationRiskOfReoffendingYes: Locator;
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

  // Employment
  readonly employmentStatus: Locator;
  readonly employmentType: Locator;
  readonly employmentHistory: Locator;
  readonly employmentOtherResponsibilities: Locator;
  readonly educationHighestLevelCompleted: Locator;
  readonly educationProfessionalOrVocationalQualifications: Locator;
  readonly educationTransferableSkills: Locator;
  readonly educationDifficulties: Locator;
  readonly employmentExperience: Locator;
  readonly educationExperience: Locator;
  readonly employmentEducationChanges: Locator;
  readonly employmentEducationFactors: Locator;
  readonly employmentEducationRiskOfHarm: Locator;
  readonly employmentEducationRiskOfReoffending: Locator;
  readonly employmentComplete: Locator;

  // Finances
  readonly financeIncome: Locator;
  readonly financeBankAccount: Locator;
  readonly financeMoneyManagement: Locator;
  readonly financeGambling: Locator;
  readonly financeDebt: Locator;
  readonly financeTypeOfDebt: Locator;
  readonly financeChanges: Locator;
  readonly financeFactors: Locator;
  readonly financeRiskOfHarm: Locator;
  readonly financeRiskOfReoffending: Locator;
  readonly financeComplete: Locator;

  // Drug Use
  readonly drugUseYes: Locator;
  readonly drugUseNo: Locator;
  readonly drugLastUsed: Locator;
  readonly drugMisused: Locator;
  readonly drugFrequency: Locator;
  readonly drugInjected: Locator;
  readonly drugReceivingTreatment: Locator;
  readonly drugReasonsForUse: Locator;
  readonly drugAffectedLife: Locator;
  readonly drugUseChanges: Locator;
  readonly drugMotivatedToStop: Locator;
  readonly drugMotivationError: Locator;
  readonly drugMotivationErrorMessage: Locator;
  readonly drugFactors: Locator;
  readonly drugRiskOfHarm: Locator;
  readonly drugRiskOfReoffending: Locator;
  readonly drugComplete: Locator;

  // Alcohol Use
  readonly alcoholUseNo: Locator;
  readonly alcoholFactors: Locator;
  readonly alcoholRiskOfHarm: Locator;
  readonly alcoholRiskOfReoffending: Locator;
  readonly alcoholComplete: Locator;

  // Health and Wellbeing
  readonly physicalHealthCondition: Locator;
  readonly mentalHealthCondition: Locator;
  readonly psychiatricTreatment: Locator;
  readonly headInjury: Locator;
  readonly neurodiverseConditions: Locator;
  readonly learningDifficulties: Locator;
  readonly healthCoping: Locator;
  readonly attitudeTowardsSelf: Locator;
  readonly selfHarmed: Locator;
  readonly attemptedSuicide: Locator;
  readonly healthOutlook: Locator;
  readonly healthPositiveFactors: Locator;
  readonly healthChanges: Locator;
  readonly healthFactors: Locator;
  readonly healthRiskOfHarm: Locator;
  readonly healthRiskOfReoffending: Locator;
  readonly healthComplete: Locator;

  // Personal Relationships and Community
  readonly childrenDetails: Locator;
  readonly childrenDetailsChange: Locator;
  readonly childrenLivingWithPopDetails: Locator;
  readonly importantPeople: Locator;
  readonly currentRelationship: Locator;
  readonly intimateRelationship: Locator;
  readonly familyRelationship: Locator;
  readonly challengesIntimateRelationship: Locator;
  readonly childhood: Locator;
  readonly childhoodBehaviour: Locator;
  readonly personalRelationshipsChanges: Locator;
  readonly personalRelationshipsFactors: Locator;
  readonly personalRelationshipsRiskOfHarm: Locator;
  readonly personalRelationshipsRiskOfReoffending: Locator;
  readonly personalRelationshipsComplete: Locator;

  // Thinking, Behaviours and Attitudes
  readonly thinkingConsequences: Locator;
  readonly thinkingStableBehaviour: Locator;
  readonly thinkingOffendingActivities: Locator;
  readonly thinkingPeerPressure: Locator;
  readonly thinkingProblemSolving: Locator;
  readonly thinkingPeoplesViews: Locator;
  readonly thinkingManipulativeBehaviour: Locator;
  readonly thinkingRiskSexualHarm: Locator;
  readonly thinkingSexualPreoccupation: Locator;
  readonly thinkingOffenceRelatedSexualInterest: Locator;
  readonly thinkingEmotionalIntimacy: Locator;
  readonly thinkingTemperManagement: Locator;
  readonly thinkingViolenceControllingBehaviour: Locator;
  readonly thinkingImpulsiveBehaviour: Locator;
  readonly thinkingPositiveAttitude: Locator;
  readonly thinkingHostileOrientation: Locator;
  readonly thinkingSupervision: Locator;
  readonly thinkingCriminalBehaviour: Locator;
  readonly thinkingChanges: Locator;
  readonly thinkingFactors: Locator;
  readonly thinkingFactorsDetails: Locator;
  readonly thinkingRiskOfHarm: Locator;
  readonly thinkingRiskOfReoffending: Locator;
  readonly thinkingComplete: Locator;

  // Offence Analysis
  readonly offenceDescription: Locator;
  readonly offenceElements: Locator;
  readonly offenceReason: Locator;
  readonly offenceMotivations: Locator;
  readonly offenceVictim: Locator;
  readonly offenceVictimRelationship: Locator;
  readonly offenceVictimAge: Locator;
  readonly offenceVictimSex: Locator;
  readonly offenceVictimRace: Locator;
  readonly offenceHowManyInvolved: Locator;
  readonly offenceImpactOnVictims: Locator;
  readonly offenceAcceptResponsibility: Locator;
  readonly offencePatternsOfOffending: Locator;
  readonly offenceEscalation: Locator;
  readonly offenceRisk: Locator;
  readonly offenceRiskDetails: Locator;
  readonly offencePerpetratorDomesticAbuse: Locator;
  readonly offenceVictimDomesticAbuse: Locator;
  readonly offenceAnalysisHeading: Locator;
  readonly offenceAnalysisComplete: Locator;

  // Others
  readonly summaryTab: Locator;
  readonly goToPractitionerAnalysis: Locator;
  readonly accommodationFactorsChange: Locator;
  readonly accommodationRiskOfHarmChange: Locator;
  readonly accommodationRiskOfReoffendingChange: Locator;
  readonly shelterAnswer: Locator;
  readonly campsiteAnswer: Locator;
  readonly accommodationTypeChange: Locator;
  readonly accommodationWhyChange: Locator;
  readonly employmentHistoryUnknownDetails: Locator;

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
    this.accommodationFactorsYes = page.locator('#accommodation_practitioner_analysis_strengths_or_protective_factors');
    this.accommodationRiskOfHarmYes = page.locator('#accommodation_practitioner_analysis_risk_of_serious_harm');
    this.accommodationRiskOfReoffendingYes = page.locator('#accommodation_practitioner_analysis_risk_of_reoffending');
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

    // Employment
    this.employmentStatus = page.locator('#employment_status');
    this.employmentType = page.locator('#employment_type');
    this.employmentHistory = page.locator('#employment_history');
    this.employmentOtherResponsibilities = page.locator('#employment_other_responsibilities');
    this.educationHighestLevelCompleted = page.locator('#education_highest_level_completed');
    this.educationProfessionalOrVocationalQualifications = page.locator(
      '#education_professional_or_vocational_qualifications-2'
    );
    this.educationTransferableSkills = page.locator('#education_transferable_skills');
    this.educationDifficulties = page.locator('#education_difficulties-5');
    this.employmentExperience = page.locator('#employment_experience');
    this.educationExperience = page.locator('#education_experience');
    this.employmentEducationChanges = page.locator('#employment_education_changes');
    this.employmentEducationFactors = page.locator(
      '#employment_education_practitioner_analysis_strengths_or_protective_factors-2'
    );
    this.employmentEducationRiskOfHarm = page.locator(
      '#employment_education_practitioner_analysis_risk_of_serious_harm-2'
    );
    this.employmentEducationRiskOfReoffending = page.locator(
      '#employment_education_practitioner_analysis_risk_of_reoffending-2'
    );
    this.employmentComplete = page.getByRole('link', { name: 'Employment and education ✓' });

    // Finances
    this.financeIncome = page.locator('#finance_income');
    this.financeBankAccount = page.locator('#finance_bank_account');
    this.financeMoneyManagement = page.locator('#finance_money_management');
    this.financeGambling = page.locator('#finance_gambling');
    this.financeDebt = page.locator('#finance_debt');
    this.financeTypeOfDebt = page.locator('#yes_type_of_debt');
    this.financeChanges = page.locator('#finance_changes');
    this.financeFactors = page.locator('#finance_practitioner_analysis_strengths_or_protective_factors-2');
    this.financeRiskOfHarm = page.locator('#finance_practitioner_analysis_risk_of_serious_harm-2');
    this.financeRiskOfReoffending = page.locator('#finance_practitioner_analysis_risk_of_reoffending-2');
    this.financeComplete = page.getByRole('link', { name: 'Finances ✓' });

    // Drug Use
    this.drugUseYes = page.locator('#drug_use');
    this.drugUseNo = page.locator('#drug_use-2');
    this.drugLastUsed = page.locator('#drug_last_used_amphetamines');
    this.drugMisused = page.locator('#select_misused_drugs');
    this.drugFrequency = page.locator('#how_often_used_last_six_months_amphetamines');
    this.drugInjected = page.locator('#drugs_injected');
    this.drugReceivingTreatment = page.locator('#drugs_is_receiving_treatment-2');
    this.drugReasonsForUse = page.locator('#drugs_reasons_for_use');
    this.drugAffectedLife = page.locator('#drugs_affected_their_life');
    this.drugUseChanges = page.locator('#drug_use_changes-10');
    this.drugMotivatedToStop = page.locator('#drugs_practitioner_analysis_motivated_to_stop');
    this.drugMotivationError = page
      .locator('#main-content div')
      .filter({ hasText: 'There is a problem Select if' })
      .nth(3);
    this.drugMotivationErrorMessage = page.locator('#drugs_practitioner_analysis_motivated_to_stop-error');
    this.drugFactors = page.locator('#drug_use_practitioner_analysis_strengths_or_protective_factors-2');
    this.drugRiskOfHarm = page.locator('#drug_use_practitioner_analysis_risk_of_serious_harm-2');
    this.drugRiskOfReoffending = page.locator('#drug_use_practitioner_analysis_risk_of_reoffending-2');
    this.drugComplete = page.getByRole('link', { name: 'Drug use ✓' });

    // Alcohol Use
    this.alcoholUseNo = page.locator('#alcohol_use-3');
    this.alcoholFactors = page.locator('#alcohol_use_practitioner_analysis_strengths_or_protective_factors-2');
    this.alcoholRiskOfHarm = page.locator('#alcohol_use_practitioner_analysis_risk_of_serious_harm-2');
    this.alcoholRiskOfReoffending = page.locator('#alcohol_use_practitioner_analysis_risk_of_reoffending-2');
    this.alcoholComplete = page.getByRole('link', { name: 'Alcohol use ✓' });

    // Health and Wellbeing
    this.physicalHealthCondition = page.locator('#health_wellbeing_physical_health_condition');
    this.mentalHealthCondition = page.locator('#health_wellbeing_mental_health_condition');
    this.psychiatricTreatment = page.locator('#health_wellbeing_psychiatric_treatment');
    this.headInjury = page.locator('#health_wellbeing_head_injury_or_illness');
    this.neurodiverseConditions = page.locator('#health_wellbeing_neurodiverse_conditions');
    this.learningDifficulties = page.locator('#health_wellbeing_learning_difficulties');
    this.healthCoping = page.locator('#health_wellbeing_coping_day_to_day_life');
    this.attitudeTowardsSelf = page.locator('#health_wellbeing_attitude_towards_self');
    this.selfHarmed = page.locator('#health_wellbeing_self_harmed-2');
    this.attemptedSuicide = page.locator('#health_wellbeing_attempted_suicide_or_suicidal_thoughts-2');
    this.healthOutlook = page.locator('#health_wellbeing_outlook');
    this.healthPositiveFactors = page.locator('#health_wellbeing_positive_factors');
    this.healthChanges = page.locator('#health_wellbeing_changes');
    this.healthFactors = page.locator('#health_wellbeing_practitioner_analysis_strengths_or_protective_factors-2');
    this.healthRiskOfHarm = page.locator('#health_wellbeing_practitioner_analysis_risk_of_serious_harm-2');
    this.healthRiskOfReoffending = page.locator('#health_wellbeing_practitioner_analysis_risk_of_reoffending-2');
    this.healthComplete = page.getByRole('link', { name: 'Health and wellbeing ✓' });

    // Personal Relationships and Community
    this.childrenDetails = page.locator('#personal_relationships_community_children_details');
    this.childrenDetailsChange = page.getByRole('link', { name: 'Change  value for Are there' });
    this.childrenLivingWithPopDetails = page.locator(
      '#personal_relationships_community_children_details_yes_children_living_with_pop_details'
    );
    this.importantPeople = page.locator('#personal_relationships_community_important_people');
    this.currentRelationship = page.locator('#personal_relationships_community_current_relationship');
    this.intimateRelationship = page.locator('#personal_relationships_community_intimate_relationship');
    this.familyRelationship = page.locator('#personal_relationships_community_family_relationship');
    this.challengesIntimateRelationship = page.locator(
      '#personal_relationships_community_challenges_intimate_relationship'
    );
    this.childhood = page.locator('#personal_relationships_community_childhood');
    this.childhoodBehaviour = page.locator('#personal_relationships_community_childhood_behaviour');
    this.personalRelationshipsChanges = page.locator('#personal_relationships_community_changes');
    this.personalRelationshipsFactors = page.locator(
      '#personal_relationships_community_practitioner_analysis_strengths_or_protective_factors-2'
    );
    this.personalRelationshipsRiskOfHarm = page.locator(
      '#personal_relationships_community_practitioner_analysis_risk_of_serious_harm-2'
    );
    this.personalRelationshipsRiskOfReoffending = page.locator(
      '#personal_relationships_community_practitioner_analysis_risk_of_reoffending-2'
    );
    this.personalRelationshipsComplete = page.getByRole('link', {
      name: 'Personal relationships and community ✓',
    });

    // Thinking, Behaviours and Attitudes
    this.thinkingConsequences = page.locator('#thinking_behaviours_attitudes_consequences');
    this.thinkingStableBehaviour = page.locator('#thinking_behaviours_attitudes_stable_behaviour');
    this.thinkingOffendingActivities = page.locator('#thinking_behaviours_attitudes_offending_activities');
    this.thinkingPeerPressure = page.locator('#thinking_behaviours_attitudes_peer_pressure');
    this.thinkingProblemSolving = page.locator('#thinking_behaviours_attitudes_problem_solving');
    this.thinkingPeoplesViews = page.locator('#thinking_behaviours_attitudes_peoples_views');
    this.thinkingManipulativeBehaviour = page.locator(
      '#thinking_behaviours_attitudes_manipulative_predatory_behaviour'
    );
    this.thinkingRiskSexualHarm = page.getByRole('radio', { name: 'Yes' });

    this.thinkingSexualPreoccupation = page
      .getByRole('group', { name: 'shows sexual preoccupation' })
      .getByLabel('Unknown');
    this.thinkingOffenceRelatedSexualInterest = page
      .getByRole('group', { name: 'offence-related sexual interests' })
      .getByLabel('Unknown');
    this.thinkingEmotionalIntimacy = page
      .getByRole('group', { name: 'emotional intimacy with children' })
      .getByLabel('Unknown');
    this.thinkingTemperManagement = page.locator('#thinking_behaviours_attitudes_temper_management');
    this.thinkingViolenceControllingBehaviour = page.locator(
      '#thinking_behaviours_attitudes_violence_controlling_behaviour'
    );
    this.thinkingImpulsiveBehaviour = page.locator('#thinking_behaviours_attitudes_impulsive_behaviour');
    this.thinkingPositiveAttitude = page.locator('#thinking_behaviours_attitudes_positive_attitude');
    this.thinkingHostileOrientation = page.locator('#thinking_behaviours_attitudes_hostile_orientation');
    this.thinkingSupervision = page.locator('#thinking_behaviours_attitudes_supervision');
    this.thinkingCriminalBehaviour = page.locator('#thinking_behaviours_attitudes_criminal_behaviour');
    this.thinkingChanges = page.locator('#thinking_behaviours_attitudes_changes');
    this.thinkingFactors = page.locator(
      '#thinking_behaviours_attitudes_practitioner_analysis_strengths_or_protective_factors'
    );
    this.thinkingFactorsDetails = page.locator(
      '#thinking_behaviours_attitudes_practitioner_analysis_strengths_or_protective_factors_yes_details'
    );
    this.thinkingRiskOfHarm = page.locator(
      '#thinking_behaviours_attitudes_practitioner_analysis_risk_of_serious_harm-2'
    );
    this.thinkingRiskOfReoffending = page.locator(
      '#thinking_behaviours_attitudes_practitioner_analysis_risk_of_reoffending-2'
    );
    this.thinkingComplete = page.getByRole('link', { name: 'Thinking, behaviours and attitudes ✓' });

    // Offence Analysis
    this.offenceDescription = page.locator('#offence_analysis_description_of_offence');
    this.offenceElements = page.locator('#offence_analysis_elements-9');
    this.offenceReason = page.locator('#offence_analysis_reason');
    this.offenceMotivations = page.locator('#offence_analysis_motivations-8');
    this.offenceVictim = page.locator('#offence_analysis_who_was_the_victim');
    this.offenceVictimRelationship = page.locator('#offence_analysis_victim_relationship');
    this.offenceVictimAge = page.locator('#offence_analysis_victim_age-8');
    this.offenceVictimSex = page.locator('#offence_analysis_victim_sex-4');
    this.offenceVictimRace = page.locator('#offence_analysis_victim_race');
    this.offenceHowManyInvolved = page.locator('#offence_analysis_how_many_involved');
    this.offenceImpactOnVictims = page.locator('#offence_analysis_impact_on_victims');
    this.offenceAcceptResponsibility = page.locator('#offence_analysis_accept_responsibility');
    this.offencePatternsOfOffending = page.locator('#offence_analysis_patterns_of_offending');
    this.offenceEscalation = page.locator('#offence_analysis_escalation-3');
    this.offenceRisk = page.locator('#offence_analysis_risk-2');
    this.offenceRiskDetails = page.locator('#offence_analysis_risk_no_details');
    this.offencePerpetratorDomesticAbuse = page.locator('#offence_analysis_perpetrator_of_domestic_abuse-2');
    this.offenceVictimDomesticAbuse = page.locator('#offence_analysis_victim_of_domestic_abuse-2');
    this.offenceAnalysisHeading = page.getByRole('heading', { name: 'Offence analysis' });
    this.offenceAnalysisComplete = page.getByText('Complete', { exact: true });

    // Others
    this.summaryTab = page.locator('#tab_summary');
    this.goToPractitionerAnalysis = page.getByRole('button', { name: 'Go to practitioner analysis' });
    this.accommodationFactorsChange = page.getByRole('link', { name: 'Change  value for Strengths' });
    this.accommodationRiskOfHarmChange = page.getByRole('link', {
      name: 'Change  value for Linked to risk of serious harm',
    });
    this.accommodationRiskOfReoffendingChange = page.getByRole('link', {
      name: 'Change  value for Linked to risk of reoffending',
    });
    this.shelterAnswer = page.getByLabel('Shelter');
    this.campsiteAnswer = page.getByLabel('Campsite');
    this.accommodationTypeChange = page.getByRole('link', { name: 'Change  value for What type' });
    this.accommodationWhyChange = page.getByRole('link', { name: 'Change  value for Why does' });
    this.employmentHistoryUnknownDetails = page.locator('#employment_history_unknown_details');
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
    await this.employmentStatus.check();
    await this.employmentType.check();
    await this.saveAndContinue.click();

    await this.employmentHistory.check();
    await this.employmentOtherResponsibilities.check();
    await this.educationHighestLevelCompleted.check();
    await this.educationProfessionalOrVocationalQualifications.check();
    await this.educationTransferableSkills.check();
    await this.educationDifficulties.check();
    await this.employmentExperience.check();
    await this.educationExperience.check();
    await this.employmentEducationChanges.check();
    await this.saveAndContinue.click();

    await this.practitionerAnalysis.click();
    await this.employmentEducationFactors.check();
    await this.employmentEducationRiskOfHarm.check();
    await this.employmentEducationRiskOfReoffending.check();
    await this.markAsComplete.click();
    await expect(this.employmentComplete).toBeVisible();
  }

  async completeFinances() {
    await this.financeIncome.check();
    await this.financeBankAccount.check();
    await this.financeMoneyManagement.check();
    await this.financeGambling.check();
    await this.financeDebt.check();
    await this.financeTypeOfDebt.check();
    await this.financeChanges.check();
    await this.saveAndContinue.click();

    await this.practitionerAnalysis.click();
    await this.financeFactors.check();
    await this.financeRiskOfHarm.check();
    await this.financeRiskOfReoffending.check();
    await this.markAsComplete.click();
    await expect(this.financeComplete).toBeVisible();
  }

  async completeDrugUse() {
    await this.drugUseYes.check();
    await this.saveAndContinue.click();

    await this.drugMisused.check();
    await this.drugLastUsed.check();
    await this.saveAndContinue.click();

    await this.drugFrequency.check();
    await this.drugInjected.check();
    await this.drugReceivingTreatment.check();
    await this.saveAndContinue.click();

    await this.drugReasonsForUse.check();
    await this.drugAffectedLife.check();
    await this.drugUseChanges.check();
    await this.saveAndContinue.click();

    await this.practitionerAnalysis.click();
    await this.drugFactors.check();
    await this.drugRiskOfHarm.check();
    await this.drugRiskOfReoffending.check();
    await this.drugMotivatedToStop.check();
    await this.markAsComplete.click();
    await expect(this.drugComplete).toBeVisible();
  }

  async completeAlcoholUse() {
    await this.alcoholUseNo.check();
    await this.saveAndContinue.click();

    await this.practitionerAnalysis.click();
    await this.alcoholFactors.check();
    await this.alcoholRiskOfHarm.check();
    await this.alcoholRiskOfReoffending.check();
    await this.markAsComplete.click();
    await expect(this.alcoholComplete).toBeVisible();
  }

  async completeHealthAndWellbeing() {
    await this.physicalHealthCondition.check();
    await this.mentalHealthCondition.check();
    await this.saveAndContinue.click();
    await this.psychiatricTreatment.check();
    await this.headInjury.check();
    await this.neurodiverseConditions.check();
    await this.learningDifficulties.check();
    await this.healthCoping.check();
    await this.attitudeTowardsSelf.check();
    await this.selfHarmed.check();
    await this.attemptedSuicide.check();
    await this.healthOutlook.check();
    await this.healthPositiveFactors.check();
    await this.healthChanges.check();
    await this.saveAndContinue.click();

    await this.practitionerAnalysis.click();
    await this.healthFactors.check();
    await this.healthRiskOfHarm.check();
    await this.healthRiskOfReoffending.check();
    await this.markAsComplete.click();
    await expect(this.healthComplete).toBeVisible();
  }

  async completePersonalRelationships() {
    await this.childrenDetails.check();
    await this.childrenLivingWithPopDetails.fill('child 1');
    await this.saveAndContinue.click();

    await this.importantPeople.check();
    await this.saveAndContinue.click();

    await this.currentRelationship.check();
    await this.intimateRelationship.check();
    await this.familyRelationship.check();
    await this.challengesIntimateRelationship.fill('person is comfortable addressing challenges.');
    await this.childhood.check();
    await this.childhoodBehaviour.check();
    await this.personalRelationshipsChanges.check();
    await this.saveAndContinue.click();

    await this.practitionerAnalysis.click();
    await this.personalRelationshipsFactors.check();
    await this.personalRelationshipsRiskOfHarm.check();
    await this.personalRelationshipsRiskOfReoffending.check();
    await this.markAsComplete.click();
    await expect(this.personalRelationshipsComplete).toBeVisible();
  }

  async completeBehavioursAndAttitudes() {
    await this.thinkingConsequences.check();
    await this.thinkingStableBehaviour.check();
    await this.thinkingOffendingActivities.check();
    await this.thinkingPeerPressure.check();
    await this.thinkingProblemSolving.check();
    await this.thinkingPeoplesViews.check();
    await this.thinkingManipulativeBehaviour.check();
    await this.thinkingTemperManagement.check();
    await this.thinkingViolenceControllingBehaviour.check();
    await this.thinkingImpulsiveBehaviour.check();
    await this.thinkingPositiveAttitude.check();
    await this.thinkingHostileOrientation.check();
    await this.thinkingSupervision.check();
    await this.thinkingCriminalBehaviour.check();
    await this.thinkingChanges.check();
    await this.saveAndContinue.click();

    await this.thinkingRiskSexualHarm.check();
    await this.saveAndContinue.click();

    await this.thinkingSexualPreoccupation.check();
    await this.thinkingOffenceRelatedSexualInterest.check();
    await this.thinkingEmotionalIntimacy.check();
    await this.saveAndContinue.click();

    await this.practitionerAnalysis.click();
    await this.thinkingFactors.check();
    await this.thinkingFactorsDetails.fill('Yes comment to thinking and behaviour protective factors');
    await this.thinkingRiskOfHarm.check();
    await this.thinkingRiskOfReoffending.check();
    await this.markAsComplete.click();
    await expect(this.thinkingComplete).toBeVisible();
  }

  async completeOffenceAnalysis() {
    await this.offenceDescription.fill('This is a brief description for the offence analysis.');
    await this.offenceElements.check();
    await this.offenceReason.fill('This is why this took place.');
    await this.offenceMotivations.check();
    await this.offenceVictim.check();
    await this.saveAndContinue.click();

    await this.offenceVictimRelationship.check();
    await this.offenceVictimAge.check();
    await this.offenceVictimSex.check();
    await this.offenceVictimRace.selectOption('White - Gypsy or Irish Traveller');
    await this.saveAndContinue.click();
    await this.saveAndContinue.click();

    await this.offenceHowManyInvolved.check();
    await this.saveAndContinue.click();

    await this.offenceImpactOnVictims.check();
    await this.offenceAcceptResponsibility.check();
    await this.offencePatternsOfOffending.fill('There are no obvious patterns at this point.');
    await this.offenceEscalation.check();
    await this.offenceRisk.check();
    await this.offenceRiskDetails.fill('No risk of serious harm.');
    await this.offencePerpetratorDomesticAbuse.check();
    await this.offenceVictimDomesticAbuse.check();
    await this.markAsComplete.click();
  }

  async confirmUserIsOnOffenceAnalysisPage() {
    await expect(this.offenceAnalysisHeading).toBeVisible();
    await expect(this.offenceAnalysisComplete).toBeVisible();
  }
}
