#!/usr/bin/env node
const fs = require("fs");

const path = process.argv[2] || "RUN_METADATA.json";
if (!fs.existsSync(path)) {
  console.error(`Missing ${path}`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(path, "utf8"));
console.log("OpenPCM run metadata");
console.log(`Run: ${data.run?.id || ""}`);
console.log(`Agent: ${data.agent?.name || ""} ${data.agent?.version || ""}`);
console.log(`Workflow: ${data.agent?.workflowVersion || data.workflow?.version || ""}`);
console.log(`Commit: ${data.repository?.commit || ""}`);
console.log(`Patch: ${data.patch?.patchId || ""}`);
console.log(`Tests: ${data.tests?.passed ?? ""} passed, ${data.tests?.failed ?? ""} failed`);
console.log(`Requirements: ${data.requirements?.covered ?? ""}/${data.requirements?.total ?? ""}`);
console.log(`Package: ${data.package?.zipName || ""}`);
