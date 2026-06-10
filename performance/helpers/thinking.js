
// Default to 1s min and 5s max (Smoke Test settings)
const MIN_THINK = __ENV.MIN_THINK_TIME ? parseInt(__ENV.MIN_THINK_TIME) : 5;
const MAX_THINK = __ENV.MAX_THINK_TIME ? parseInt(__ENV.MAX_THINK_TIME) : 10;

export function simulate() {
  const range = MAX_THINK - MIN_THINK;
  const waitTime = Math.random() * range + MIN_THINK;
  sleep(waitTime);
}
