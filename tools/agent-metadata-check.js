#!/usr/bin/env node
const fs = require("fs");

const file = process.argv[2] || ".openpcm-patch.json";
if (!fs.existsSync(file)) {
  console.error(`Missing ${file}`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(file, "utf8"));
if (data.kind && data.kind !== "openpcm-patch") {
  console.error(`Unsupported patch kind: ${data.kind}`);
  process.exit(2);
}

if (!data.commitMessage || typeof data.commitMessage !== "string") {
  console.error("Missing commitMessage");
  process.exit(3);
}

console.log(data.commitMessage);
