#!/usr/bin/env node
const fs = require("fs");

const path = process.argv[2] || "SYNC_SUMMARY.json";
if (!fs.existsSync(path)) {
  console.error(`Missing ${path}`);
  process.exit(1);
}

const summary = JSON.parse(fs.readFileSync(path, "utf8"));
console.log(`OpenPCM sync summary`);
console.log(`Commit: ${summary.commit}`);
console.log(`Branch: ${summary.branch}`);
console.log(`Status: ${summary.status}`);
console.log(`Tests: ${summary.tests.passed} passed, ${summary.tests.failed} failed`);
console.log(`Requirements: ${summary.requirements.covered}/${summary.requirements.total}`);
if (summary.latestPackage) console.log(`Package: ${summary.latestPackage}`);
