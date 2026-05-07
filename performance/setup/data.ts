import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const TOKEN_PATH_AAP = path.resolve(__dirname, 'aapToken.json'); // AAP token
const ASSESSMENTS_PATH_AAP = path.resolve(__dirname, 'assessments.json'); // Assessments

let clientIdAap;
let clientSecretAap;

async function globalSetup() {
  try {
    if (process.env.CI) {
      // running in GitHub Actions
      clientIdAap = process.env.AAP_CLIENT_ID!;
      clientSecretAap = process.env.AAP_CLIENT_SECRET!;
    } else {
      // running locally with kubectl
      clientIdAap = execSync(process.env.AAP_CLIENT_ID_SCRIPT!).toString().trim();
      clientSecretAap = execSync(process.env.AAP_CLIENT_SECRET_SCRIPT!).toString().trim();
    }

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
    const vus = process.env.VUS ? parseInt(process.env.VUS) : 5;

    for (let i = 0; i < vus; i++) {
      const crn = Math.random().toString().substring(2, 7);
      const commandPayload = JSON.stringify({
        commands: [
          {
            type: 'CreateAssessmentCommand',
            assessmentType: 'SENTENCE_PLAN',
            formVersion: '1.0',
            properties: {
              AGREEMENT_STATUS: { type: 'Single', value: 'DRAFT' },
              AGREEMENT_DATE: { type: 'Single', value: '' },
              AGREEMENT_NOTES: { type: 'Single', value: '' },
              PLAN_TYPE: { type: 'Single', value: 'INITIAL' },
            },
            user: { id: 'test-user', name: 'Test User' },
            identifiers: {
              CRN: crn,
            },
            flags: ['SAN_BETA'],
          }
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

      const commandGoalsPayload = JSON.stringify({
        commands: [
          {
            type: 'CreateCollectionCommand',
            name: 'GOALS',
            assessmentUuid: responseData.commands[0].result.assessmentUuid,
            user: { id: 'test-user', name: 'Test User' },
            identifiers: {
              CRN: crn,
            },
            flags: ['SAN_BETA'],
          },
        ],
      });

      const goalsResponse = await fetch(`${BASE_URL}/command`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenDataAap.access_token}`,
          "Content-Type": "application/json",
        },
        body: commandGoalsPayload,
      });
    
      if (!goalsResponse.ok) {
        throw new Error(`Goals collection command request failed: ${goalsResponse.status} ${goalsResponse.statusText}`);
      }
      
      const goalsCollectionBody = await goalsResponse.json();

      const commandCreateGoalPayload = JSON.stringify({
        commands: [
          {
            type: 'AddCollectionItemCommand',
            name: 'GOALS',
            assessmentUuid: responseData.commands[0].result.assessmentUuid,
            collectionUuid: goalsCollectionBody?.commands?.[0]?.result?.collectionUuid,
            user: { id: 'test-user', name: 'Test User' },
            identifiers: {
              CRN: crn,
            },
            flags: ['SAN_BETA'],
            properties: {
              status: {
                type: 'Single',
                value: 'ACTIVE',
              },
              status_date: {
                type: 'Single',
                value: '2026-02-23T17:30:11.179Z',
              },
            },
            answers: {
              title: {
                type: 'Single',
                value: 'I will work towards finding accommodation, so that I am no longer homeless',
              },
              target_date: {
                type: 'Single',
                value: '2026-05-23T16:30:11.151Z',
              },
              area_of_need: {
                type: 'Single',
                value: 'accommodation',
              },
              related_areas_of_need: {
                type: 'Multi',
                values: ['alcohol-use'],
              },
            },
          },
        ],
      });

      const createGoalResponse = await fetch(`${BASE_URL}/command`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenDataAap.access_token}`,
          "Content-Type": "application/json",
        },
        body: commandCreateGoalPayload,
      });
    
      if (!createGoalResponse.ok) {
        throw new Error(`Create Goals command request failed: ${createGoalResponse.status} ${createGoalResponse.statusText}`);
      }

      const createGoalBody = await createGoalResponse.json();

      const commandStepsPayload = JSON.stringify({
        commands: [
          {
            type: 'CreateCollectionCommand',
            name: 'STEPS',
            parentCollectionItemUuid: createGoalBody?.commands?.[0]?.result?.collectionItemUuid,
            assessmentUuid: responseData.commands[0].result.assessmentUuid,
            user: { id: 'test-user', name: 'Test User' },
            identifiers: {
              CRN: crn,
            },
            flags: ['SAN_BETA'],
          },
        ],
      });

      const stepsResponse = await fetch(`${BASE_URL}/command`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenDataAap.access_token}`,
          "Content-Type": "application/json",
        },
        body: commandStepsPayload,
      });
    
      if (!stepsResponse.ok) {
        throw new Error(`Goals collection command request failed: ${stepsResponse.status} ${stepsResponse.statusText}`);
      }
      
      const stepsCollectionBody = await stepsResponse.json();

      const commandCreateStepPayload = JSON.stringify({
        commands: [
          {
            type: 'AddCollectionItemCommand',
            assessmentUuid: responseData.commands[0].result.assessmentUuid,
            collectionUuid: stepsCollectionBody?.commands?.[0]?.result?.collectionUuid,
            user: { id: 'test-user', name: 'Test User' },
            identifiers: {
              CRN: crn,
            },
            flags: ['SAN_BETA'],
            properties: {
              status_date: {
                type: 'Single',
                value: '2026-02-23T17:30:11.850Z',
              },
            },
            answers: {
              actor: {
                type: 'Single',
                value: 'probation_practitioner',
              },
              status: {
                type: 'Single',
                value: 'NOT_STARTED',
              },
              description: {
                type: 'Single',
                value: 'Step 1',
              },
            },
          },
        ],
      });

      const createStepResponse = await fetch(`${BASE_URL}/command`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${tokenDataAap.access_token}`,
          "Content-Type": "application/json",
        },
        body: commandCreateStepPayload,
      });
    
      if (!createStepResponse.ok) {
        throw new Error(`Create Goals command request failed: ${createStepResponse.status} ${createStepResponse.statusText}`);
      }
    }
    fs.writeFileSync(ASSESSMENTS_PATH_AAP, JSON.stringify(assessments), 'utf-8');

    console.log('All tokens fetched and saved successfully.');
  } catch (err) {
    console.error('Global setup failed:', err);
    throw err;
  }
}

globalSetup()
