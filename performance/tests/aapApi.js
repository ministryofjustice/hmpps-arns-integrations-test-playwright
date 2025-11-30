import http from "k6/http";
import { check, sleep } from "k6";
import { Counter } from "k6/metrics";
import { b64encode } from "k6/encoding";

// Note: adjust thinking time depending on scenario run. E.g. increase to 5-15 sec for Load test
function simulateThinkingTime() {
  sleep(1 + Math.random() * 4);
}

// Track assessment creation failures
const createFailures = new Counter("create_assessment_failures");

// Default config, smoke test running on CI
const VUS = __ENV.VUS ? parseInt(__ENV.VUS) : 5;
const DURATION = __ENV.DURATION || "30s";
const P90_THRESHOLD = __ENV.P90_THRESHOLD ? parseInt(__ENV.P90_THRESHOLD) : 200;
const P95_THRESHOLD = __ENV.P95_THRESHOLD ? parseInt(__ENV.P95_THRESHOLD) : 500;

// Token Validity Configuration (Refresh 5 minutes before expiry)
const TOKEN_REFRESH_WINDOW = 55 * 60 * 1000; // 55 minutes in milliseconds

/* Note: these will be adjusted when running other scenarios, examples: 
Load test
P90_THRESHOLD = 700; 
P95_THRESHOLD = 1000; 

Stress test 
P90_THRESHOLD = 800; 
P95_THRESHOLD = 1200; 

Soak test 
P90_THRESHOLD = 450; 
P95_THRESHOLD = 550;*/

const BASE_URL = "https://arns-assessment-platform-api-dev.hmpps.service.justice.gov.uk";

export const options = {
  stages: [
    { duration: "30s", target: VUS },
    { duration: DURATION, target: VUS },
    { duration: "30s", target: 0 },
  ],

  /* Note: options will also be adjusted when running other scenarios locally: 
Load:
Ramp-up:   0 → 200 VUS over 10 minutes  
Steady:    Hold 200 VUS for 30 minutes  
Ramp-down: 600 → 0 VUS over 5 minutes

Stress:
Ramp-up:   0 → 200 VUS in 5 minutes  
Ramp-up:   200 → 400 VUS in 10 minutes   
Steady:    Hold 400 VUS for 10 minutes  
Ramp-down: 400 → 0 in 5 minutes

Soak:
Ramp-up:   0 → 100 VUS over 10 minutes  
Steady:    Hold 100 VUS for 8 hours  
Ramp-down: 100 → 0 VUS over 10 minutes*/

  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: [`p(95)<${P95_THRESHOLD}`, `p(90)<${P90_THRESHOLD}`],
  },
};

