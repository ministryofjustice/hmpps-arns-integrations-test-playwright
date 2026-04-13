import http from "k6/http";
import { check, group, sleep } from "k6";
import { Counter } from "k6/metrics";
import { b64encode } from "k6/encoding";
import { SharedArray } from 'k6/data';
import exec from 'k6/execution';

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
const VUS = __ENV.VUS ? parseInt(__ENV.VUS) : 1;
const DURATION = __ENV.DURATION || "1s";
const P90_THRESHOLD = __ENV.P90_THRESHOLD ? parseInt(__ENV.P90_THRESHOLD) : 200;
const P95_THRESHOLD = __ENV.P95_THRESHOLD ? parseInt(__ENV.P95_THRESHOLD) : 500;

const TOKEN_REFRESH_WINDOW = 20 * 60 * 1000; // 20 minutes in milliseconds

const BASE_URL = "https://arns-assessment-platform-api-dev.hmpps.service.justice.gov.uk";

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

const assessments = new SharedArray('generated data', function () {
  return JSON.parse(open('../setup/assessments.json'));
});

export function apiSetup() {
  console.log("Starting AAP initial authentication check...");
  const token = fetchNewToken();
  console.log("Initial AAP Token retrieved successfully");
  return { initialToken: token };
}

// --- VU STATE ---
let cachedToken = null;
let tokenExpiry = 0;

// --- DEFAULT FUNCTION ---

export function apiJourney (data) {
  const TOKEN = data.initialToken;

  group('01. query assessments', function () {
    const vuId = exec.vu.idInInstance - 1;
    const assessment = assessments[vuId % assessments.length];
    console.log("ASSESSMENT UUID: " + assessment.assessmentUuid)

    // Step 2 — Query Assessment
    const queryPayload = JSON.stringify({
      queries: [
        {
          type: "AssessmentVersionQuery",
          user: { id: "test-user", name: "Test User" },
          assessmentIdentifier: { type: 'UUID', uuid: assessment.assessmentUuid },
        },
      ],
    });

    const queryResponse = http.post(`${BASE_URL}/query`, queryPayload, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      tags: Object.assign(
        {},
        {
          name: 'AAP',
        },
        'AssessmentVersion'
      ),
    });

    check(queryResponse, { "query status 200": (r) => r.status === 200 });

    if (queryResponse.status !== 200) {
      console.error(`NON-200 RESPONSE from /query`);
      console.error(`STATUS: ${queryResponse.status}`);
      console.error(`BODY: ${queryResponse.body}`);
    }

    const queryData = queryResponse.json();
    const queryResult =
      queryData &&
      queryData.queries &&
      queryData.queries[0] &&
      queryData.queries[0].result;

    check(queryResult, {
      "result exists": (r) => r !== undefined,
      "has assessmentUuid": (r) => typeof r.assessmentUuid === "string",
    });

  });
  
  group('02. create assessments', function () {
    // Step 1 — Create Assessment
    const commandPayload = JSON.stringify({
      commands: [
        {
          type: "CreateAssessmentCommand",
          assessmentType: 'TEST',
          formVersion: "1.0",
          properties: {},
          user: { id: "test-user", name: "Test User" },
        },
      ],
    });

    const commandResponse = http.post(`${BASE_URL}/command`, commandPayload, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      tags: Object.assign(
        {},
        {
          name: 'AAP',
        },
        'CreateAssessment'
      ),
    });

    check(commandResponse, { "command status 200": (r) => r.status === 200 });

    let responseData;
    try {
      responseData = commandResponse.json();
    } catch (err) {
      console.error(`JSON parse error on /command response ${commandResponse.status_text}`);
      return;
    }

    const command =
      responseData && responseData.commands && responseData.commands[0];
    const result = command && command.result;

    check(responseData, {
      "commands array exists": (d) => d && Array.isArray(d.commands),
      "command[0] exists": (d) => d && d.commands.length > 0,
    });

    check(result, {
      "result exists": (res) => res !== undefined,
      "result.type correct": (res) =>
        res.type === "CreateAssessmentCommandResult",
      "assessmentUuid exists": (res) => typeof res.assessmentUuid === "string",
    });

    sleep(0.5);
  });
  simulateThinkingTime();
}
export function setup() {
  return apiSetup();
}

export default function (data) {
  apiJourney(data);
}