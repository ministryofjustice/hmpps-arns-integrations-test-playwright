import { browser } from 'k6/browser';
import { sleep } from 'k6';
import { apiJourney, apiSetup } from './aapApi.js';

export function setup() {
  return apiSetup();
}

const P90_THRESHOLD = __ENV.P90_THRESHOLD ? parseInt(__ENV.P90_THRESHOLD) : 200;
const P95_THRESHOLD = __ENV.P95_THRESHOLD ? parseInt(__ENV.P95_THRESHOLD) : 500;
const VUS = __ENV.VUS ? parseInt(__ENV.VUS) : 5;
const DURATION = __ENV.DURATION || "30s";

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
  const page = browser.newPage();
  
  try {
    //#region navigate to url
    const baseUrl = __ENV.BASE_URL || 'https://arns-assessment-platform-dev.hmpps.service.justice.gov.uk';
    const nationalRolloutPath = '/training-session-launcher/browse?scenario=sp-national-rollout';
    const targetUrl = new URL(nationalRolloutPath, baseUrl).href;
    //#endregion

    await page.goto(targetUrl);
    
    // todo
    // e.g., await page.locator('#login').click();
    
    sleep(2); // Think time for UI
  } finally {
    page.close();
  }
}