#!/bin/bash

SCRIPT_PATH="../tests/browserAndApi.js"

# Run the extract step
echo "Running extract step..."
extracted_output=$(k6 run "$SCRIPT_PATH" --env SCENARIO=extract 2>&1)

# Debug the raw k6 output
echo "----- k6 raw output -----"
echo "$extracted_output"
echo "--------------------------"

# Extract the URL from the raw k6 output
EXTRACTED_URL=$(echo "$extracted_output" \
  | grep -Eo 'https://[^ "]+' \
  | head -n1 \
  | tr -d '\r')

# Check if the URL was extracted successfully
if [ -z "$EXTRACTED_URL" ]; then
  echo "ERROR: Could not extract URL."
  exit 1
fi

echo "Extracted URL: $EXTRACTED_URL"

echo "Running test..."
## Pass the scenario(s) you want to run in the command below after "--env Scenario=", separated by a comma. Eg: browser,load
## The test setup supports the run of browser and API tests in isolation, or API test with browser running in parallel.
k6 run "$SCRIPT_PATH" --env SCENARIO=smoke --env EXTRACTED_URL="$EXTRACTED_URL"