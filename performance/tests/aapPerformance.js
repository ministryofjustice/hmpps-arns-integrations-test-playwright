import http from "k6/http";
import { check, sleep } from "k6";
import { Counter } from "k6/metrics";

// Custom metrics to log assessment creation failures 
const createFailures = new Counter("create_assessment_failures");

// Load scenario config (defaults for CI smoke test)
const VUS = __ENV.VUS ? parseInt(__ENV.VUS) : 5;
const DURATION = __ENV.DURATION || "30s";
const P95_THRESHOLD = __ENV.P95_THRESHOLD ? parseInt(__ENV.P95_THRESHOLD) : 500;

export const options = {
  stages: [
    { duration: "30s", target: VUS },
    { duration: DURATION, target: VUS },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: [`p(95)<${P95_THRESHOLD}`],
  },
};

const BASE_URL = "https://arns-assessment-platform-api-dev.hmpps.service.justice.gov.uk";
const TOKEN = JSON.parse(open("../../utils/aapToken.json")).access_token;

export default function () {
  const timeStamp = new Date().toISOString().split('.')[0];

  // Step 1: Create AAP assessment
  const commandPayload = JSON.stringify({
    commands: [
      {
        type: "CreateAssessmentCommand",
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

  check(commandResponse, { "command status 200": (r) => r.status === 200 });

  const assessmentUuid =
    commandResponse.json()?.commands?.[0]?.result?.assessmentUuid;

  // Log and track failures
  if (!assessmentUuid) {
    createFailures.add(1);
    console.error(
      `Failed to create AAP assessment! Status: ${commandResponse.status}, Body: ${commandResponse.body}`
    );

    // Step 2: Query AAP assessment
    if (assessmentUuid) {
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
    }

    sleep(1);
  }
}
