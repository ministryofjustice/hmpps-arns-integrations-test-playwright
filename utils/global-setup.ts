import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const TOKEN_PATH = path.resolve(__dirname, 'token.json'); // SP token
const TOKEN_PATH_2 = path.resolve(__dirname, 'aapToken.json'); // AAP token

let clientId: string;
let clientSecret: string;

let clientIdAap: string;
let clientSecretAap: string;

async function globalSetup() {
  try {
    // Fetch SP token

    if (process.env.CI) {
      // running in GitHub Actions
      clientId = process.env.SP_CLIENT_ID!;
      clientSecret = process.env.SP_CLIENT_SECRET!;
    } else {
      // running locally with kubectl
      clientId = execSync(process.env.CLIENT_ID_SCRIPT!).toString().trim();
      clientSecret = execSync(process.env.CLIENT_SECRET_SCRIPT!).toString().trim();
    }

    console.log('Fetched client ID and client secret for SP token');

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
      throw new Error(`Token request failed: ${resp.status} ${resp.statusText}`);
    }

    const tokenData = await resp.json();
    console.log('SP access token received');

    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokenData, null, 2), 'utf-8');

    // Fetch AAP token
    
    if (process.env.CI) {
      clientIdAap = process.env.AAP_CLIENT_ID!;
      clientSecretAap = process.env.AAP_CLIENT_SECRET!;
    } else {
      clientIdAap = execSync(process.env.AAP_CLIENT_ID_SCRIPT!).toString().trim();
      clientSecretAap = execSync(process.env.AAP_CLIENT_SECRET_SCRIPT!).toString().trim();
    }

    console.log('Fetched client ID and client secret for AAP token');

    const tokenUrlAap = process.env.TOKEN_URL!;
    const paramsAap = new URLSearchParams();
    paramsAap.append('grant_type', 'client_credentials');

    const respAap = await fetch(tokenUrlAap, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${clientIdAap}:${clientSecretAap}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: paramsAap.toString(),
    });

    if (!respAap.ok) {
      throw new Error(`Second token request failed: ${respAap.status} ${respAap.statusText}`);
    }

    const tokenDataAap = await respAap.json();
    console.log('Aap access token received');

    fs.writeFileSync(TOKEN_PATH_2, JSON.stringify(tokenDataAap, null, 2), 'utf-8');

    console.log('✅ All tokens fetched and saved successfully.');
  } catch (err) {
    console.error('Global setup failed:', err);
    throw err;
  }
}

export default globalSetup;
