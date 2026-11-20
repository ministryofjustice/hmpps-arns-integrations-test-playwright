#!/bin/bash

# Smoke run of the training launcher journey (1 VU, 1 iteration by default). No credentials needed.
# Point BASE_URL at a local UI (e.g. http://localhost:3000) or another environment to override training.
# Do NOT raise VUS / DURATION / CUSTOM_STAGES against training without agreement from the team.

cd ..

k6 run \
  -e BASE_URL="${BASE_URL:-https://arns-assessment-platform-training.hmpps.service.justice.gov.uk}" \
  -e SCENARIO="${SCENARIO:-default}" \
  -e VUS="${VUS:-1}" \
  -e ITERATIONS="${ITERATIONS:-1}" \
 tests/trainingLauncher.js
