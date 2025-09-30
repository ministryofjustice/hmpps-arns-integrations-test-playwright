import { test, expect } from '@playwright/test';
import { login as loginToDelius } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/login'
import {
  deliusPerson,
  Person,
} from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/utils/person'
import { createOffender } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/offender/create-offender'
import fs from 'fs';

test('Create offender in Ndelius', async ({ page }) => {
  // Login using environment variables
  await loginToDelius(page)

  // Create a new person
  const person = deliusPerson()

  // Pass a person object to match createOffender signature
  const crn = await createOffender(page, { person })

  // Log new offender details for test report and local runs
  test.info().annotations.push({ type: 'CRN', description: crn })
  console.log('Created offender:', person, 'CRN:', crn)
})

test('create and add a sentence plan against the offender', async ({ request }) => {
  const token = JSON.parse(fs.readFileSync('utils/token.json', 'utf8')).access_token;
  const postResponse = await request.post('https://sentence-plan-api-dev.hmpps.service.justice.gov.uk/coordinator/plan', {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: {
      planType: 'INITIAL',
      userDetails: {
        id: 'string',
        name: 'string',
        location: 'PRISON',
      },
    },
  });

  expect(postResponse.status()).toBe(201);
  const postBody = await postResponse.json();
  console.log(postBody);

  const planId = postBody.planId; // or postBody.uuid, depending on your API

  console.log('Created plan with ID:', planId);

  // Step 2: PUT to update the plan
  const putResponse = await request.put(`https://sentence-plan-api-dev.hmpps.service.justice.gov.uk/plans/associate/${planId}/${crn}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    data: {
      planUuid: planId,
      crn: 'officer-123',
    },
  });

  expect(putResponse.status()).toBe(200); 
  const putBody = await putResponse.json();

  console.log('Assigned plan:', putBody);
});