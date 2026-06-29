#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const { createHarness, normalizeRequirements } = require("../tests/test-harness.js");

const repoRoot = path.resolve(__dirname, "..");
const harness = createHarness({ runner: "tools/run-tests.js" });

function makeStorage() {
  return {
    data: {},
    getItem(key) {
      return Object.prototype.hasOwnProperty.call(this.data, key) ? this.data[key] : null;
    },
    setItem(key, value) {
      this.data[key] = String(value);
    },
    removeItem(key) {
      delete this.data[key];
    }
  };
}

const sandbox = {
  console,
  Date,
  Math,
  JSON,
  Set,
  Array,
  Object,
  String,
  Number,
  Boolean,
  Error,
  crypto: {
    randomUUID: () => `test-${Math.random().toString(16).slice(2)}`
  }
};

sandbox.window = sandbox;
sandbox.global = sandbox;
sandbox.localStorage = makeStorage();
sandbox.OpenPCMTest = {
  test: harness.test,
  assert: harness.assert,
  assertEqual: harness.assertEqual,
  assertDeepEqual: harness.assertDeepEqual
};

vm.createContext(sandbox);

function runScript(relativePath) {
  const filePath = path.join(repoRoot, relativePath);
  const code = fs.readFileSync(filePath, "utf8");
  vm.runInContext(code, sandbox, { filename: relativePath });
}

function loadManifest() {
  const registryPath = path.join(repoRoot, "requirements", "requirements.json");
  const manifestPath = path.join(repoRoot, "tests", "test-manifest.json");

  try {
    const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
    return {
      source: "requirements/requirements.json",
      requirements: normalizeRequirements(registry.requirements || [])
    };
  } catch {}

  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    return {
      source: "tests/test-manifest.json",
      requirements: normalizeRequirements(manifest.requirements || [])
    };
  } catch {
    return { source: "none", requirements: [] };
  }
}

const scripts = [
  "src/data/pcm-seed.js",
  "src/core/portable.js",
  "src/core/evidence.js",
  "src/core/validation.js",
  "src/core/detail.js",
  "src/core/catalogue.js",
  "src/core/profile.js",
  "src/core/calibration.js",
  "src/core/learning.js",
  "src/core/preferences.js",
  "src/core/explanation-graph.js",
  "src/core/reasoning.js",
  "src/core/first-intelligence.js",
  "src/core/discover.js",
  "src/core/decision-history.js",
  "src/core/recommendation-timeline.js",
  "src/core/experiments.js",
  "src/core/workspace.js",
  "src/core/profile-transfer.js",
  "src/core/graph-viewer.js",
  "src/core/recommendation-detail.js",
  "src/core/android-workflow.js",
  "src/core/browser-testing.js",
  "tests/evidence-tests.js",
  "tests/validation-tests.js",
  "tests/portable-tests.js",
  "tests/detail-tests.js",
  "tests/catalogue-tests.js",
  "tests/profile-tests.js",
  "tests/profile-devprefs-tests.js",
  "tests/calibration-tests.js",
  "tests/learning-tests.js",
  "tests/preferences-tests.js",
  "tests/recommendation-timeline-tests.js",
  "tests/experiments-tests.js",
  "tests/workspace-tests.js",
  "tests/profile-transfer-tests.js",
  "tests/decision-history-tests.js",
  "tests/graph-viewer-tests.js",
  "tests/recommendation-detail-tests.js",
  "tests/explanation-graph-tests.js",
  "tests/reasoning-tests.js",
  "tests/first-intelligence-tests.js",
  "tests/discover-tests.js",
  "tests/android-workflow-tests.js",
  "tests/agent-tests.js",
  "tests/browser-testing-tests.js"
];

for (const script of scripts) {
  runScript(script);
}

harness.runAll(loadManifest()).then(report => {
  console.log(JSON.stringify(report, null, 2));
  if (report.failed) process.exit(1);
}).catch(err => {
  console.error(err.stack || err.message || String(err));
  process.exit(1);
});
