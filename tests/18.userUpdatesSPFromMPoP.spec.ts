import {test} from '@playwright/test';
import { MpopPages } from '../page-objects/mpop-pages';

test('user updates their goal agreement', async ({ page }) => {

  const mpopPages = new MpopPages(page);

  // Navigate to the MPoP landing page
  await mpopPages.navigateToMpopLink();

  // Authenticate via hmpps auth
  await mpopPages.authenticateWithHmppsAuthCredentials();

  });
