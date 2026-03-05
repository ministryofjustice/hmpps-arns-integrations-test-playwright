import { browser } from 'k6/browser';
import { apiJourney, apiSetup, simulateThinkingTime } from './aapApi.js';

export function setup() {
  return apiSetup();
}

const P90_THRESHOLD = __ENV.P90_THRESHOLD ? parseInt(__ENV.P90_THRESHOLD) : 200;
const P95_THRESHOLD = __ENV.P95_THRESHOLD ? parseInt(__ENV.P95_THRESHOLD) : 500;
const VUS = __ENV.VUS ? parseInt(__ENV.VUS) : 400;
const DURATION = __ENV.DURATION || "20m";

export const options = {
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: [`p(95)<${P95_THRESHOLD}`, `p(90)<${P90_THRESHOLD}`],
  },
  scenarios: {
    // API
    api_load: {
      executor: 'constant-vus',
      vus: VUS,
      duration: DURATION,
      exec: 'runApi',
    },
    // UI in parallel
    ui_probe: {
      executor: 'constant-vus',
      vus: 2,
      duration: DURATION,
      options: {
        browser: {
          type: 'chromium',
        },
      },
      exec: 'runUi', 
    },
  },
};

export function runApi(data) {
  apiJourney(data);
}

export async function runUi() {
  const page = await browser.newPage();
  
  try {
    //#region navigate to url
    const baseUrl = (__ENV.BASE_URL || 'https://arns-assessment-platform-dev.hmpps.service.justice.gov.uk').replace(/\/$/, '');
    const nationalRolloutPath = '/training-session-launcher/browse?scenario=sp-national-rollout';
    //#endregion

    await page.goto(`${baseUrl}${nationalRolloutPath}`);
    
    //#region UI journey
    await page.getByRole('button', { name: 'Start session' }).click();
    await page.getByRole('button', { name: 'Generate link' }).click();
    await page.getByRole('checkbox', { name: 'I confirm I\'ll do this before' }).check();
    await page.getByRole('button', { name: 'Confirm' }).click();
    simulateThinkingTime();
    await page.getByRole('button', { name: 'Create goal' }).click();
    simulateThinkingTime();
    await (await page).locator('#goal_title').click();
    await (await page).locator('#goal_title').fill('Hybrid test');
    simulateThinkingTime();
    await page.getByRole('group', { name: 'Is this goal related to any' }).getByLabel('Yes').check();
    await page.getByRole('checkbox', { name: 'Drug use' }).check();
    await page.getByRole('checkbox', { name: 'Employment and education' }).check();
    await page.locator('#can_start_now').check();
    simulateThinkingTime();
    await page.locator('#target_date_option-2').check();
    await page.getByRole('button', { name: 'Add Steps' }).click();
    simulateThinkingTime();
    await page.getByLabel('Who will do the step?').selectOption('probation_practitioner');
    await page.getByRole('textbox', { name: 'What should they do to' }).click();
    await page.getByRole('textbox', { name: 'What should they do to' }).fill('Step one');
    await page.getByRole('button', { name: 'Add another step' }).click();
    simulateThinkingTime();
    await page.locator('#step_actor_1').selectOption('programme_staff');
    await page.locator('#step_description_1').click();
    await page.locator('#step_description_1').fill('Step 2');
    simulateThinkingTime();
    await page.getByRole('button', { name: 'Add another step' }).click();
    await page.locator('#step_actor_2').selectOption('partnership_agency');
    await page.locator('#step_description_2').click();
    await page.locator('#step_description_2').fill('Step 3');
    await page.getByRole('button', { name: 'Save and continue' }).click();
    simulateThinkingTime();
    await page.getByRole('button', { name: 'Agree plan' }).click();
    await page.getByRole('radio', { name: 'Yes, I agree' }).check();
    await page.getByRole('radio', { name: 'No, I do not agree' }).check();
    simulateThinkingTime();
    await page.getByRole('textbox', { name: 'Enter details' }).click();
    await page.getByRole('textbox', { name: 'Enter details' }).fill('No I do not agree');
    simulateThinkingTime();
    await page.getByRole('textbox', { name: 'Add any notes (optional)' }).click();
    await page.getByRole('textbox', { name: 'Add any notes (optional)' }).fill('I do not agree notes');
    simulateThinkingTime();
    await page.getByRole('button', { name: 'Save' }).click();
    await page.getByRole('link', { name: 'Update   (Hybrid test)' }).click();
    await page.getByRole('row', { name: 'Probation practitioner Step' }).getByLabel('Status').selectOption('IN_PROGRESS');
    await page.getByRole('textbox', { name: 'Add notes about progress (' }).click();
    await page.getByRole('textbox', { name: 'Add notes about progress (' }).fill('Progress note');
    simulateThinkingTime();
    await page.getByRole('button', { name: 'Save goal and steps' }).click();
    await page.getByRole('link', { name: 'Plan history', exact: true }).click();
  //#endregion
    
  } finally {
    simulateThinkingTime();
    await page.close();
  }
}