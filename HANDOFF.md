# OpenPCM AI Handoff

## Engineering Increment

Added agent versioning and authoritative run metadata.

## Changes

- Added `AGENT_VERSION=1.1.0`.
- Added `WORKFLOW_VERSION=11`.
- Added `tools/agent.sh --version`.
- Added `RUN_METADATA.json` generation.
- Added `tools/run-metadata.js`.
- Added agent identity to `.openpcm-sync.json`.
- Added agent identity to `SYNC_SUMMARY.json`.
- Added agent identity support to `ENGINEERING_STATUS.json`.
- Added `docs/RUN_METADATA.md`.
- Updated `docs/OPENPCM_AGENT.md`.
- Added `REQ-AGENT-010`, `REQ-AGENT-011`, and `REQ-AGENT-012`.
- Added regression tests for version and metadata artifacts.

## Verification

Ran:

```bash
bash -n tools/agent.sh
bash tools/agent.sh --version
node tools/run-metadata.js
node tools/run-tests.js
```

## Suggested Commit

feat(agent): add run metadata and version reporting
