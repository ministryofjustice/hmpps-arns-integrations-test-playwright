import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

async function fetchAndSaveToken(
  tokenName: string,
  tokenPath: string,
  envClientId: string | undefined,
  envClientSecret: string | undefined,
  scriptClientId: string | undefined,
  scriptClientSecret: string | undefined
) {
  let clientId: string;
  let clientSecret: string;

  if (process.env.CI) {
    clientId = envClientId!;
    clientSecret = envClientSecret!;
  } else {
    clientId = execSync(scriptClientId!).toString().trim();
    clientSecret = execSync(scriptClientSecret!).toString().trim();
  }

  const tokenUrl = process.env.TOKEN_URL!;
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');

  const resp = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!resp.ok) {
    throw new Error(`${tokenName} token request failed: ${resp.status} ${resp.statusText}`);
  }

  const tokenData = await resp.json();
  fs.writeFileSync(tokenPath, JSON.stringify(tokenData, null, 2), 'utf-8');
  console.log(`${tokenName} access token received and saved.`);
}

async function globalSetup() {
  try {
    console.log('Starting global setup: Fetching API tokens...');

    // Fetch SP Token
    await fetchAndSaveToken(
      'SP',
      path.resolve(__dirname, 'token.json'),
      process.env.SP_CLIENT_ID, process.env.SP_CLIENT_SECRET,
      process.env.CLIENT_ID_SCRIPT, process.env.CLIENT_SECRET_SCRIPT
    );

    // Fetch AAP Token
    await fetchAndSaveToken(
      'AAP',
      path.resolve(__dirname, 'aapToken.json'),
      process.env.AAP_CLIENT_ID, process.env.AAP_CLIENT_SECRET,
      process.env.AAP_CLIENT_ID_SCRIPT, process.env.AAP_CLIENT_SECRET_SCRIPT
    );

    // Fetch ARNS Assessment Token
    await fetchAndSaveToken(
      'ARNS Assessment',
      path.resolve(__dirname, 'arnsAssessmentToken.json'),
      process.env.ARNS_ASSESSMENT_CLIENT_ID, process.env.ARNS_ASSESSMENT_CLIENT_SECRET,
      process.env.ARNS_ASSESSMENT_CLIENT_ID_SCRIPT, process.env.ARNS_ASSESSMENT_CLIENT_SECRET_SCRIPT
    );

    console.log('All tokens fetched and saved successfully.');
  } catch (err) {
    console.error('Global setup failed:', err);
    throw err;
  }
}

export default globalSetup;