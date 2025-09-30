import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const TOKEN_PATH = path.resolve(__dirname, 'token.json');

async function globalSetup() {
    try {
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
        console.log(resp);

        if (!resp.ok) {
            throw new Error(`Token request failed: ${resp.status} ${resp.statusText}`);
        }

        const tokenData = await resp.json();
        console.log(tokenData);
        console.log('Access token received:', tokenData.access_token);

        // Save token to file
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokenData, null, 2), 'utf-8');
        console.log('Token written to:', TOKEN_PATH);

    } catch (err) {
        console.error('Global setup failed:', err);
        throw err;
    }
}

export default globalSetup;