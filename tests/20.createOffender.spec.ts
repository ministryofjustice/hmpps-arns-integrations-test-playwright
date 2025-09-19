import { test } from '@playwright/test';
import { login as loginToDelius } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/login'
import {
  deliusPerson,
  Person,
} from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/utils/person'
import { createOffender } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/offender/create-offender'

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