// Authentication
function fetchNewToken() {
  const clientId = __ENV.AAP_CLIENT_ID;
  const clientSecret = __ENV.AAP_CLIENT_SECRET;
  const tokenUrl = __ENV.TOKEN_URL;

  if (!clientId || !clientSecret || !tokenUrl) {
    throw new Error("Missing required environment variables: AAP_CLIENT_ID, AAP_CLIENT_SECRET, or TOKEN_URL");
  }

  // Use K6 native encoding to avoid Buffer/btoa issues
  const encodedCredentials = b64encode(`${clientId}:${clientSecret}`);
  
  const params = {
    headers: {
      'Authorization': `Basic ${encodedCredentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };

  const payload = 'grant_type=client_credentials';
  const res = http.post(tokenUrl, payload, params);

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
  // We call this once to fail fast if credentials are wrong before starting VUs
  const token = fetchNewToken();
  console.log('Initial AAP Token retrieved successfully');
  return { initialToken: token };
}

// --- VU STATE ---
// These variables exist separately for EACH Virtual User
// They persist across iterations of the default function
let cachedToken = null;
let tokenExpiry = 0;

export default function (data) {
  // Token refresh logic
  const now = Date.now();

  // If we don't have a token (first run of this VU), use the one from setup()
  if (!cachedToken) {
    cachedToken = data.initialToken;
    tokenExpiry = now + TOKEN_REFRESH_WINDOW;
  }

  // If token is expired or about to expire, refresh it
  if (now >= tokenExpiry) {
    console.log(`🔄 VU ${__VU} refreshing expired token...`);
    try {
      cachedToken = fetchNewToken();
      tokenExpiry = now + TOKEN_REFRESH_WINDOW; // Reset timer for another 55 mins
    } catch (e) {
      console.error(`VU ${__VU} failed to refresh token: ${e.message}`);
    }
  }

  const TOKEN = cachedToken; 
  const timeStamp = new Date().toISOString().split('.')[0];

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

  // Log failures
  if (commandResponse.status !== 200) {
    console.error(`NON-200 RESPONSE from /command`);
    console.error(`STATUS: ${commandResponse.status}`);
    console.error(`BODY: ${commandResponse.body}`);
  }

  check(commandResponse, { "command status 200": (r) => r.status === 200 });

  let responseData;
  try {
    responseData = commandResponse.json();
  } catch (err) {
    console.error(`JSON parse error on /command response`);
    console.error(`STATUS: ${commandResponse.status}`);
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
      "user.name exists": (r) => r.user && typeof r.user.name === "string",
      "formVersion exists": (r) => typeof r.formVersion === "string",
      "properties exists (even {})": (r) =>
        r.hasOwnProperty("properties") && typeof r.properties === "object",
      "timeline present (can be null)": (r) => r.hasOwnProperty("timeline"),
    });
  }

  if (result) {
    check(result, {
      "result exists": (res) => res !== undefined,
      "result.type correct": (res) =>
        res.type === "CreateAssessmentCommandResult",
      "assessmentUuid exists": (res) => typeof res.assessmentUuid === "string",
      "assessmentUuid is UUID-ish": (res) =>
        /^[0-9a-fA-F-]{36}$/.test(res.assessmentUuid),
      "message exists": (res) =>
        typeof res.message === "string" && res.message.length > 0,
      "success is true": (res) => res.success === true,
    });
  }

  // Log failures
  if (!assessmentUuid) {
    createFailures.add(1);
    console.error(
      `Failed to create assessment | status: ${commandResponse.status} | body: ${commandResponse.body}`
    );

    simulateThinkingTime();
    return;
  }

  // Step 2 — Query Assessment
  const queryPayload = JSON.stringify({
    queries: [
      {
        type: "AssessmentVersionQuery",
        user: { id: "test-user", name: "Test User" },
        timeStamp,
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
  // Safe access using && instead of ?.
  const queryResult = queryData && queryData.queries && queryData.queries[0] && queryData.queries[0].result;

  if (queryResult) {
    check(queryResult, {
      "result exists": (r) => r !== undefined,
      "has assessmentUuid": (r) => typeof r.assessmentUuid === "string",
      "has aggregateUuid": (r) => typeof r.aggregateUuid === "string",
      "has formVersion": (r) => typeof r.formVersion === "string",
      "createdAt exists": (r) => typeof r.createdAt === "string",
      "updatedAt exists": (r) => typeof r.updatedAt === "string",
      "createdAt looks like a timestamp": (r) =>
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(r.createdAt),
      "updatedAt looks like a timestamp": (r) =>
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(r.updatedAt),
      "answers exists (even empty)": (r) =>
        r.hasOwnProperty("answers") && typeof r.answers === "object",
      "properties exists (even empty)": (r) =>
        r.hasOwnProperty("properties") && typeof r.properties === "object",
      "collections exists and is array": (r) => Array.isArray(r.collections),
      "collaborators exists and is array": (r) => Array.isArray(r.collaborators),
      "collaborators have id": (r) =>
        r.collaborators.length > 0 && typeof r.collaborators[0].id === "string",
      "collaborators have name": (r) =>
        r.collaborators.length > 0 && typeof r.collaborators[0].name === "string",
      "assessmentUuid is UUID-ish": (r) =>
        /^[0-9a-fA-F-]{36}$/.test(r.assessmentUuid),
      "aggregateUuid is UUID-ish": (r) =>
        /^[0-9a-fA-F-]{36}$/.test(r.aggregateUuid),
    });
  }

  simulateThinkingTime();
}