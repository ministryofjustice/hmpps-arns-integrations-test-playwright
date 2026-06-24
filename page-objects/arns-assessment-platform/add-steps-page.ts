import { Locator, Page } from '@playwright/test';

export class AddStepsPage {
  readonly page: Page;
  readonly chooseSomeone: Locator;
  readonly whatShouldTheyDo: Locator;
  readonly saveAndContinue: Locator;
  readonly chooseStatus: Locator;

  constructor(page: Page) {
    this.page = page;
    this.chooseSomeone = page.getByLabel('Who will do the step?');
    this.whatShouldTheyDo = page.getByRole('textbox', { name: 'What should they do to achieve the goal' });
    this.saveAndContinue = page.getByRole('button', { name: 'Save and continue' });
    this.chooseStatus = page.getByRole('button', { name: 'Choose status' });
  }

  whoWillDoTheStep = async (who: string) => {
    await this.chooseSomeone.selectOption(who);
  };

  addStep = async () => {
    await this.whoWillDoTheStep('Probation practitioner');
    await this.whatShouldTheyDo.fill('Step 1');
    await this.addStatus('Not started');
    await this.saveAndContinue.click();
  };

  addStatus = async (status: string) => {
    await this.chooseStatus.click();
    await this.page.getByRole('option', { name: status }).click();
  };
}
