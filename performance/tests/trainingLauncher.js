import http from 'k6/http';
import { check, fail, group, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';

/*
 * Training launcher journey (ATE-26), HTTP only:
 *   1. GET  /training-session-launcher/browse?scenario=<SCENARIO>   -> _csrf, scenarioId, seed
 *   2. POST /training-session-launcher/browse (Start session)       -> 302 to sessions (creates session + coordinator association)
 *   3. GET  /training-session-launcher/sessions                     -> _csrf, trainingSessionId of the new session
 *   4. POST /training-session-launcher/sessions action=generateLink -> 302 to the handover service link
 *   5. GET  <handover link>, following redirects through the handover OAuth flow into the target service
 *
 * Each iteration uses a fresh cookie jar, so it behaves like a new learner with its own preferencesId cookie.
 *
 * CAUTION: the default is a 1 VU, 1 iteration smoke. Do not run a load profile against training without agreement
 * (training may proxy handover/coordinator calls to the TEST services).
 */

const BASE_URL = (__ENV.BASE_URL || 'https://arns-assessment-platform-training.hmpps.service.justice.gov.uk').replace(
  /\/$/,
  ''
);
const SCENARIO = __ENV.SCENARIO || 'default';
const TARGET_APPLICATION = __ENV.TARGET_APPLICATION || 'sentence-plan';
const EXPECTED_LANDING_PATH = __ENV.EXPECTED_LANDING_PATH || '/sentence-plan/';

const VUS = __ENV.VUS ? parseInt(__ENV.VUS) : 1;
const ITERATIONS = __ENV.ITERATIONS ? parseInt(__ENV.ITERATIONS) : 1;
const DURATION = __ENV.DURATION;
const P90_THRESHOLD = __ENV.P90_THRESHOLD ? parseInt(__ENV.P90_THRESHOLD) : 1000;
const P95_THRESHOLD = __ENV.P95_THRESHOLD ? parseInt(__ENV.P95_THRESHOLD) : 2000;
const MIN_THINK = __ENV.MIN_THINK_TIME ? parseFloat(__ENV.MIN_THINK_TIME) : 1;
const MAX_THINK = __ENV.MAX_THINK_TIME ? parseFloat(__ENV.MAX_THINK_TIME) : 3;

const LAUNCHER_PATH = '/training-session-launcher';

const browseDuration = new Trend('launcher_browse_duration', true);
const createSessionDuration = new Trend('launcher_create_session_duration', true);
const generateLinkDuration = new Trend('launcher_generate_link_duration', true);
const handoverFollowDuration = new Trend('launcher_handover_follow_duration', true);
const journeyFailures = new Counter('launcher_journey_failures');

function buildScenario() {
  if (__ENV.CUSTOM_STAGES) {
    return { executor: 'ramping-vus', startVUs: 0, stages: JSON.parse(__ENV.CUSTOM_STAGES) };
  }
  if (DURATION) {
    return { executor: 'constant-vus', vus: VUS, duration: DURATION };
  }
  return { executor: 'per-vu-iterations', vus: VUS, iterations: ITERATIONS, maxDuration: '5m' };
}

export const options = {
  thresholds: {
    checks: ['rate>0.99'],
    http_req_failed: ['rate<0.01'],
    http_req_duration: [`p(95)<${P95_THRESHOLD}`, `p(90)<${P90_THRESHOLD}`],
    launcher_journey_failures: ['count<1'],
  },
  scenarios: {
    training_launcher: { ...buildScenario(), exec: 'trainingLauncherJourney' },
  },
};

function simulateThinkingTime() {
  sleep(MIN_THINK + Math.random() * (MAX_THINK - MIN_THINK));
}

function abort(step, res) {
  journeyFailures.add(1, { step });
  fail(`${step} failed: status=${res.status} url=${res.url}`);
}

function inputValue(form, name) {
  return form.find(`input[name="${name}"]`).attr('value');
}

export function trainingLauncherJourney() {
  const jar = new http.CookieJar();
  let csrf;
  let seed;
  let trainingSessionId;
  let handoverLink;

  group('01 browse scenario', () => {
    const res = http.get(`${BASE_URL}${LAUNCHER_PATH}/browse?scenario=${SCENARIO}`, {
      jar,
      tags: { name: 'launcher_browse' },
    });
    browseDuration.add(res.timings.duration);

    const form = res.status === 200 ? res.html().find(`form:has(input[name="scenarioId"][value="${SCENARIO}"])`) : null;
    csrf = form && inputValue(form, '_csrf');
    seed = form && inputValue(form, 'seed');

    if (
      !check(res, {
        'browse: status 200': (r) => r.status === 200,
        'browse: has csrf and seed': () => !!csrf && !!seed,
      })
    ) {
      abort('browse', res);
    }
  });

  simulateThinkingTime();

  group('02 start session', () => {
    const res = http.post(
      `${BASE_URL}${LAUNCHER_PATH}/browse?scenario=${SCENARIO}`,
      { _csrf: csrf, scenarioId: SCENARIO, seed },
      { jar, redirects: 0, tags: { name: 'launcher_create_session' } }
    );
    createSessionDuration.add(res.timings.duration);

    if (
      !check(res, {
        'create session: 302': (r) => r.status === 302,
        'create session: redirects to sessions': (r) => /sessions/.test(r.headers.Location || ''),
      })
    ) {
      abort('create session', res);
    }
  });

  group('03 sessions page', () => {
    const res = http.get(`${BASE_URL}${LAUNCHER_PATH}/sessions`, { jar, tags: { name: 'launcher_sessions' } });

    // Sessions are listed newest first, so the first session form is the one just created
    const form = res.status === 200 ? res.html().find('form:has(input[name="trainingSessionId"])').first() : null;
    trainingSessionId = form && inputValue(form, 'trainingSessionId');
    csrf = form && inputValue(form, '_csrf');

    if (
      !check(res, {
        'sessions: status 200': (r) => r.status === 200,
        'sessions: has new session': () => !!trainingSessionId && !!csrf,
      })
    ) {
      abort('sessions', res);
    }
  });

  simulateThinkingTime();

  group('04 generate handover link', () => {
    const res = http.post(
      `${BASE_URL}${LAUNCHER_PATH}/sessions`,
      { _csrf: csrf, trainingSessionId, targetApplication: TARGET_APPLICATION, action: 'generateLink' },
      { jar, redirects: 0, tags: { name: 'launcher_generate_link' } }
    );
    generateLinkDuration.add(res.timings.duration);
    handoverLink = res.headers.Location;

    if (
      !check(res, {
        'generate link: 302': (r) => r.status === 302,
        'generate link: redirects to handover': () => /\/handover\//.test(handoverLink || ''),
      })
    ) {
      abort('generate link', res);
    }
  });

  group('05 follow handover link', () => {
    // res.timings only covers the last hop, so time the whole redirect chain
    const start = Date.now();
    const res = http.get(handoverLink, { jar, tags: { name: 'launcher_follow_handover' } });
    handoverFollowDuration.add(Date.now() - start);

    if (
      !check(res, {
        'handover: status 200': (r) => r.status === 200,
        'handover: lands in target service': (r) => r.url.includes(EXPECTED_LANDING_PATH),
      })
    ) {
      abort('follow handover', res);
    }
  });

  simulateThinkingTime();
}

// Lets `k6 run --vus N --iterations N` (which replaces the scenarios block) still run the journey
export default trainingLauncherJourney;
