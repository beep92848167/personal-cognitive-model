#!/usr/bin/env node
const fs = require("fs");
const { execSync } = require("child_process");

function readJson(path, fallback) {
  try {
    return JSON.parse(fs.readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}

function git(command, fallback = "") {
  try {
    return execSync(`git ${command}`, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return fallback;
  }
}

function countBy(items, key) {
  const result = {};
  for (const item of items || []) {
    const value = item[key] || "Unknown";
    result[value] = (result[value] || 0) + 1;
  }
  return result;
}

const testRun = readJson("tests/last-test-run.json", {
  status: "UNKNOWN",
  passed: 0,
  failed: 0,
  total: 0,
  requirements: { covered: 0, total: 0, uncovered: [] },
  results: []
});

const registry = readJson("requirements/requirements.json", { requirements: [] });
const sync = readJson(".openpcm-sync.json", {});
const patch = readJson(".openpcm-patch.json", {});

const requirements = registry.requirements || [];
const implemented = requirements.filter(r => r.implemented !== false).length;
const byArea = countBy(requirements, "area");
const byPriority = countBy(requirements, "priority");
const byStatus = countBy(requirements, "status");

const branch = git("rev-parse --abbrev-ref HEAD", sync.branch || "unknown");
const commit = git("rev-parse --short HEAD", sync.commit || "unknown");
const dirty = git("status --porcelain", "");
const generatedPaths = new Set([
  "ENGINEERING_STATUS.json",
  "ENGINEERING_DASHBOARD.md",
  "SYNC_SUMMARY.json",
  "tests/last-test-run.json"
]);

const dirtyLines = dirty
  ? dirty
      .split(/\r?\n/)
      .filter(Boolean)
      .filter(line => {
        const path = line.slice(3);
        return !generatedPaths.has(path);
      })
  : [];

const status = {
  schemaVersion: "openpcm_engineering_status_v1",
  timestamp: new Date().toISOString(),
  branch,
  commit,
  repository: {
    dirty: dirtyLines.length > 0,
    dirtyFiles: dirtyLines
  },
  tests: {
    status: testRun.status || "UNKNOWN",
    passed: Number(testRun.passed || 0),
    failed: Number(testRun.failed || 0),
    total: Number(testRun.total || 0)
  },
  requirements: {
    total: requirements.length,
    implemented,
    covered: Number(testRun.requirements?.covered || 0),
    coverageTotal: Number(testRun.requirements?.total || 0),
    uncovered: testRun.requirements?.uncovered || [],
    byArea,
    byPriority,
    byStatus
  },
  sync: {
    workflowVersion: sync.workflowVersion || null,
    syncCommit: sync.commit || "",
    syncStatus: sync.status || ""
  },
  patch: {
    patchId: patch.patchId || "",
    commitMessage: patch.commitMessage || "",
    targetCommit: patch.targetCommit || "",
    targetBranch: patch.targetBranch || ""
  },
  health: {
    testsPassing: Number(testRun.failed || 0) === 0 && testRun.status === "PASS",
    requirementsCovered: (testRun.requirements?.uncovered || []).length === 0,
    syncMatchesCommit: !sync.commit || sync.commit === commit,
    cleanWorkingTree: dirtyLines.length === 0
  }
};

const healthItems = status.health;
const healthPassCount = Object.values(healthItems).filter(Boolean).length;
const healthTotal = Object.values(healthItems).length;
status.health.score = `${healthPassCount}/${healthTotal}`;

fs.writeFileSync("ENGINEERING_STATUS.json", JSON.stringify(status, null, 2) + "\n");

const lines = [];
lines.push("# OpenPCM Engineering Dashboard");
lines.push("");
lines.push(`Generated: ${status.timestamp}`);
lines.push("");
lines.push("## Repository");
lines.push("");
lines.push(`- Branch: \`${branch}\``);
lines.push(`- Commit: \`${commit}\``);
lines.push(`- Working tree: ${status.repository.dirty ? "dirty" : "clean"}`);
lines.push("");
lines.push("## Tests");
lines.push("");
lines.push(`- Status: ${status.tests.status}`);
lines.push(`- Passed: ${status.tests.passed}`);
lines.push(`- Failed: ${status.tests.failed}`);
lines.push(`- Total: ${status.tests.total}`);
lines.push("");
lines.push("## Requirements");
lines.push("");
lines.push(`- Registry total: ${status.requirements.total}`);
lines.push(`- Implemented: ${status.requirements.implemented}`);
lines.push(`- Covered by tests: ${status.requirements.covered}/${status.requirements.coverageTotal}`);
lines.push(`- Uncovered: ${status.requirements.uncovered.length}`);
lines.push("");
lines.push("### Requirements by area");
lines.push("");
for (const [area, count] of Object.entries(byArea).sort()) {
  lines.push(`- ${area}: ${count}`);
}
lines.push("");
lines.push("## Health");
lines.push("");
for (const [key, value] of Object.entries(healthItems)) {
  if (key === "score") continue;
  lines.push(`- ${value ? "✓" : "✗"} ${key}`);
}
lines.push(`- Score: ${status.health.score}`);
lines.push("");
if (status.patch.commitMessage) {
  lines.push("## Latest patch metadata");
  lines.push("");
  lines.push(`- Patch ID: ${status.patch.patchId || "unknown"}`);
  lines.push(`- Commit message: \`${status.patch.commitMessage}\``);
  lines.push("");
}

fs.writeFileSync("ENGINEERING_DASHBOARD.md", lines.join("\n") + "\n");

console.log(`Engineering dashboard written`);
console.log(`Status: ${status.tests.status}`);
console.log(`Tests: ${status.tests.passed} passed, ${status.tests.failed} failed`);
console.log(`Requirements: ${status.requirements.covered}/${status.requirements.coverageTotal}`);
console.log(`Health: ${status.health.score}`);
