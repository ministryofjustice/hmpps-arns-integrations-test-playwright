import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const TOKEN_PATH = path.resolve(__dirname, 'token.json');
let clientId: string;
let clientSecret: string;

async function globalSetup() {
  if (process.env.CI) {
    // running in GitHub Actions
    clientId = process.env.SP_CLIENT_ID!;
    clientSecret = process.env.SP_CLIENT_SECRET!;
  } else {
    // running locally with kubectl
    const clientId = execSync(
      process.env.CLIENT_ID_SCRIPT
    ).toString().trim();

    const clientSecret = execSync(
      process.env.CLIENT_SECRET_SCRIPT
    ).toString().trim();

    console.log('Fetched client ID and client secret');

    // Request OAuth 2.0 token using client credentials
    const tokenUrl = process.env.TOKEN_URL;

    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');

    const resp = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + Buffer.from(`${clientId}:${clientSecret}`).toString('base64'),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!resp.ok) {
      throw new Error(`Token request failed: ${resp.status} ${resp.statusText}`);
    }

    const tokenData = await resp.json();
    console.log('Access token received')

    // Save token to file
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokenData, null, 2), 'utf-8');

  } catch (err) {
    console.error('Global setup failed:', err);
    throw err;
  }
}

export default globalSetup;