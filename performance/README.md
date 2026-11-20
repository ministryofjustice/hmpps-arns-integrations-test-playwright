## Setup
To run locally first install [k6](https://github.com/grafana/k6). The browser module is now included in the default install.
`brew install k6`

To run the tests head/headless you will need chromium installed - to install chromium run
`brew install --force chromium --no-quarantine ` 

## Tests and run scripts

| Test (`tests/`) | What it does | Local run script (`utils/`) |
| --- | --- | --- |
| `aapApi.js` | AAP API journey | `run_k6_aap_local.sh` |
| `aapApi-smoke.js` / `aapApi-load.js` | AAP API smoke / load profiles | `run_k6_aap_smoke_local.sh` / `run_k6_aap_load_local.sh` |
| `aapApiAndUi.js` | AAP API load plus a 2 VU browser probe in parallel | edit the last line of `run_k6_aap_local.sh` |
| `aapAggregate.js` | AAP aggregate consistency | pipeline only |
| `coordinatorApi.js` | Coordinator API | `run_k6_coordinator_local.sh` |
| `handoverApi.js` | Handover service API | `run_k6_handover_local.sh` |
| `san-ui-smoke.js` | SAN browser smoke via the training launcher | `npm run dev:san:k6` / `npm run test:san:k6` |
| `trainingLauncher.js` | Training launcher journey over HTTP (see below) | `run_k6_training_launcher_local.sh` |

## Training launcher journey (`trainingLauncher.js`)

> **Caution:** the defaults are a **1 VU, 1 iteration smoke**. Do not run a load profile (`VUS`, `DURATION`, `CUSTOM_STAGES`) against the training environment without agreement from the team. Training may proxy handover/coordinator calls to the TEST services, so load there can affect other teams.

The test replays the requests the training session launcher makes, without a browser:

1. `GET /training-session-launcher/browse?scenario=<SCENARIO>`: reads `_csrf`, `scenarioId` and `seed` from the scenario form.
2. `POST /training-session-launcher/browse` (Start session): creates the session in Redis (keyed by the `preferencesId` cookie) and in the coordinator. Expects a 302 to `sessions`.
3. `GET /training-session-launcher/sessions`: reads `_csrf` and the new `trainingSessionId`.
4. `POST /training-session-launcher/sessions` with `action=generateLink`: expects a 302 to the handover service link.
5. `GET <handover link>`: follows the handover OAuth redirects into the target service (Sentence Plan by default).

Each iteration uses a fresh cookie jar, so it behaves like a new learner. No credentials are needed.

Run from the repo root:

```
# 1 VU smoke against training (default BASE_URL)
k6 run performance/tests/trainingLauncher.js

# against a local UI (hmpps-arns-assessment-platform-ui docker stack on :3000)
k6 run -e BASE_URL=http://localhost:3000 performance/tests/trainingLauncher.js

# or use the wrapper script
cd performance/utils && ./run_k6_training_launcher_local.sh
```

| Env var | Default | Notes |
| --- | --- | --- |
| `BASE_URL` | `https://arns-assessment-platform-training.hmpps.service.justice.gov.uk` | UI host |
| `SCENARIO` | `default` | Preset scenario id on the browse page |
| `TARGET_APPLICATION` | `sentence-plan` | Value posted with `generateLink` |
| `EXPECTED_LANDING_PATH` | `/sentence-plan/` | Final URL must contain this after the handover |
| `VUS` / `ITERATIONS` | `1` / `1` | Per-VU iterations (smoke) |
| `DURATION` | unset | If set, runs `VUS` constant VUs for this duration |
| `CUSTOM_STAGES` | unset | JSON stages for a ramping-vus profile; overrides the above |
| `P90_THRESHOLD` / `P95_THRESHOLD` | `1000` / `2000` (ms) | `http_req_duration` thresholds |
| `MIN_THINK_TIME` / `MAX_THINK_TIME` | `1` / `3` (s) | Think time between steps |

Thresholds: `checks` rate > 99%, `http_req_failed` < 1%, `launcher_journey_failures` = 0, plus the p90/p95 above. Per-step timings are reported as `launcher_browse_duration`, `launcher_create_session_duration`, `launcher_generate_link_duration` and `launcher_handover_follow_duration` (whole redirect chain).

For capacity planning (ATE-26 comments) a peak FL5 day is roughly 70 to 85 concurrent users. Example load profile, only with agreement:
`CUSTOM_STAGES='[{"duration":"5m","target":85},{"duration":"20m","target":85},{"duration":"2m","target":0}]' k6 run -e BASE_URL=... performance/tests/trainingLauncher.js`

## Browser tests

To run the browser tests head mode and see the browser:
`K6_BROWSER_HEADLESS=false BASE_URL=https://arns-assessment-platform-dev.hmpps.service.justice.gov.uk k6 run performance/tests/san-ui-smoke.js`

## AAP API tests

Smoke and Aggregate consistency tests run on the pipeline as scheduled jobs. 
Dashboards and graphs of various metrics report can be downloaded when they run.
Other tests (load, stress, soak) are setup as separate workflows that can be manually triggered.

Note: for these tests the AAP token is fetched in isolation withink the K6 tests.

if you want to run the performance tests locally, cd into the utils folder and run: 

`./run_k6_aap_local.sh`

Custom stages in the bash script are for the smoke tests, if you'd like to view the UI journeys run in parallel update the last line of the file to: `tests/aapApiAndUi.js`. The default smoke tests configuration will be overriden. 

## The report

At the end of the test a report is generated with an array of different metrics that have been captured during the tests. 
There have been thresholds set on a selection of metrics that have been specified in the load model 
* Server response time is lower than 200 milliseconds in 90% of requests and lower than
500 milliseconds in 100% of requests
This is captured in `browser_http_req_duration` && `browser_http_req_failed`
* The API test metrics are also monitored 
This is captured in `http_req_duration` && `http_req_failed`

Should any of these exceed the selected threshold metric an error will be displayed in the test results.