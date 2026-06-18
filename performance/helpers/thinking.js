
// Default to 1s min and 5s max (Smoke Test settings)
const MIN_THINK = __ENV.MIN_THINK_TIME ? parseInt(__ENV.MIN_THINK_TIME) : 5;
const MAX_THINK = __ENV.MAX_THINK_TIME ? parseInt(__ENV.MAX_THINK_TIME) : 10;

export function simulate() {
  const range = MAX_THINK - MIN_THINK;
  const waitTime = Math.random() * range + MIN_THINK;
  sleep(waitTime);
}

export function logNormal(mu, sigma) {
    // Standard Box-Muller transform to get a normal distribution
    let u1 = Math.random();
    let u2 = Math.random();

    // Ensure u1 is not exactly 0 to avoid Math.log(0) which is -Infinity
    while (u1 <= 0) u1 = Math.random();

    let z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

    // Apply log-normal transformation
    return Math.exp(mu + sigma * z0);
}
