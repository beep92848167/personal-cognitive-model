# OpenPCM AI Handoff

## Engineering Increment

Restored patch metadata commit-message handling and preserved fresh sync summary generation.

## Root Cause

The agent had patch metadata variables but no `read_patch_metadata()` function, so it always fell back to `chore: apply OpenPCM patch`.

## Changes

- Replaced `tools/agent.sh` with a clear version containing:
  - `read_patch_metadata()`
  - automatic `COMMIT_MSG` override from `.openpcm-patch.json`
  - fresh `.openpcm-sync.json` generation
  - fresh `SYNC_SUMMARY.json` generation before packaging
- Added `tools/agent-metadata-check.js`.
- Documented commit-message precedence.
- Added `REQ-AGENT-008` and `REQ-AGENT-009`.
- Added regression tests covering metadata precedence and coexistence with sync summary generation.
- Added `.openpcm-patch.json` with this patch's commit message.

## Verification

Ran:

```bash
bash -n tools/agent.sh
node tools/agent-metadata-check.js .openpcm-patch.json
node tools/run-tests.js
```

## Suggested Commit

fix(agent): restore patch metadata commit messages
