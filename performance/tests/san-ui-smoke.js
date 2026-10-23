import { browser } from 'k6/browser';
import { Trend } from 'k6/metrics';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/latest/dist/bundle.js';
import { jUnit, textSummary } from 'https://jslib.k6.io/k6-summary/0.0.2/index.js';

const livingWithVisibleTime = new Trend('accommodation_page_2_visible', true);

export const options = {
  thresholds: {
    checks: ['rate==1.0'],
    accommodation_page_2_visible: ['p(95)<1500'],
  },
  scenarios: {
    ui: {
      executor: 'shared-iterations',
      options: {
        browser: {
          type: 'chromium',
        },
      },
    },
  },
};

export default async function () {
  const page = await browser.newPage();
  
  try {
    const baseUrl = (__ENV.BASE_URL || 'https://arns-assessment-platform-test.hmpps.service.justice.gov.uk').replace(/\/$/, '');
    const privateBetaPath = '/training-session-launcher/browse?scenario=sp-private-beta';

    await page.goto(`${baseUrl}${privateBetaPath}`);

    await page.getByRole('button', { name: 'Start session' }).click();
    await page.locator('[name="targetApplication"]').selectOption('strengths-and-needs');
    await page.locator('button[value="generateLink"]').click();
    await page.getByRole('checkbox', { name: 'I confirm I\'ll do this before' }).check();
    await page.getByRole('button', { name: 'Confirm' }).click();
    
    await page.getByRole('heading', { name: 'Accommodation' }).waitFor({ state: 'visible' });
    await page.getByRole('radio', { name: 'Settled'}).check();
    await page.getByRole('radio', { name: 'Homeowner'}).check();

    await page.getByRole('button', { name: 'Save and continue' }).click();

    await page.getByRole('checkbox', { name: 'Family' }).waitFor({ state: 'visible' });
    await page.evaluate(() => window.performance.mark('living-with-visible'));

    // Marks are cleared on navigation, so measure from this document's navigation start (0)
    await page.evaluate(() =>
      window.performance.measure('accommodation-page-2-visible', {
        start: 0,
        end: 'living-with-visible',
      })
    );

    const accommodationPage2Duration = await page.evaluate(
      () =>
        JSON.parse(
          JSON.stringify(window.performance.getEntriesByName('accommodation-page-2-visible'))
        )[0].duration
    );

    livingWithVisibleTime.add(accommodationPage2Duration);
    
  } finally {
    await page.close();
  }
}

export function handleSummary(data) {
	return {
    'junit.xml': jUnit(data),
		'result.html': htmlReport(data),
		stdout: textSummary(data, { indent: ' ', enableColors: true }),
	};
}
