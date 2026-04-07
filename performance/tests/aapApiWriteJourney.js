import http from "k6/http";
import { check, sleep } from "k6";
import { Counter } from "k6/metrics";
import { b64encode } from "k6/encoding";
import exec from "k6/execution";

// --- CONFIGURATION ---

const journeyFailures = new Counter("journey_failures");

const VUS = __ENV.VUS ? parseInt(__ENV.VUS) : 5;
const DURATION = __ENV.DURATION || "30s";
const P90_THRESHOLD = __ENV.P90_THRESHOLD ? parseInt(__ENV.P90_THRESHOLD) : 200;
const P95_THRESHOLD = __ENV.P95_THRESHOLD ? parseInt(__ENV.P95_THRESHOLD) : 500;

const TOKEN_REFRESH_WINDOW = 20 * 60 * 1000;

const BASE_URL =
  "https://arns-assessment-platform-api-dev.hmpps.service.justice.gov.uk";

// --- DYNAMIC OPTIONS ---

let testOptions = {
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: [`p(95)<${P95_THRESHOLD}`, `p(90)<${P90_THRESHOLD}`],
  },
};

if (__ENV.CUSTOM_STAGES) {
  console.log("Running with Custom Stages profile");
  testOptions.stages = JSON.parse(__ENV.CUSTOM_STAGES);
} else {
  console.log("Running with Fixed Duration profile (Smoke)");
  testOptions.vus = VUS;
  testOptions.duration = DURATION;
}

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

  const res = http.post(tokenUrl, "grant_type=client_credentials", {
    headers: {
      Authorization: `Basic ${encodedCredentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  });

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

// --- VU STATE ---
let cachedToken = null;
let tokenExpiry = 0;

// --- HELPERS ---

function getToken(initialToken) {
  const now = Date.now();

  if (!cachedToken) {
    cachedToken = initialToken;
    tokenExpiry = now + TOKEN_REFRESH_WINDOW;
  }

  if (now >= tokenExpiry) {
    console.log(`VU ${__VU} token expired. Refreshing...`);
    const newToken = fetchNewToken();
    cachedToken = newToken;
    tokenExpiry = now + TOKEN_REFRESH_WINDOW;
    console.log(`VU ${__VU} token refreshed successfully.`);
  }

  return cachedToken;
}

function postCommand(token, commands) {
  return http.post(
    `${BASE_URL}/command`,
    JSON.stringify({ commands }),
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    }
  );
}

function extractCommandResult(response, label) {
  if (response.status !== 200) {
    console.error(`NON-200 from /command (${label}) | STATUS: ${response.status} | BODY: ${response.body}`);
    return null;
  }

  let data;
  try {
    data = response.json();
  } catch (err) {
    console.error(`JSON parse error on /command response (${label})`);
    return null;
  }

  const command = data && data.commands && data.commands[0];

  return command && command.result;
}

// --- SETUP ---

export function setup() {
  console.log("Starting AAP initial authentication check...");
  const token = fetchNewToken();
  console.log("Initial AAP Token retrieved successfully");

  return { initialToken: token };
}

// --- JOURNEY ---

export default function (data) {
  let token;

  try {
    token = getToken(data.initialToken);
  } catch (e) {
    console.error(`VU ${__VU} failed to get token: ${e.message}`);
    journeyFailures.add(1);
    sleep(5);

    return;
  }

  const userId = `test-user-${exec.vu.idInInstance}`;
  const user = { id: userId, name: "Test User" };

  // --- Step 1: Create Assessment ---

  const createRes = postCommand(token, [
    {
      type: "CreateAssessmentCommand",
      assessmentType: "TEST",
      formVersion: "1.0",
      properties: {},
      user,
    },
  ]);

  const createResult = extractCommandResult(createRes, "CreateAssessment");

  check(createRes, { "create assessment status 200": (r) => r.status === 200 });
  check(createResult, {
    "assessment created successfully": (r) => r && r.success === true,
    "assessmentUuid returned": (r) => r && typeof r.assessmentUuid === "string",
  });

  const assessmentUuid = createResult && createResult.assessmentUuid;

  if (!assessmentUuid) {
    journeyFailures.add(1);
    console.error(`VU ${__VU} failed to create assessment`);

    return;
  }

  // --- Step 2: Update Assessment Answers ---

  const updateAnswersRes = postCommand(token, [
    {
      type: "UpdateAssessmentAnswersCommand",
      assessmentUuid,
      user,
      added: {
        full_name: { type: "Single", value: "Jane Smith" },
        date_of_birth: { type: "Single", value: "1990-05-15" },
        risk_level: { type: "Single", value: "Medium" },
        notes: { type: "Single", value: "Initial assessment notes for performance test" },
        areas_of_concern: { type: "Multi", values: ["Housing", "Employment", "Substance misuse"] },
      },
      removed: [],
    },
  ]);

  const updateResult = extractCommandResult(updateAnswersRes, "UpdateAnswers");

  check(updateAnswersRes, { "update answers status 200": (r) => r.status === 200 });
  check(updateResult, {
    "answers updated successfully": (r) => r && r.success === true,
  });

  if (!updateResult || !updateResult.success) {
    journeyFailures.add(1);
    console.error(`VU ${__VU} failed to update answers for ${assessmentUuid}`);

    return;
  }

  // --- Step 3: Create Collection ---

  const createCollectionRes = postCommand(token, [
    {
      type: "CreateCollectionCommand",
      assessmentUuid,
      user,
      name: "goals",
    },
  ]);

  const collectionResult = extractCommandResult(createCollectionRes, "CreateCollection");

  check(createCollectionRes, { "create collection status 200": (r) => r.status === 200 });
  check(collectionResult, {
    "collection created successfully": (r) => r && r.success === true,
    "collectionUuid returned": (r) => r && typeof r.collectionUuid === "string",
  });

  const collectionUuid = collectionResult && collectionResult.collectionUuid;

  if (!collectionUuid) {
    journeyFailures.add(1);
    console.error(`VU ${__VU} failed to create collection for ${assessmentUuid}`);

    return;
  }

  // --- Step 4: Add Collection Items ---

  const collectionItems = [
    {
      answers: {
        goal_title: { type: "Single", value: "Secure stable accommodation" },
        goal_status: { type: "Single", value: "In progress" },
        target_date: { type: "Single", value: "2026-06-01" },
      },
      properties: {
        priority: { type: "Single", value: "High" },
      },
    },
    {
      answers: {
        goal_title: { type: "Single", value: "Enrol in employment programme" },
        goal_status: { type: "Single", value: "Not started" },
        target_date: { type: "Single", value: "2026-07-15" },
      },
      properties: {
        priority: { type: "Single", value: "Medium" },
      },
    },
    {
      answers: {
        goal_title: { type: "Single", value: "Complete substance misuse course" },
        goal_status: { type: "Single", value: "Not started" },
        target_date: { type: "Single", value: "2026-09-01" },
      },
      properties: {
        priority: { type: "Single", value: "High" },
      },
    },
  ];

  const itemUuids = [];

  for (let i = 0; i < collectionItems.length; i++) {
    const item = collectionItems[i];

    const addItemRes = postCommand(token, [
      {
        type: "AddCollectionItemCommand",
        assessmentUuid,
        collectionUuid,
        user,
        answers: item.answers,
        properties: item.properties,
      },
    ]);

    const addItemResult = extractCommandResult(addItemRes, `AddCollectionItem[${i}]`);

    check(addItemRes, {
      [`add collection item ${i} status 200`]: (r) => r.status === 200,
    });
    check(addItemResult, {
      [`collection item ${i} created`]: (r) => r && r.success === true,
      [`collection item ${i} uuid returned`]: (r) => r && typeof r.collectionItemUuid === "string",
    });

    if (addItemResult && addItemResult.collectionItemUuid) {
      itemUuids.push(addItemResult.collectionItemUuid);
    }

  }

  // --- Step 5: Update First Collection Item's Answers ---

  if (itemUuids.length > 0) {
    const updateItemRes = postCommand(token, [
      {
        type: "UpdateCollectionItemAnswersCommand",
        assessmentUuid,
        collectionItemUuid: itemUuids[0],
        user,
        added: {
          goal_status: { type: "Single", value: "Completed" },
          completion_notes: { type: "Single", value: "Accommodation secured via referral" },
        },
        removed: [],
      },
    ]);

    const updateItemResult = extractCommandResult(updateItemRes, "UpdateCollectionItemAnswers");

    check(updateItemRes, { "update collection item status 200": (r) => r.status === 200 });
    check(updateItemResult, {
      "collection item answers updated": (r) => r && r.success === true,
    });

    if (!updateItemResult || !updateItemResult.success) {
      journeyFailures.add(1);
      console.error(`VU ${__VU} failed to update collection item for ${assessmentUuid}`);
    }
  }

}
