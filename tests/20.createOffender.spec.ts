import { test, expect } from '@playwright/test';
import { login as loginToDelius } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/login'
import {
  deliusPerson,
  Person,
} from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/utils/person'
import { createOffender } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/offender/create-offender'
import fs from 'fs';

var globalCRN = '' //Need to think of another way to do this in case tests run in parallel

test('Create offender in Ndelius', async ({ page }) => {
  // Login using environment variables
  await loginToDelius(page)

  // Create a new person
  const person = deliusPerson()

  // Pass a person object to match createOffender signature
  const crn = await createOffender(page, { person })

  // Log new offender details
  console.log('Created offender:', person, 'CRN:', crn)
  globalCRN = crn
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
  const planId = postBody.planId;

  console.log('Created plan with ID:', planId);

  // Step 2: PUT to update the plan
  const putResponse = await request.put(`https://sentence-plan-api-dev.hmpps.service.justice.gov.uk/plans/associate/${planId}/${globalCRN}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  expect(putResponse.status()).toBe(202);

  console.log('Plan assigned successfully');
});