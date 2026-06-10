import { fetchNewToken } from "./auth.js";

export function apiSetup() {
  console.log("Starting AAP initial authentication check...");
  const token = fetchNewToken();
  console.log("Initial AAP Token retrieved successfully");
  return { initialToken: token };
}