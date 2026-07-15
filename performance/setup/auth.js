import http from "k6/http";
import { b64encode } from "k6/encoding";

export function fetchNewToken() {
  const clientId = __ENV.AAP_CLIENT_ID;
  const clientSecret = __ENV.AAP_CLIENT_SECRET;
  const tokenUrl = __ENV.TOKEN_URL;

  if (!clientId || !clientSecret || !tokenUrl) {
    throw new Error(
      "Missing required environment variables: AAP_CLIENT_ID, AAP_CLIENT_SECRET, or TOKEN_URL"
    );
  }

  const encodedCredentials = b64encode(`${clientId}:${clientSecret}`);

  const params = {
    headers: {
      Authorization: `Basic ${encodedCredentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };

  const payload = "grant_type=client_credentials";
  const res = http.post(tokenUrl, payload, params);

  if (res.status !== 200) {
    console.error(
      `Auth Refresh Failed! Status: ${res.status} Body: ${res.body}`
    );
    throw new Error(`Authentication failed with status ${res.status}`);
  }

  const body = res.json();
  if (!body || !body.access_token) {
    throw new Error("No 'access_token' found in response");
  }

  return body.access_token;
}