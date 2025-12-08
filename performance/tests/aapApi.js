import http from "k6/http";
import { check, sleep } from "k6";
import { Counter } from "k6/metrics";
import { b64encode } from "k6/encoding";

// --- CONFIGURATION ---

const MIN_THINK = __ENV.MIN_THINK_TIME ? parseInt(__ENV.MIN_THINK_TIME) : 1;
const MAX_THINK = __ENV.MAX_THINK_TIME ? parseInt(__ENV.MAX_THINK_TIME) : 5;

function simulateThinkingTime() {
  const range = MAX_THINK - MIN_THINK;
  sleep(MIN_THINK + Math.random() * range);
}

const createFailures = new Counter("create_assessment_failures");

// Default config
const VUS = __ENV.VUS ? parseInt(__ENV.VUS) : 5;
const DURATION = __ENV.DURATION || "30s";
const P90_THRESHOLD = __ENV.P90_THRESHOLD ? parseInt(__ENV.P90_THRESHOLD) : 200;
const P95_THRESHOLD = __ENV.P95_THRESHOLD ? parseInt(__ENV.P95_THRESHOLD) : 500;

const TOKEN_REFRESH_WINDOW = 55 * 60 * 1000;
const BASE_URL = "https://arns-assessment-platform-api-dev.hmpps.service.justice.gov.uk";

// --- DYNAMIC OPTIONS LOGIC ---

// 1. Define base options (Thresholds are always needed)
let testOptions = {
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: [`p(95)<${P95_THRESHOLD}`, `p(90)<${P90_THRESHOLD}`],
  },
};

if (__ENV.CUSTOM_STAGES) {
  // SCENARIO A: Load / Soak / Stress
  // We strictly use 'stages'. We DO NOT set 'vus' or 'duration'.
  console.log("Running with Custom Stages profile");
  testOptions.stages = JSON.parse(__ENV.CUSTOM_STAGES);
} else {
  // SCENARIO B: Default (Smoke Test)
  // We strictly use 'vus' and 'duration'.
  console.log("Running with Fixed Duration profile (Smoke)");
  testOptions.vus = VUS;
  testOptions.duration = DURATION;
}

export const options = testOptions;

// --- AUTHENTICATION ---

function fetchNewToken() {
  const clientId = __ENV.AAP_CLIENT_ID;
  const clientSecret = __ENV.AAP_CLIENT_SECRET;
  const tokenUrl = __ENV.TOKEN_URL;

  if (!clientId || !clientSecret || !tokenUrl) {
    throw new Error("Missing required environment variables: AAP_CLIENT_ID, AAP_CLIENT_SECRET, or TOKEN_URL");
  }

  const encodedCredentials = b64encode(`${clientId}:${clientSecret}`);
  
  const params = {
    headers: {
      'Authorization': `Basic ${encodedCredentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };

  const res = http.post(tokenUrl, 'grant_type=client_credentials', params);

  if (res.status !== 200) {
    console.error(`Auth Refresh Failed! Status: ${res.status} Body: ${res.body}`);
    throw new Error(`Authentication failed with status ${res.status}`);
  }

  const body = res.json();
  if (!body || !body.access_token) {
    throw new Error("No 'access_token' found in response");
  }

  return body.access_token;
}

export function setup() {
  console.log('Starting AAP initial authentication check...');
  const token = fetchNewToken();
  console.log('Initial AAP Token retrieved successfully');
  return { initialToken: token };
}

// --- VU STATE ---
let cachedToken = null;
let tokenExpiry = 0;

// --- DEFAULT FUNCTION ---

export default function (data) {
  const now = Date.now();

  if (!cachedToken) {
    cachedToken = data.initialToken;
    tokenExpiry = now + TOKEN_REFRESH_WINDOW;
  }

  if (now >= tokenExpiry) {
    try {
      cachedToken = fetchNewToken();
      tokenExpiry = now + TOKEN_REFRESH_WINDOW; 
    } catch (e) {
      console.error(`VU ${__VU} failed to refresh token: ${e.message}`);
    }
  }

  const TOKEN = cachedToken; 
  
  // Step 1 — Create Assessment
  const commandPayload = JSON.stringify({
    commands: [
      {
        type: "CreateAssessmentCommand",
        formVersion: "1.0",
        user: { id: "test-user", name: "Test User" },
      },
    ],
  });

  const commandResponse = http.post(`${BASE_URL}/command`, commandPayload, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  if (commandResponse.status !== 200) {
    console.error(`NON-200 RESPONSE from /command`);
    console.error(`STATUS: ${commandResponse.status}`);
  }

  check(commandResponse, { "command status 200": (r) => r.status === 200 });

  let responseData;
  try {
    responseData = commandResponse.json();
  } catch (err) {
    console.error(`JSON parse error on /command response`);
    return;
  }

  const command = responseData && responseData.commands && responseData.commands[0];
  const request = command && command.request;
  const result = command && command.result;
  const assessmentUuid = result && result.assessmentUuid;

  check(responseData, {
    "commands array exists": (d) => d && Array.isArray(d.commands),
    "command[0] exists": (d) => d && d.commands.length > 0,
  });

  if (request) {
    check(request, {
      "request exists": (r) => r !== undefined,
      "request.type is correct": (r) => r.type === "CreateAssessmentCommand",
      "user exists": (r) => typeof r.user === "object",
      "user.id exists": (r) => r.user && typeof r.user.id === "string",
      "properties exists": (r) => r.hasOwnProperty("properties"),
    });
  }

  if (result) {
    check(result, {
      "result exists": (res) => res !== undefined,
      "result.type correct": (res) => res.type === "CreateAssessmentCommandResult",
      "assessmentUuid exists": (res) => typeof res.assessmentUuid === "string",
      "success is true": (res) => res.success === true,
    });
  }

  if (!assessmentUuid) {
    createFailures.add(1);
    console.error(`Failed to create assessment | status: ${commandResponse.status}`);
    simulateThinkingTime();
    return;
  }

  // Step 2 — Query Assessment
  const queryPayload = JSON.stringify({
    queries: [
      {
        type: "AssessmentVersionQuery",
        user: { id: "test-user", name: "Test User" },
        timeStamp: new Date().toISOString().split('.')[0],
        assessmentUuid,
      },
    ],
  });

  const queryResponse = http.post(`${BASE_URL}/query`, queryPayload, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "Content-Type": "application/json",
    },
  });

  check(queryResponse, { "query status 200": (r) => r.status === 200 });

  const queryData = queryResponse.json();
  const queryResult = queryData && queryData.queries && queryData.queries[0] && queryData.queries[0].result;

  if (queryResult) {
    check(queryResult, {
      "result exists": (r) => r !== undefined,
      "has assessmentUuid": (r) => typeof r.assessmentUuid === "string",
      "createdAt exists": (r) => typeof r.createdAt === "string",
      "answers exists": (r) => r.hasOwnProperty("answers"),
    });
  }

  simulateThinkingTime();
}