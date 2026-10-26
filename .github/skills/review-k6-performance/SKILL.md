---
name: review-k6-performance
description: 'Review k6 performance tests under performance/ in the ARNS integration test repo. Use when reviewing load, soak, stress, smoke, aggregate or hybrid API/browser k6 scripts, thresholds, VUs, stages, think time, token refresh, test data setup (performance/setup), or local run shell scripts.'
---

# Review k6 Performance Tests

## Layout
- `performance/tests/*.js` — k6 entry scripts. Run in CI as `k6 run performance/tests/${test_name}.js` by `.github/workflows/smoke-performance-test.yml` and the `aap-*-performance-test.yml` workflows.
- `performance/setup/` — token/auth helpers and `data.ts` (run with `npx ts-node` before some tests).
- `performance/helpers/thinking.js` — think time using `MIN_THINK_TIME` / `MAX_THINK_TIME`.
- `performance/utils/*.sh` — local runners.
- `performance/oastub-archive/` — legacy, do not extend.

## Checklist

### Contract with workflows
- [ ] Script file name matches the `test_name` used by the calling workflow (renaming breaks the scheduled job).
- [ ] Config read from `__ENV` (`VUS`, `DURATION`, `CUSTOM_STAGES`, `P90_THRESHOLD`, `P95_THRESHOLD`, `MIN_THINK_TIME`, `MAX_THINK_TIME`, `TOKEN_URL`, `AAP_CLIENT_ID`, `AAP_CLIENT_SECRET`) with safe defaults; any new variable is added to the workflow `env:` block.
- [ ] `BASE_URL`: new or changed scripts should use `__ENV.BASE_URL || '<dev url>'` (as in `aapApi-smoke.js`, `aapApi-load.js`). Known exceptions that still hard-code it: `aapApi.js`, `aapAggregate.js`, `coordinatorApi.js`, `handoverApi.js` — only flag these if the PR touches the `BASE_URL` line or the script is being refactored.
- [ ] `JSON.parse(__ENV.CUSTOM_STAGES)` and numeric parsing are guarded.

### Thresholds and checks
- [ ] Thresholds present (`http_req_failed` and `http_req_duration` p(95)/p(90)) and each script's existing defaults not loosened without justification. Defaults differ per script — compare against the script's own previous values, not a single baseline (e.g. `aapApi*.js` p(90)<200; `coordinatorApi.js`, `handoverApi.js`, `aapAggregate.js` p(90)<400).
- [ ] Every request has a `check()` on status (and key body fields), so failures are counted, not just latency.
- [ ] Requests use `tags: { name: '...' }` for parameterised URLs to avoid high-cardinality metrics.

### Realism and safety
- [ ] Think time used between user actions (via `helpers/thinking.js`), not tight loops.
- [ ] VUs/duration defaults are appropriate for the target environment; nothing defaults to stress-level load against shared dev/test.
- [ ] Token refresh is handled for long-running profiles (soak/load) — existing pattern refreshes ~every 20 min.
- [ ] Per-VU data is unique or deliberately shared; setup data created in `setup()` / `performance/setup/data.ts` is not mutated concurrently in unsafe ways.
- [ ] Created data is cleaned up or clearly marked as performance data.

### Secrets and output
- [ ] Credentials only from `__ENV`; not logged with `console.log`.
- [ ] HTML dashboard export (`K6_WEB_DASHBOARD_EXPORT`) and summary output paths still align with the workflow artefact upload.

### Shell scripts
- [ ] `set -euo pipefail` (or equivalent) and quoted variables.
- [ ] No secrets echoed; credentials fetched via env or local secret tooling.
