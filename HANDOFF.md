# OpenPCM AI Handoff

## Engineering Increment

Fixed the agent so generated sync packages include `SYNC_SUMMARY.json`.

## Changes

- `tools/agent.sh` now writes `SYNC_SUMMARY.json` before creating each sync ZIP.
- Added/updated `tools/sync-summary.js`.
- Added current `SYNC_SUMMARY.json` to the repository snapshot.
- Updated `docs/OPENPCM_AGENT.md`.
- Added `REQ-AGENT-006`.
- Expanded agent tests.
- Added `.openpcm-patch.json` with this patch's commit message.

## Verification

Ran:

```bash
bash -n tools/agent.sh
node tools/run-tests.js
node tools/sync-summary.js
```

## Suggested Commit

fix(agent): include sync summary in sync packages
