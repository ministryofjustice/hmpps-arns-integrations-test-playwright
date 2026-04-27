import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import { loadEnvFile } from 'node:process';
loadEnvFile('./.env');

const TOKEN_PATH_AAP = path.resolve(__dirname, 'aapToken.json'); // AAP token
const ASSESSMENTS_PATH_AAP = path.resolve(__dirname, 'assessments.json'); // Assessments

let clientIdAap;
let clientSecretAap;

async function globalSetup() {
  try {
    // Fetch AAP token
    clientIdAap = execSync(process.env.AAP_CLIENT_ID_SCRIPT!).toString().trim();
    clientSecretAap = execSync(process.env.AAP_CLIENT_SECRET_SCRIPT!).toString().trim();

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

    const tokenDataAap: any = await respAap.json();
    console.log('Aap access token received');

    fs.writeFileSync(TOKEN_PATH_AAP, JSON.stringify(tokenDataAap, null, 2), 'utf-8');

    const assessments = [];
    const BASE_URL = process.env.BASE_URL || 'https://arns-assessment-platform-api-dev.hmpps.service.justice.gov.uk';
    const vus = process.env.VUS ? parseInt(process.env.VUS) : 10;

    for (let i = 0; i < vus; i++) {
      const commandPayload = JSON.stringify({
        commands: [
          {
            type: "CreateAssessmentCommand",
            assessmentType: 'TEST',
            formVersion: "1.0",
            properties: {},
            user: { id: "test-user", name: "Test User" },
          },
        ],
      });
  
      const commandResponse = await fetch(`${BASE_URL}/command`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenDataAap.access_token}`,
          "Content-Type": "application/json",
        },
        body: commandPayload
      });
  
      if (!commandResponse.ok) {
          throw new Error(`Assessment command request failed: ${commandResponse.status} ${commandResponse.statusText}`);
      }
      const responseData: any = await commandResponse.json();

      assessments.push({
        assessmentUuid: responseData.commands[0].result.assessmentUuid,
      });
    }
    fs.writeFileSync(ASSESSMENTS_PATH_AAP, JSON.stringify(assessments), 'utf-8');

    console.log('All tokens fetched and saved successfully.');
  } catch (err) {
    console.error('Global setup failed:', err);
    throw err;
  }
}

globalSetup()
