import http from "k6/http";
import { check, sleep } from "k6";
import { Counter } from "k6/metrics";
import { b64encode } from "k6/encoding";

// --- CONFIGURATION ---

// Default to 1s min and 5s max (Smoke Test settings)
const MIN_THINK = __ENV.MIN_THINK_TIME ? parseInt(__ENV.MIN_THINK_TIME) : 1;
const MAX_THINK = __ENV.MAX_THINK_TIME ? parseInt(__ENV.MAX_THINK_TIME) : 5;

export function simulateThinkingTime() {
  const range = MAX_THINK - MIN_THINK;
  sleep(MIN_THINK + Math.random() * range);
}

// Track assessment creation failures
const createFailures = new Counter("create_assessment_failures");

// Default config
const VUS = __ENV.VUS ? parseInt(__ENV.VUS) : 5;
const DURATION = __ENV.DURATION || "30s";
const P90_THRESHOLD = __ENV.P90_THRESHOLD ? parseInt(__ENV.P90_THRESHOLD) : 300;
const P95_THRESHOLD = __ENV.P95_THRESHOLD ? parseInt(__ENV.P95_THRESHOLD) : 500;

const TOKEN_REFRESH_WINDOW = 20 * 60 * 1000; // 20 minutes in milliseconds

const BASE_URL = "https://arns-coordinator-api-dev.hmpps.service.justice.gov.uk";
const crn = Math.random().toString().substring(2, 7);
const oasysPk = Math.floor(Math.random() * 1000000000).toString();
const name = 'Perf Test'

// --- DYNAMIC OPTIONS LOGIC

// 1. Define base options (Thresholds are always needed)
let testOptions = {
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: [`p(95)<${P95_THRESHOLD}`, `p(90)<${P90_THRESHOLD}`],
  },
};

// 2. Determine Profile
if (__ENV.CUSTOM_STAGES) {
  // SCENARIO A: Load / Soak / Stress
  console.log("Running with Custom Stages profile");
  testOptions.stages = JSON.parse(__ENV.CUSTOM_STAGES);
} else {
  // SCENARIO B: Simple Profile (Smoke Test)
  console.log("Running with Fixed Duration profile (Smoke)");
  testOptions.vus = VUS;
  testOptions.duration = DURATION;
}

// Add noConnectionReuse for Soak test
if (__ENV.NO_CONNECTION_REUSE === "true") {
  console.log("Connection reuse DISABLED (Soak Test)");
  testOptions.noConnectionReuse = true;
} else {
  testOptions.noConnectionReuse = false;
}

export const options = testOptions;

// --- AUTHENTICATION ---

function fetchNewToken() {
  const clientId = __ENV.AAP_CLIENT_ID;
  const clientSecret = __ENV.AAP_CLIENT_SECRET;
  const tokenUrl = __ENV.TOKEN_URL;

  if (!clientId || !clientSecret || !tokenUrl) {
    throw new Error(
      "Missing required environment variables: AAP_CLIENT_ID, AAP_CLIENT_SECRET, or TOKEN_URL"
    );
  }

  const encodedCredentials = b64encode(`${clientId}:${clientSecret}`);

  const params = {
    headers: {
      Authorization: `Basic ${encodedCredentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  const payload = "grant_type=client_credentials";
  const res = http.post(tokenUrl, payload, params);

  if (res.status !== 200) {
    console.error(
      `Auth Refresh Failed! Status: ${res.status} Body: ${res.body}`
    );
    throw new Error(`Authentication failed with status ${res.status}`);
  }

  const body = res.json();
  if (!body || !body.access_token) {
    throw new Error("No 'access_token' found in response");
  }

  return body.access_token;
}

export function apiSetup() {
  console.log("Starting AAP initial authentication check...");
  const token = fetchNewToken();

  const create = {
    oasysAssessmentPk: oasysPk,
    planType: 'INITIAL',
    assessmentType: 'SAN_SP',
    userDetails: {
      id: oasysPk,
      name: name,
      location: 'PRISON',
    },
    subjectDetails: {
      crn: crn,
    },
    newPeriodOfSupervision: 'N',
    previousOasysSanPk: undefined,
    previousOasysSpPk: undefined,
    regionPrisonCode: 'MDI',
  };
  const options = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
  const oasysResponse = http.post(`${BASE_URL}/oasys/create`, JSON.stringify(create), options);
  const association = oasysResponse.json()

  console.log("Association: " + JSON.stringify(association));
  console.log("Initial AAP Token retrieved successfully");
  return { initialToken: token, sentencePlanId: association.sentencePlanId };
}

// --- VU STATE ---
let cachedToken = null;
let tokenExpiry = 0;

// --- DEFAULT FUNCTION ---

export function apiJourney (data) {
  const now = Date.now();

  // 1. Initialize Token on First Run
  if (!cachedToken) {
    cachedToken = data.initialToken;
    tokenExpiry = now + TOKEN_REFRESH_WINDOW;
  }

  // 2. Refresh token
  if (now >= tokenExpiry) {
    console.log(`VU ${__VU} token expired. Refreshing...`);

    try {
      const newToken = fetchNewToken();
      cachedToken = newToken;
      tokenExpiry = now + TOKEN_REFRESH_WINDOW;
      console.log(`VU ${__VU} token refreshed successfully.`);
    } catch (e) {
      console.error(
        `VU ${__VU} failed to refresh token. Aborting iteration. Error: ${e.message}`
      );
      createFailures.add(1);
      sleep(5);
      return;
    }
  }

  const TOKEN = cachedToken;

  // Step 1 — Get previous versions
  const versionsResponse = http.get(`${BASE_URL}/entity/versions/${data.sentencePlanId}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  if (versionsResponse.status !== 200) {
    console.error(`NON-200 RESPONSE from /entity/versions`);
    console.error(`STATUS: ${versionsResponse.status}`);
    console.error(`BODY: ${versionsResponse.body}`);
  }

  check(versionsResponse, { 
    "versions status 200": (r) => r.status === 200,
    "versions body not empty": (r) => "allVersions" in r.json()
  });

  // Log failures
  if (!"allVersions" in versionsResponse.json()) {
    createFailures.add(1);
    console.error(
      `Failed to get previous versions | status: ${versionsResponse.status} | body: ${versionsResponse.body}`
    );

    simulateThinkingTime();
    return;
  }

  sleep(0.5);
}
export function setup() {
  return apiSetup();
}

export default function (data) {
  //console.log("data: " + JSON.stringify(data));
  //apiJourney(data);
}