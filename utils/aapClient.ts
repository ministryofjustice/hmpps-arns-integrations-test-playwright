import fs from 'fs';
import fetch from 'node-fetch';

const BASE_URL = 'https://arns-assessment-platform-api-dev.hmpps.service.justice.gov.uk';

export interface CreateAssessmentResult {
    commands: {
        request: {
            type: 'CreateAssessmentCommand';
            user: {
                id: string;
                name: string;
            };
        };
        result: {
            type: 'CreateAssessmentCommandResult';
            assessmentUuid: string;
            message: string;
            success: boolean;
        };
    }[];
}

export async function createAssessment(): Promise<CreateAssessmentResult> {
    const token = JSON.parse(
        fs.readFileSync('utils/aapToken.json', 'utf8')
    ).access_token;

    const resp = await fetch(`${BASE_URL}/command`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            commands: [
                {
                    type: 'CreateAssessmentCommand',
                    user: { id: 'test-user', name: 'Test User' },
                },
            ],
        }),
    });

    if (!resp.ok) {
        throw new Error(
            `CreateAssessment failed: ${resp.status} ${resp.statusText}`
        );
    }

    const body: CreateAssessmentResult = await resp.json();

    // Sanity check the UUID exists
    const assessmentUuid = body?.commands?.[0]?.result?.assessmentUuid;
    if (!assessmentUuid) throw new Error('No assessmentUuid found');

    return body; // Return full API response
}

export async function queryAssessment(assessmentUuid: string) {
    const token = JSON.parse(
        fs.readFileSync('utils/aapToken.json', 'utf8')
    ).access_token;
    const timeStamp = new Date().toISOString().split('.')[0];

    const resp = await fetch(`${BASE_URL}/query`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            queries: [
                {
                    type: 'AssessmentVersionQuery',
                    user: { id: 'test-user', name: 'Test User' },
                    timeStamp,
                    assessmentUuid,
                },
            ],
        }),
    });

    if (!resp.ok) {
        throw new Error(
            `QueryAssessment failed: ${resp.status} ${resp.statusText}`
        );
    }

    return resp.json();
}