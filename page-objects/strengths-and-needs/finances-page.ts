import { Locator, Page } from '@playwright/test';
import { AapPage } from './aap-page';

export default class FinancesPage extends AapPage {
  // Finances
  readonly financeIncome: Locator;
  readonly financeBankAccount: Locator;
  readonly financeMoneyManagement: Locator;
  readonly financeGambling: Locator;
  readonly financeDebt: Locator;
  readonly financeTypeOfDebt: Locator;

  constructor(page: Page) {
    super(page);
    // Finances
    this.financeIncome = page.getByRole('checkbox', { name: 'Carer’s allowance' });
    this.financeBankAccount = page.getByRole('radio', { name: 'Yes' });
    this.financeMoneyManagement = page.getByRole('radio', {
      name: 'Able to manage their money well and is a strength',
    });
    this.financeGambling = page.getByRole('checkbox', { name: 'Yes, their own gambling' });
    this.financeDebt = page.getByRole('checkbox', { name: 'Yes, their own debt' });
    this.financeTypeOfDebt = page.getByRole('checkbox', { name: 'Debt to others' });
  }

  async complete() {
    await this.financeIncome.check();
    await this.financeBankAccount.check();
    await this.financeMoneyManagement.check();
    await this.financeGambling.check();
    await this.financeDebt.check();
    await this.financeTypeOfDebt.check();
    await this.changesNotApplicable.check();
    await this.saveAndContinue.click();

    await this.completePractionerAnalysis();
    await this.sectionComplete('Finances');
  }
}
