import { browser } from 'k6/browser';
import { check } from 'k6';
import http from 'k6/http';
import { sleep } from 'k6';

const testStubUrl = 'https://arns-oastub-test.hmpps.service.justice.gov.uk/';
const TARGET_URL = __ENV.TARGET_URL || testStubUrl;

function simulateThinkingTime() {
  sleep(1 + Math.random() * 3);
}


const SCENARIOS = (__ENV.SCENARIO || 'smoke').split(',').map(s => s.trim());
// splitting scenarios into a list to set which api test to run alongside the browser test

//#region options
export const options = {
  scenarios: (function () {
    const scenarios = {};

    if (SCENARIOS.includes('extract')) {
      scenarios.extract = {
        executor: 'shared-iterations',
        exec: 'extractUrl',
        vus: 1,
        iterations: 1,
        maxDuration: '30s',
        options: {
          browser: {
            type: 'chromium',
            headless: true,
          },
        },
      };
    }

    if (SCENARIOS.includes('browser')) {
      scenarios.browser = {
        executor: 'constant-vus',
        exec: 'browserTest',
        vus: 3,
        duration: '5m',
        // adjust the above value as needed if you need to run browser an API scenarios together 
        options: {
          browser: {
            type: 'chromium',
            headless: false,
          },
        },
      };
    }

    if (SCENARIOS.includes('load')) {
      scenarios.api = {
        executor: 'ramping-vus',
        exec: 'runIfLoad',
        // High load
        stages: [
          { duration: '2m', target: 1000 },  // Ramp up to 1k VUs in 2 minutes
          { duration: '3m', target: 2000 },  // Ramp up to 2k VUs in 3 minutes
          { duration: '2m', target: 3000 },  // Ramp to 3k VUs in 2 minutes
          { duration: '5m', target: 3000 },  // Hold at 3k VUs for 5 minutes
          { duration: '2m', target: 0 },     // Ramp down to 0
        ],
        // Lower load
        /*stages: [
         { duration: '1m', target: 50 },   // ramp to 50 users
         { duration: '2m', target: 150 },  // ramp to 150 users
         { duration: '2m', target: 300 },  // ramp to 300 users
         { duration: '2m', target: 300 },  // hold at 300
         { duration: '1m', target: 0 },    // ramp down
       ],*/
        gracefulRampDown: '1m',
      };
    }

    if (SCENARIOS.includes('soak')) {
      scenarios.api = {
        executor: 'constant-vus',
        exec: 'runIfSoak',
        vus: 50,
        duration: '1h',
      };
    }

    if (SCENARIOS.includes('smoke')) {
      scenarios.api = {
        executor: 'shared-iterations',
        exec: 'runIfSmoke',
        vus: 1,
        iterations: 1,
        maxDuration: '15s',
      };
    }
    if (SCENARIOS.includes('stress')) {
      scenarios.api = {
        executor: 'ramping-vus',
        exec: 'runIfStress',
        startVUs: 0,
        stages: [
          { duration: '1m', target: 1000 },  // ramp to 1k users
          { duration: '1m', target: 2000 },  // ramp to 2k users
          { duration: '1m', target: 3000 },  // ramp to 3k users
          { duration: '2m', target: 3500 },  // push beyond expected peak
          { duration: '2m', target: 3500 },  // hold to observe system under stress
          { duration: '1m', target: 0 },     // ramp down
        ],
        gracefulRampDown: '30s',
      };
    }
    return scenarios;
  })(),

  thresholds: {
    browser_http_req_failed: ['rate<0.01'], // http errors should be less than 1%
    browser_http_req_duration: ['p(90)<200', 'p(95)<500'], // 90% of requests should be below 200ms / 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'], // http errors should be less than 1%
    http_req_duration: ['p(95)<200'], // 95% of requests should be below 200ms
  },
};
//#endregion

//#region browser test

