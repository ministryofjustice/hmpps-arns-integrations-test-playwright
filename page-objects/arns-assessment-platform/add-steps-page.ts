import { Locator, Page } from '@playwright/test';

export class AddStepsPage {
  readonly page: Page;
  readonly chooseSomeone: Locator;
  readonly whatShouldTheyDo: Locator;
  readonly saveAndContinue: Locator;

  constructor(page: Page) {
    this.page = page;
    this.chooseSomeone = page.locator('select');
    this.whatShouldTheyDo = page.getByRole('textbox', { name: 'What should they do to achieve the goal' });
    this.saveAndContinue = page.getByRole('button', { name: 'Save and continue' });
  }

  whoWillDoTheStep = async (who: string) => {
    await this.chooseSomeone.selectOption(who);
  };
}
