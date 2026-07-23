import { Locator, Page } from '@playwright/test';

export class PrintPreviewPage {
  readonly page: Page;
  readonly printHeader: Locator;
  readonly exportPDF: Locator;
  readonly printBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.printBtn = page.getByRole('button', { name: 'Print' });
    this.printHeader = page.locator('[data-qa="print-goal-summary-card"]');
    this.exportPDF = page.getByRole('button', { name: 'Export as PDF' });
  }
}
