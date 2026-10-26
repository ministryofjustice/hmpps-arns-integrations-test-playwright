---
name: review-ci-workflows
description: 'Review GitHub Actions workflows, reusable workflow_call contracts, npm scripts and chainguard OIDC policies in the ARNS integration test repo. Use when reviewing .github/workflows (playwright.yml, playwright-action*.yml, smoke-performance-test.yml, aap-*-performance-test.yml, sync-test-catalogue.yml), package.json scripts, workflow inputs, secrets, Slack alerts, or changes that affect other repositories calling these tests.'
---

# Review CI Workflows and Pipeline Contracts

Other HMPPS repos call this repo's reusable workflows. Treat their inputs, outputs, script names and required secrets as a **public API**.

## Public contracts

**`.github/workflows/playwright.yml`** (`workflow_call`)
- Inputs: `channel_id` (default `NO_SLACK`), `environment` (default `dev`), `source` (default `all`), `branch` (default `main`).
- Runs `npm run ${environment}:${source}:ci` → requires a matching script in `package.json` for every supported combination (`dev|test` × `all|aap|san|arns`).
- Publishes `ctrf/ctrf-report.json`, uploads `test-results/**` on failure, posts Slack on failure.

**`.github/workflows/smoke-performance-test.yml`** (`workflow_call`)
- Inputs: `channel_id`, `test_name` → runs `performance/tests/${test_name}.js`.

## Checklist

### Backwards compatibility
- [ ] No input removed/renamed, no default changed, no new **required** input without coordinating with caller repos.
- [ ] If a new `source` value is introduced, matching `dev:<source>:ci` and `test:<source>:ci` scripts and Playwright projects exist.
- [ ] Renamed/removed npm scripts or k6 script files are not referenced by any workflow (search `.github/workflows/` for the old name).
- [ ] New required secrets are documented; callers use `secrets: inherit`, so the secret must exist in caller repos too.

### Security
- [ ] Secrets only referenced via `${{ secrets.X }}` in `env:`, never interpolated directly into `run:` scripts or echoed.
- [ ] Untrusted inputs (`inputs.*`, `github.head_ref`, PR titles) are not interpolated directly into `run:` shell — pass via `env:` and quote (script injection).
- [ ] `permissions:` are least-privilege; `contents: write` only where needed (e.g. catalogue sync).
- [ ] Workflows triggered by `pull_request` don't expose secrets to forks; avoid `pull_request_target` with checkout of PR head.
- [ ] Third-party actions pinned to a major version at minimum; prefer SHA for less-trusted actions. Flag downgrades.
- [ ] `.github/chainguard/*.sts.yaml` subject patterns are not widened (e.g. `repo:org/*`) without reason.

### Reliability
- [ ] Self-hosted runner label `[self-hosted, hmpps-github-actions-runner]` used for jobs needing internal network access.
- [ ] `timeout-minutes` set on long jobs.
- [ ] Artefact/report steps use `if: always()` or `if: failure()` appropriately.
- [ ] Slack step guarded so `NO_SLACK` doesn't fail the job.
- [ ] Cron schedules don't overlap heavy performance runs with daytime functional runs on shared environments.

### package.json
- [ ] Script naming follows `<env>:<source>:ci` / `<env>:<type>` patterns; `SOURCE=` prefix matches `global-setup.ts` values (`AAP`, `SAN`, `ARNS`).
- [ ] Dependency changes: `npm ci` lockfile updated; `audit-ci.json` allowlist not extended without a linked justification; `@playwright/test` bump accompanied by `npx playwright install` compatibility (handled in workflow).
