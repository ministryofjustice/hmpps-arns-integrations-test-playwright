import http from "k6/http";
import { check, sleep } from "k6";
import { Counter } from "k6/metrics";
import { b64encode } from "k6/encoding";

function simulateThinkingTime() {
  sleep(1 + Math.random() * 4);
}

const updateFailures = new Counter("update_assessment_failures");

// Default config
const VUS = __ENV.VUS ? parseInt(__ENV.VUS) : 1;
const DURATION = __ENV.DURATION || "2m";
const BASE_URL = "https://arns-assessment-platform-api-dev.hmpps.service.justice.gov.uk";

export const options = {
  stages: [
    { duration: "30s", target: VUS },
    //{ duration: DURATION, target: VUS }, // Uncomment for longer run
    //{ duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
  },
};

// --- AUTHENTICATION ---

export function setup() {
  console.log('Starting AAP authentication setup');
  const clientId = __ENV.AAP_CLIENT_ID;
  const clientSecret = __ENV.AAP_CLIENT_SECRET;
  const tokenUrl = __ENV.TOKEN_URL;

  if (!clientId || !clientSecret || !tokenUrl) {
    throw new Error("Missing required environment variables.");
  }

  const encodedCredentials = b64encode(`${clientId}:${clientSecret}`);
  const params = {
    headers: {
      'Authorization': `Basic ${encodedCredentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };

  const res = http.post(tokenUrl, 'grant_type=client_credentials', params);
  
  if (res.status !== 200) { throw new Error(`Auth failed: ${res.status}`); }
  const body = res.json();
  if (!body || !body.access_token) { throw new Error("No 'access_token' found"); }

  return { apiToken: body.access_token };
}

// --- HELPER FUNCTIONS ---

// 1. Perform Update (Returns collectionUuid)
function performUpdate(token, assessmentUuid) {
  const createCollectionPayload = JSON.stringify({
    commands: [
      {
        type: "CreateCollectionCommand",
        name: 'GOALS',
        assessmentUuid: assessmentUuid,
        user: { id: "test-user", name: "Test User" },
      },
    ],
  });

  const res = http.post(`${BASE_URL}/command`, createCollectionPayload, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });

  const success = check(res, { "Create collection status 200": (r) => r.status === 200 });
  if (!success) updateFailures.add(1);

  // Extract collectionUUID
  let nextCollectionUuid = null;
  try {
    const body = res.json();
    const commandItem = body && body.commands && body.commands[0];
    const result = commandItem && commandItem.result;
    
    if (result && result.collectionUuid) {
        nextCollectionUuid = result.collectionUuid;
    }
  } catch (e) {
    console.error("Failed to parse update response JSON");
  }

  return nextCollectionUuid;
}

// 2. Perform Goal Creation (Uses collectionUuid)
function performGoalCreation(token, assessmentUuid, collectionUuid) {
  if (!collectionUuid) {
    console.warn("Skipping Goal Creation: No collectionUuid provided.");
    return;
  }

  const createGoalPayload = JSON.stringify({
    commands: [
      {
        type: "AddCollectionItemCommand", 
        collectionUuid: collectionUuid,
        properties: {
          STATUS: ['ACTIVE'],
          STATUS_DATE: ['2025-11-11T00:00:00'],
        },
        answers: {
          TITLE: ['I will find new ways to budget my money and keep to my income'],
          AREA_OF_NEED: ['FINANCES'],
          RELATED_AREAS_OF_NEED: ['ACCOMMODATION', 'THINKING_BEHAVIOURS_AND_ATTITUDES'],
          TARGET_DATE: ['2026-02-11T00:00:00'],
        }, 
        assessmentUuid: assessmentUuid,
        user: { id: "test-user", name: "Test User" },
      },
    ],
  });

  const res = http.post(`${BASE_URL}/command`, createGoalPayload, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });

  check(res, { "Goal Creation status 200": (r) => r.status === 200 });
}

// 3. Perform Query (Returns response object)
function performQuery(token, assessmentUuid, timestamp = null) {
  const effectiveTime = timestamp || new Date().toISOString().split('.')[0];
  
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

  // Return the HTTP response object so calling code can check status and parse JSON
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
    // A: Perform Update -> Get UUID
    const newUuid = performUpdate(TOKEN, assessmentUuid, `Loop Iteration ${i+1}`);
    
    // B: Use UUID immediately for Goal
    if (newUuid) {
        performGoalCreation(TOKEN, assessmentUuid, newUuid);
    }
    simulateThinkingTime();
  }

  // 3. Capture current timestamp (State at 49 events)
  sleep(1); 
  const timestampVar = new Date().toISOString().split('.')[0];
  console.log(`Captured Point-In-Time Timestamp: ${timestampVar}`);

  // 4. Update Assessment (Event 50)
  const uuidEvent50 = performUpdate(TOKEN, assessmentUuid, "Event 50 - Post Timestamp");
  if (uuidEvent50) {
      performGoalCreation(TOKEN, assessmentUuid, uuidEvent50);
  }
  sleep(1); 

  // 5. Query Latest -> Capture Aggregate UUID (State at Event 50)
  const queryRes50 = performQuery(TOKEN, assessmentUuid); 
  check(queryRes50, { "Query (Event 50) status 200": (r) => r.status === 200 });
  
  const data50 = queryRes50.json();
  const aggUuid_50 = data50 && data50.queries && data50.queries[0] && data50.queries[0].result && data50.queries[0].result.aggregateUuid;

  // 6. Update Assessment (Event 51)
  const uuidEvent51 = performUpdate(TOKEN, assessmentUuid, "Event 51 - Final Update");
  if (uuidEvent51) {
      performGoalCreation(TOKEN, assessmentUuid, uuidEvent51);
  }
  sleep(1);

  // 7. Query Latest -> Compare (State at Event 51)
  const queryRes51 = performQuery(TOKEN, assessmentUuid);
  check(queryRes51, { "Query (Event 51) status 200": (r) => r.status === 200 });

  const data51 = queryRes51.json();
  const aggUuid_51 = data51 && data51.queries && data51.queries[0] && data51.queries[0].result && data51.queries[0].result.aggregateUuid;

  // Assertion: UUID should change between Event 50 and 51
  if (aggUuid_50 && aggUuid_51) {
    check(aggUuid_51, { 
      "Aggregate UUID changed after Event 51": (uuid) => uuid !== aggUuid_50 
    });
    if (aggUuid_50 === aggUuid_51) {
      console.error(`Failure - Aggregate UUIDs match!`);
    }
  }

  // 8. Query for point in time = timestampVar
  const pitQueryRes = performQuery(TOKEN, assessmentUuid, timestampVar);
  check(pitQueryRes, { "Point-In-Time Query status 200": (r) => r.status === 200 });

  const pitData = pitQueryRes.json();
  const pitResult = pitData && pitData.queries && pitData.queries[0] && pitData.queries[0].result;

  if (pitResult) {
     check(pitResult, {
         "PIT Query returned a valid result": (r) => r !== undefined,
         "PIT Aggregate UUID exists": (r) => typeof r.aggregateUuid === "string"
     });
     
     const pitAggUuid = pitResult.aggregateUuid;
     if (aggUuid_51) {
         check(pitAggUuid, {
             "PIT Aggregate matches old state (not latest)": (uuid) => uuid !== aggUuid_51
         });
     }
  }

  simulateThinkingTime();
}