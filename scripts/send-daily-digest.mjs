#!/usr/bin/env node
/**
 * Manual trigger for the daily digest cron.
 * Run:  node scripts/send-daily-digest.mjs
 * Requires the dev server to be running on localhost:3000.
 */

const BASE_URL    = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
const CRON_SECRET = process.env.CRON_SECRET  ?? "ops-cron-local-dev-secret";

const res = await fetch(`${BASE_URL}/api/cron/daily-digest`, {
  headers: { authorization: `Bearer ${CRON_SECRET}` },
});

const body = await res.json();
console.log("Status:", res.status);
console.log(JSON.stringify(body, null, 2));
