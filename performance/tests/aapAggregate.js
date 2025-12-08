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

// Helper to generate Server matching Timestamp (Microseconds, No Z)
function getMicrosecondTimestamp() {
  const now = new Date();
  const iso = now.toISOString(); // e.g., "2025-12-04T22:27:11.276Z"
  
  // Remove the 'Z' from the end
  const baseTime = iso.slice(0, -1);
  
  // Generate 3 random digits for extra microsecond precision
  const microseconds = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  // Return format: 2025-12-04T22:27:11.276123
  return `${baseTime}${microseconds}`;
}

const updateFailures = new Counter("update_assessment_failures");

// Default config
const VUS = __ENV.VUS ? parseInt(__ENV.VUS) : 1;
const DURATION = __ENV.DURATION || "5m";
const BASE_URL = "https://arns-assessment-platform-api-dev.hmpps.service.justice.gov.uk";

export const options = {
  stages: [
    { duration: DURATION, target: VUS }
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
  },
};

// --- AUTHENTICATION ---

export function setup() {
  console.log("Starting AAP authentication setup");
  const clientId = __ENV.AAP_CLIENT_ID;
  const clientSecret = __ENV.AAP_CLIENT_SECRET;
  const tokenUrl = __ENV.TOKEN_URL;

  if (!clientId || !clientSecret || !tokenUrl) {
    throw new Error("Missing required environment variables.");
  }

  const encodedCredentials = b64encode(`${clientId}:${clientSecret}`);
  const params = {
    headers: {
      Authorization: `Basic ${encodedCredentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  const res = http.post(tokenUrl, "grant_type=client_credentials", params);

  if (res.status !== 200) { throw new Error(`Auth failed: ${res.status}`); }
  const body = res.json();
  if (!body || !body.access_token) { throw new Error("No 'access_token' found"); }

  return { apiToken: body.access_token };
}

// --- HELPER FUNCTIONS ---

// 1. Perform Update
function performUpdate(token, assessmentUuid, updateText) {
  const updateAssessmentAnswersPayload = JSON.stringify({
    commands: [
      {
        type: "UpdateAssessmentAnswersCommand",
        added: { test_addition: [updateText] }, 
        removed: [],
        assessmentUuid: assessmentUuid,
        user: { id: "test-user", name: "Test User" },
      },
    ],
  });

  const res = http.post(`${BASE_URL}/command`, updateAssessmentAnswersPayload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const success = check(res, {
    "Update assessment answers status 200": (r) => r.status === 200,
  });
  if (!success) updateFailures.add(1);
}

// 2. Perform Query
function performQuery(token, assessmentUuid, timestamp = null) {
  // If timestamp is null, generate one without 'Z' (Latest approximation)
  const effectiveTime = timestamp || new Date().toISOString().slice(0, -1);

  const queryPayload = JSON.stringify({
    queries: [
      {
        type: "AssessmentVersionQuery",
        user: { id: "test-user", name: "Test User" },
        timeStamp: effectiveTime,
        assessmentUuid: assessmentUuid,
      },
    ],
  });

  return http.post(`${BASE_URL}/query`, queryPayload, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
}

// --- MAIN TEST FLOW ---

export default function (data) {
  const TOKEN = data.apiToken;

  // 1. Create Assessment (Event 1)
  const createPayload = JSON.stringify({
    commands: [
      {
        type: "CreateAssessmentCommand",
        formVersion: "1.0",
        user: { id: "test-user", name: "Test User" },
      },
    ],
  });

  const createRes = http.post(`${BASE_URL}/command`, createPayload, {
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
  });

  check(createRes, { "Create status 200": (r) => r.status === 200 });

  let createData;
  try { createData = createRes.json(); } catch (e) { return; }

  const assessmentUuid = createData && createData.commands && createData.commands[0] && createData.commands[0].result && createData.commands[0].result.assessmentUuid;

  if (!assessmentUuid) {
    console.error(`Failed to create assessment, cannot proceed.`);
    return;
  }

  // 2. Loop 48 times (Events 2 to 49)
  const LOOP_COUNT = 48;

  for (let i = 0; i < LOOP_COUNT; i++) {
    performUpdate(TOKEN, assessmentUuid, `Loop Iteration ${i + 2}`);
    simulateThinkingTime();
  }

  // 3. Capture current timestamp (State at 49 events)
  sleep(0.5);
  
  // A. Perform a query to get the server's exact time string
  const queryRes49 = performQuery(TOKEN, assessmentUuid);
  check(queryRes49, { "Query (Event 49) status 200": (r) => r.status === 200 });
  
  const data49 = queryRes49.json();
  
  // B. Extract the 'updatedAt' string directly from the server response
  const serverTimestamp = data49 && data49.queries[0] && data49.queries[0].result && data49.queries[0].result.updatedAt;
  const answer49 = data49 && data49.queries[0] && data49.queries[0].result && data49.queries[0].result.answers["test_addition"];

  check(answer49, {
    "Aggregate 49 has the right update": (answer49) => (answer49) == "Loop Iteration 49",
  });

  if (!serverTimestamp) {
      console.error("Failed to capture Server Timestamp from Event 49");
      return;
  }

  const timestampVar = serverTimestamp;
  console.log(`Captured Server Timestamp: ${timestampVar}`);

  // Sleep to ensure Event 50 happens strictly AFTER this timestamp
  console.log("Sleeping 5s to ensure time gap...");
  sleep(5);

  // 4. Update Assessment (Event 50)
  performUpdate(TOKEN, assessmentUuid, "Event 50 - Post Timestamp");
  sleep(0.5);

  // 5. Query Latest -> Capture Aggregate UUID (State at Event 50)
  const queryRes50 = performQuery(TOKEN, assessmentUuid);
  check(queryRes50, { "Query (Event 50) status 200": (r) => r.status === 200 });

  const data50 = queryRes50.json();
  const aggUuid_50 = data50 && data50.queries && data50.queries[0] && data50.queries[0].result && data50.queries[0].result.aggregateUuid;
  const answer50 = data50 && data50.queries[0] && data50.queries[0].result && data50.queries[0].result.answers["test_addition"];
  
  check(answer50, {
    "Aggregate 50 has the right update": (answer50) => (answer50) == "Loop Iteration 50",
  });

  // Log server time if need to debug format again
  if(data50 && data50.queries[0].result.updatedAt) {
      console.log(`SERVER TIME FORMAT: ${data50.queries[0].result.updatedAt}`);
  }

  // 6. Update Assessment (Event 51)
  performUpdate(TOKEN, assessmentUuid, "Event 51 - Final Update");
  sleep(0.5);

  // 7. Query Latest -> Compare (State at Event 51)
  const queryRes51 = performQuery(TOKEN, assessmentUuid);
  check(queryRes51, { "Query (Event 51) status 200": (r) => r.status === 200 });

  const data51 = queryRes51.json();
  const aggUuid_51 = data51 && data51.queries && data51.queries[0] && data51.queries[0].result && data51.queries[0].result.aggregateUuid;
  const answer51 = data51 && data51.queries[0] && data51.queries[0].result && data51.queries[0].result.answers["test_addition"];

  check(answer51, {
    "Aggregate 51 has the right update": (answer51) => (answer51) == "Loop Iteration 51",
  });

  // Assertion: UUID should change between Event 50 and 51
  check(aggUuid_51, {
    "Aggregate UUID changed after Event 51": (uuid) => uuid !== aggUuid_50,
  });

  // 8. Query for point in time = timestampVar
  const pitQueryRes = performQuery(TOKEN, assessmentUuid, timestampVar);
  check(pitQueryRes, {
    "Point-In-Time Query status 200": (r) => r.status === 200,
  });

  const pitData = pitQueryRes.json();
  const pitResult = pitData && pitData.queries && pitData.queries[0] && pitData.queries[0].result;

  check(pitResult, {
    "PIT Query returned a valid result": (r) => r !== undefined,
    "PIT Aggregate UUID exists": (r) => typeof r.aggregateUuid === "string",
  });

  const pitAggUuid = pitResult.aggregateUuid;

  console.log(`DEBUG: pitAggUuid (Restored): ${pitAggUuid}`);
  console.log(`DEBUG: aggUuid_50 (Event 50): ${aggUuid_50}`);
  console.log(`DEBUG: aggUuid_51 (Latest):   ${aggUuid_51}`);

  check(pitAggUuid, {
    // The PIT UUID (Event 49) should NOT match Event 51 (Latest)
    "PIT Aggregate matches old state (51,not latest)": (uuid) => uuid !== aggUuid_51,
    // The PIT UUID (Event 49) should NOT match Event 50 either
    "PIT Aggregate matches old state (50,not latest)": (uuid) => uuid !== aggUuid_50,
  });

  simulateThinkingTime();
}