import { test } from '@playwright/test';
import { login as loginToDelius } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/login'
import {
  deliusPerson,
  Person,
} from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/utils/person'
import { createOffender } from '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/offender/create-offender'

test('Create offender in Ndelius', async ({ page }) => {
  // Import of ESM-only login module
  const { login: loginToDelius } = await import(
    '@ministryofjustice/hmpps-probation-integration-e2e-tests/steps/delius/login'
  )

  // Login using environment variables
  await loginToDelius(page)

  // Create a new person
  const person = deliusPerson()

  // Pass as an object { person } to match createOffender signature
  const crn = await createOffender(page, { person })

  // Log for debugging + annotate in report
  test.info().annotations.push({ type: 'CRN', description: crn })
  console.log('Created offender:', person, 'CRN:', crn)
})