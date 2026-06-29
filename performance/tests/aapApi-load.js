import http from "k6/http";
import { check, group, sleep } from "k6";
import { Counter } from "k6/metrics";
import { b64encode } from "k6/encoding";
import { SharedArray } from 'k6/data';
import exec from 'k6/execution';
import { apiSetup } from '../setup/api.js';
import { logNormal, simulate } from "../helpers/thinking.js";

// --- CONFIGURATION ---

// Track assessment creation failures
const createFailures = new Counter("create_assessment_failures");

// Default config
const VUS = __ENV.VUS ? parseInt(__ENV.VUS) : 5;
const DURATION = __ENV.DURATION || "1s";

const TOKEN_REFRESH_WINDOW = 20 * 60 * 1000; // 20 minutes in milliseconds

const BASE_URL = __ENV.BASE_URL || 'https://arns-assessment-platform-api-dev.hmpps.service.justice.gov.uk';

// --- DYNAMIC OPTIONS LOGIC

// 1. Define base options (Thresholds are always needed)
let testOptions = {
  scenarios: {
    viewPlan: {
      executor: 'constant-arrival-rate',
      exec: 'viewPlan',
      rate: 1,
      timeUnit: '1s',
      preAllocatedVUs: 2,
      maxVUs: VUS,
      duration: '5s',
      //stages: JSON.parse(__ENV.CUSTOM_STAGES)
    },
    createGoal: {
      executor: 'constant-arrival-rate',
      exec: 'createGoal',
      rate: 1,
      timeUnit: '1s',
      preAllocatedVUs: 2,
      maxVUs: VUS,
      duration: '5s',
      //stages: JSON.parse(__ENV.CUSTOM_STAGES)
    },
  },
  noConnectionReuse: false,
};

export const options = testOptions;

const assessments = new SharedArray('generated data', function () {
  return JSON.parse(open('../setup/assessments.json'));
});

// --- VU STATE ---
let cachedToken = null;
let tokenExpiry = 0;

export const VARS = {};

export function createGoal (data) {
  const TOKEN = data.initialToken;
  const crn = Math.random().toString().substring(2, 7);

  group('create goal', function () {
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

    check(commandResponse, { 
      "create assessment status 200": (r) => r.status === 200
    });

    const responseData = commandResponse.json();
    VARS.assessmentUuid = responseData.commands[0].result.assessmentUuid

    // Step 2 — Create Goal Collection
    const collectionPayload = JSON.stringify({
      commands: [
        {
          type: 'CreateCollectionCommand',
          name: 'GOALS',
          assessmentUuid: responseData.commands[0].result.assessmentUuid,
          user: { id: 'test-user', name: 'Test User' },
          identifiers: {
            CRN: crn,
          },
          flags: ['SAN_BETA'],
        },
      ],
    });

    const collectionResponse = http.post(`${BASE_URL}/command`, collectionPayload, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      tags: Object.assign(
        {},
        {
          name: 'AAP',
        },
        'CreateGoalCollection'
      ),
    });

    check(collectionResponse, { 
      "goal collection status 200": (r) => r.status === 200
    });

    // Step 2 — Create Goal Collection
    const goalsCollectionBody = collectionResponse.json();

    const commandCreateGoalPayload = JSON.stringify({
      commands: [
        {
          type: 'AddCollectionItemCommand',
          name: 'GOALS',
          assessmentUuid: responseData.commands[0].result.assessmentUuid,
          collectionUuid: goalsCollectionBody?.commands?.[0]?.result?.collectionUuid,
          user: { id: 'test-user', name: 'Test User' },
          identifiers: {
            CRN: crn,
          },
          flags: ['SAN_BETA'],
          properties: {
            status: {
              type: 'Single',
              value: 'ACTIVE',
            },
            status_date: {
              type: 'Single',
              value: '2026-02-23T17:30:11.179Z',
            },
          },
          answers: {
            title: {
              type: 'Single',
              value: 'I will work towards finding accommodation, so that I am no longer homeless',
            },
            target_date: {
              type: 'Single',
              value: '2026-05-23T16:30:11.151Z',
            },
            area_of_need: {
              type: 'Single',
              value: 'accommodation',
            },
            related_areas_of_need: {
              type: 'Multi',
              values: ['alcohol-use'],
            },
          },
        },
      ],
    });

    const goalResponse = http.post(`${BASE_URL}/command`, collectionPayload, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      tags: Object.assign(
        {},
        {
          name: 'AAP',
        },
        'CreateGoal'
      ),
    });

    check(goalResponse, { 
      "add goal status 200": (r) => r.status === 200
    });
  });

  // Median = 37.59 (Create a goal - Sentence plan)
  // Spread = 0.5
  let createGoalDelay = logNormal(Math.log(37.59), 0.5);
  sleep(createGoalDelay);

  group('02. query plan', function () {
    // Step 4 — Query Assessment
    const queryPayload = JSON.stringify({
      queries: [
        {
          type: "AssessmentVersionQuery",
          user: { id: "test-user", name: "Test User" },
          assessmentIdentifier: { type: 'UUID', uuid: VARS.assessmentUuid },
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

    check(queryResponse, { 
      "query status 200": (r) => r.status === 200
    });

  });

  // Median = 5.2 (Plan - Sentence plan)
  // Spread = 0.5
  let queryPlanDelay = logNormal(Math.log(5.2), 0.5);
  sleep(queryPlanDelay);
}

export function viewPlan (data) {
  const TOKEN = data.initialToken;

  group('query plan', function () {
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

    check(queryResponse, { 
      "query plan status 200": (r) => r.status === 200
    });
  });

  // Median = 5.2 (Plan - Sentence plan)
  // Spread = 0.5
  let viewPlanDelay = logNormal(Math.log(5.2), 0.5);
  sleep(viewPlanDelay);
};


export function setup() {
  return apiSetup();
}
