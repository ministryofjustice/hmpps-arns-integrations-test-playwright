import { test, expect } from '@playwright/test';
import fs from 'fs';

// Generate ISO timestamp in "yyyy-MM-ddTHH:mm:ss" UTC format
const timeStamp: string = new Date().toISOString().split('.')[0];

test('create an assessment in AAP and query', async ({ request }) => {
    // Step 1: POST Command request
    const token = JSON.parse(fs.readFileSync('utils/aapToken.json', 'utf8')).access_token;

    const commandResponse = await request.post('https://arns-assessment-platform-api-dev.hmpps.service.justice.gov.uk/command', {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        data: {
            commands: [
                {
                    type: "CreateAssessmentCommand",
                    timeStamp,
                    user: {
                        id: "test-user",
                        name: "Test User",
                    },
                },
            ],
        },
    });

    expect(commandResponse.status()).toBe(200);
    const postBody = await commandResponse.json();
    const assessmentUuid = postBody.assessmentUuid;

    console.log('Created AAP assessment with ID:', assessmentUuid);

    // Step 2: POST query request
    const queryResponse = await request.post(`https://arns-assessment-platform-api-dev.hmpps.service.justice.gov.uk/query`, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        data: {
            queries: [
                {
                    type: 'AssessmentVersionQuery',
                    user: {
                        id: 'test-user',
                        name: 'Test User',
                    },
                    timeStamp,
                    assessmentUuid: 'daebf9de-bfdd-4831-bfdc-a8dcac86a92a',
                },
            ],
        },
    });

    expect(queryResponse.status()).toBe(200);
    const putBody = await queryResponse.json();
    console.log('AAP assessment queried successfully');
});