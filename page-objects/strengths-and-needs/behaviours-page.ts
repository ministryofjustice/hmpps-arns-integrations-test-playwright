import { Locator, Page } from '@playwright/test';
import { AapPage } from './aap-page';

export default class BehavioursPage extends AapPage {
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

  constructor(page: Page) {
    super(page);
    // Thinking, Behaviours and Attitudes
    this.thinkingConsequences = page.getByRole('radio', { name: 'Yes, is aware of the' });
    this.thinkingStableBehaviour = page.getByRole('radio', { name: 'Yes, shows stable behaviour' });
    this.thinkingOffendingActivities = page.getByRole('radio', { name: 'Engages in pro-social' });
    this.thinkingPeerPressure = page.getByRole('radio', { name: 'Yes, resilient towards peer' });
    this.thinkingProblemSolving = page.getByRole('radio', { name: 'Yes, is able to solve' });
    this.thinkingPeoplesViews = page.getByRole('radio', { name: 'Yes, understands other people' });
    this.thinkingManipulativeBehaviour = page.getByRole('radio', { name: 'Generally gives an honest' });
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
    this.thinkingTemperManagement = page.getByRole('radio', { name: 'Yes, is able to manage their' });
    this.thinkingViolenceControllingBehaviour = page.getByRole('radio', { name: 'Does not use violence,' });
    this.thinkingImpulsiveBehaviour = page.getByRole('radio', { name: 'Considers all aspects of a' });
    this.thinkingPositiveAttitude = page.getByRole('radio', { name: 'Yes, has a positive attitude' });
    this.thinkingHostileOrientation = page.getByRole('radio', { name: 'They’re able to have' });
    this.thinkingSupervision = page.getByRole('radio', { name: 'Accepts supervision and has' });
    this.thinkingCriminalBehaviour = page.getByRole('radio', { name: 'Does not support or excuse' });
  }

  async complete() {
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
    await this.changesNotApplicable.check();
    await this.saveAndContinue.click();

    await this.thinkingRiskSexualHarm.check();
    await this.saveAndContinue.click();

    await this.thinkingSexualPreoccupation.check();
    await this.thinkingOffenceRelatedSexualInterest.check();
    await this.thinkingEmotionalIntimacy.check();
    await this.saveAndContinue.click();

    await this.completePractionerAnalysis();
    await this.sectionComplete('Thinking, behaviours and attitudes');
  }
}
