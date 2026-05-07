#!/bin/bash

cd ..

CLIENT_ID=$(exec kubectl -n hmpps-arns-assessment-platform-dev get secret hmpps-arns-assessment-platform-ui-client-creds -o jsonpath='{.data.CLIENT_CREDS_CLIENT_ID}' | base64 -d)
CLIENT_SECRET=$(exec kubectl -n hmpps-arns-assessment-platform-dev get secret hmpps-arns-assessment-platform-ui-client-creds -o jsonpath='{.data.CLIENT_CREDS_CLIENT_SECRET}' | base64 -d)

STAGES='[
  {"duration": "3s", "target": 1}
]'

k6 run \
  -e AAP_CLIENT_ID="$CLIENT_ID" \
  -e AAP_CLIENT_SECRET="$CLIENT_SECRET" \
  -e TOKEN_URL="https://sign-in-dev.hmpps.service.justice.gov.uk/auth/oauth/token" \
  -e CUSTOM_STAGES="$STAGES" \
 tests/handoverApi.js