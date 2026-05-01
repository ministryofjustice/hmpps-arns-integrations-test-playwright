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

// Track handover failures
const createFailures = new Counter("handover_failures");

// Default config
const VUS = __ENV.VUS ? parseInt(__ENV.VUS) : 5;
const DURATION = __ENV.DURATION || "30s";
const P90_THRESHOLD = __ENV.P90_THRESHOLD ? parseInt(__ENV.P90_THRESHOLD) : 800;
const P95_THRESHOLD = __ENV.P95_THRESHOLD ? parseInt(__ENV.P95_THRESHOLD) : 1000;

const TOKEN_REFRESH_WINDOW = 20 * 60 * 1000; // 20 minutes in milliseconds

const COORDINATOR_URL = "https://arns-coordinator-api-dev.hmpps.service.justice.gov.uk";
const BASE_URL = "https://arns-handover-service-dev.hmpps.service.justice.gov.uk";
const OASYS_RETURN_URL = 'https://t2.oasys.service.justice.gov.uk';
const crn = Math.random().toString().substring(2, 7);
const oasysPk = Math.floor(Math.random() * 1000000000).toString();
const name = 'Handover Perf';

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
  const oasysResponse = http.post(`${COORDINATOR_URL}/oasys/create`, JSON.stringify(create), options);
  const association = oasysResponse.json();

  const versionsResponse = http.get(`${COORDINATOR_URL}/entity/versions/${association.sentencePlanId}`, options);
  const date = new Date();
  const today = date.toISOString().split('T')[0];

  console.log("Initial AAP Token retrieved successfully");
  return { initialToken: token, oasysPk: oasysPk, planVersion: versionsResponse.json().allVersions[today].planVersion.version };
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

  // Step 1 — Get Handover
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');

  const userId = `perf-test-${timestamp}-${random}`;

  const criminogenicNeedsData = {
    accommodation: {
      accLinkedToHarm: 'YES',
      accLinkedToReoffending: 'YES',
      accStrengths: 'NO',
      accOtherWeightedScore: '4',
    },
    educationTrainingEmployability: {
      eteLinkedToHarm: 'NO',
      eteLinkedToReoffending: 'YES',
      eteStrengths: 'NO',
      eteOtherWeightedScore: '2',
    },
    drugMisuse: {
      drugLinkedToHarm: 'YES',
      drugLinkedToReoffending: 'YES',
      drugStrengths: 'NO',
      drugOtherWeightedScore: '3',
    },
    alcoholMisuse: {
      alcoholLinkedToHarm: 'YES',
      alcoholLinkedToReoffending: 'NO',
      alcoholStrengths: 'NO',
      alcoholOtherWeightedScore: '3',
    },
    personalRelationshipsAndCommunity: {
      relLinkedToHarm: 'NO',
      relLinkedToReoffending: 'NO',
      relStrengths: 'YES',
      relOtherWeightedScore: '0',
    },
    thinkingBehaviourAndAttitudes: {
      thinkLinkedToHarm: 'YES',
      thinkLinkedToReoffending: 'YES',
      thinkStrengths: 'NO',
      thinkOtherWeightedScore: '4',
    },
  };

  const subjectDetails = {
    crn: crn,
    pnc: 'UNKNOWN',
    givenName: 'Perf',
    familyName: 'User',
    gender: '1',
    dateOfBirth: '1988-01-01',
    location: 'COMMUNITY',
  };

  const createRequest = {
    user: {
      identifier: userId,
      displayName: 'Perf User',
      accessMode: 'READ_WRITE',
      planAccessMode: 'READ_WRITE',
      returnUrl: OASYS_RETURN_URL,
    },
    subjectDetails,
    oasysAssessmentPk: data.oasysPk,
    criminogenicNeedsData: criminogenicNeedsData,
    sentencePlanVersion: data.planVersion,
  };
  
  const handoverResponse = http.post(`${BASE_URL}/handover`, JSON.stringify(createRequest), {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  if (handoverResponse.status !== 200) {
    console.error(`NON-200 RESPONSE from /command`);
    console.error(`STATUS: ${handoverResponse.status}`);
    console.error(`BODY: ${handoverResponse.body}`);
  }

  check(handoverResponse, { 
    "command status 200": (r) => r.status === 200,
    "body contains handover link": (r) => r.json().handoverLink.includes('handover')
  });

  // Log failures
  if (!handoverResponse.json().handoverLink.includes('handover')) {
    createFailures.add(1);
    console.error(
      `Failed to get handover link | status: ${handoverResponse.status} | body: ${handoverResponse.body}`
    );

    simulateThinkingTime();
    return;
  }

  sleep(0.5);

  simulateThinkingTime();
}
export function setup() {
  return apiSetup();
}

export default function (data) {
  apiJourney(data);
}