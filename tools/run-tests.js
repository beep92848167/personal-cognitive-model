#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const repoRoot = path.resolve(__dirname, "..");
const started = Date.now();

const results = [];
const covered = new Set();

function assert(condition, message = "Assertion failed") {
  if (!condition) throw new Error(message);
}

function assertEqual(actual, expected, message = "Values are not equal") {
  if (actual !== expected) {
    throw new Error(`${message}. Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertDeepEqual(actual, expected, message = "Objects are not equal") {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`${message}. Expected ${e}, got ${a}`);
  }
}

function test(name, requirements, fn) {
  if (typeof requirements === "function") {
    fn = requirements;
    requirements = [];
  }

  try {
    fn();
    for (const req of requirements || []) covered.add(req);
    results.push({ name, status: "PASS", requirements: requirements || [] });
  } catch (err) {
    results.push({
      name,
      status: "FAIL",
      requirements: requirements || [],
      message: err.message || String(err),
      stack: err.stack || ""
    });
  }
}

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
sandbox.OpenPCMTest = { test, assert, assertEqual, assertDeepEqual };

vm.createContext(sandbox);

function runScript(relativePath) {
  const filePath = path.join(repoRoot, relativePath);
  const code = fs.readFileSync(filePath, "utf8");
  vm.runInContext(code, sandbox, { filename: relativePath });
}

function loadManifest() {
  const manifestPath = path.join(repoRoot, "tests", "test-manifest.json");
  try {
    return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch {
    return { requirements: [] };
  }
}

const scripts = [
  "src/core/evidence.js",
  "src/core/validation.js",
  "tests/evidence-tests.js",
  "tests/validation-tests.js"
];

for (const script of scripts) {
  runScript(script);
}

const manifest = loadManifest();
const requirements = manifest.requirements || [];
const uncovered = requirements.filter(req => !covered.has(req.id));
const failed = results.filter(result => result.status === "FAIL");
const passed = results.length - failed.length;

const report = {
  workflowVersion: 4,
  timestamp: new Date().toISOString(),
  status: failed.length ? "FAIL" : "PASS",
  passed,
  failed: failed.length,
  total: results.length,
  durationMs: Date.now() - started,
  runner: "tools/run-tests.js",
  requirements: {
    total: requirements.length,
    covered: covered.size,
    uncovered: uncovered.map(req => ({ id: req.id, title: req.title || "" }))
  },
  failures: failed.map(result => ({
    test: result.name,
    message: result.message,
    stack: result.stack
  })),
  results
};

console.log(JSON.stringify(report, null, 2));

if (failed.length) {
  process.exit(1);
}