export async function browserTest() {
  const stubPage = await browser.newPage();

  try {
    await stubPage.goto(TARGET_URL, { waitUntil: 'networkidle' });

    // Access SAN assessment
    await stubPage.locator('//*[@id="target-service"]').selectOption('strengths-and-needs-assessment');
    await stubPage.locator('//*[@id="form"]/div[1]/div/div[1]/button').click();
    simulateThinkingTime(); // simulate thinking time
    await stubPage.locator('//*[@id="main-content"]/div[3]/div/div/div[2]/a').click();
    simulateThinkingTime();

    // Move driver
    const pages = browser.context().pages();
    const sanPage = pages[pages.length - 1];

    await sanPage.bringToFront();
    console.log('Current URL after switching: ', sanPage.url())
    console.log(sanPage.title());
    console.log("=========================");

    // Confirm privacy data and submit form
    await sanPage.locator('//*[@id="privacy_screen_declaration"]').check();
    simulateThinkingTime();
    await sanPage.locator('//*[@id="confirm-privacy-form"]/div[2]/button').click();

    // Select No accomodation
    await sanPage.locator('#current_accommodation-3').check();
    simulateThinkingTime();

    // Select emergency hostel
    await sanPage.locator('#type_of_no_accommodation-2').check();
    simulateThinkingTime();

    // Submit form
    await sanPage.locator('//*[@id="form"]/div[2]/button').click();
    simulateThinkingTime();

    // Submit no accomodation form
    await sanPage.locator('//*[@id="no_accommodation_reason-6"]').check();
    simulateThinkingTime();
    await sanPage.locator('//*[@id="suitable_housing_planned-3"]').check();
    simulateThinkingTime();
    await sanPage.locator('//*[@id="accommodation_changes-4"]').check();
    simulateThinkingTime();
    await sanPage.locator('//*[@id="form"]/div[5]/button').click();

    // Submit practitioner analysis
    await sanPage.locator('//*[@id="tab_practitioner-analysis"]').click();
    simulateThinkingTime();
    await sanPage.locator('//*[@id="accommodation_practitioner_analysis_strengths_or_protective_factors-2"]').check();
    simulateThinkingTime();
    await sanPage.locator('//*[@id="accommodation_practitioner_analysis_risk_of_serious_harm-2"]').check();
    simulateThinkingTime();
    await sanPage.locator('//*[@id="accommodation_practitioner_analysis_risk_of_reoffending"]').check();
    simulateThinkingTime();
    await sanPage.locator('//*[@id="accommodation_practitioner_analysis_risk_of_reoffending_yes_details"]').type('Performance test');
    simulateThinkingTime();
    await sanPage.locator('//*[@id="form"]/div[4]/button').click();
    sleep(3);

    // Move onto Employment and education section
    await sanPage.locator('//*[@id="main-content"]/div/div[4]/div[1]/nav/ul/li[2]/a').click();
    simulateThinkingTime();
    await sanPage.locator('//*[@id="employment_status-2"]').check();
    simulateThinkingTime();
    await sanPage.locator('//*[@id="form"]/div[2]/button').click();
    simulateThinkingTime();

    await sanPage.locator('//*[@id="employment_other_responsibilities"]').check();
    simulateThinkingTime();
    await sanPage.locator('//*[@id="employment_history"]').click();
    simulateThinkingTime();
    await sanPage.locator('//*[@id="education_highest_level_completed-8"]').check();
    simulateThinkingTime();
    await sanPage.locator('//*[@id="education_professional_or_vocational_qualifications-4"]').check();
    simulateThinkingTime();
    await sanPage.locator('//*[@id="education_transferable_skills-2"]').check();
    simulateThinkingTime();
    await sanPage.locator('//*[@id="education_difficulties-5"]').check();
    simulateThinkingTime();
    await sanPage.locator('//*[@id="employment_experience"]').check();
    simulateThinkingTime();
    await sanPage.locator('//*[@id="education_experience"]').check();
    simulateThinkingTime();
    await sanPage.locator('//*[@id="employment_education_changes-3"]').check();
    simulateThinkingTime();

    // Submit form
    await sanPage.locator('//*[@id="form"]/div[11]/button').click();
    simulateThinkingTime();

    // Submit practitioner analysis
    await sanPage.locator('//*[@id="tab_practitioner-analysis"]').click();
    simulateThinkingTime();
    await sanPage.locator('//*[@id="employment_education_practitioner_analysis_strengths_or_protective_factors-2"]').check();
    simulateThinkingTime();
    await sanPage.locator('//*[@id="employment_education_practitioner_analysis_risk_of_serious_harm-2"]').check();
    simulateThinkingTime();
    await sanPage.locator('//*[@id="employment_education_practitioner_analysis_risk_of_reoffending"]').check();
    simulateThinkingTime();
    await sanPage.locator('//*[@id="employment_education_practitioner_analysis_risk_of_reoffending_yes_details"]').type('Performance test');
    simulateThinkingTime();
    await sanPage.locator('//*[@id="form"]/div[4]/button').click();
    sleep(3);

  } finally {
    await page.close();
  }
}
//#endregion

//#region extract handover url 

export async function extractUrl() {
  const page = await browser.newPage();
  try {
    await page.goto(TARGET_URL, { waitUntil: 'networkidle' });

    await page.locator('//*[@id="target-service"]').selectOption('strengths-and-needs-assessment');
    await page.locator('//*[@id="form"]/div[1]/div/div[1]/button').click();
    sleep(1);

    // Get one-time link
    const element = await page.locator('//*[@id="one-time-link"]');
    await element.waitFor();

    // Get the value
    const extractedUrl = await element.getAttribute('value');
    console.log(`EXTRACTED_URL=${extractedUrl}`);

  } finally {
    await page.close();
  }
}

//#endregion

//#region api test
export function apiTest() {

  const extractedUrl = __ENV.EXTRACTED_URL;
  const res = http.get(extractedUrl);

  check(res, {
    'status is 200': (r) => r.status === 200,
  });
  sleep(1); // can comment out when running stress scenario
}

export function runIfLoad() { apiTest(); }
export function runIfSoak() { apiTest(); }
export function runIfSmoke() { apiTest(); }
export function runIfStress() { apiTest(); }

//#endregion