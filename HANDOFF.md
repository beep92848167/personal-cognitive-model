# OpenPCM AI Handoff

## Engineering Increment

Fixed stale `RUN_METADATA.json` by refreshing it after final package creation.

## Changes

- Bumped agent to `OpenPCM Agent 1.1.1`.
- Bumped workflow version to `12`.
- `tools/agent.sh` now refreshes `RUN_METADATA.json` after the sync ZIP exists so package size is known.
- The agent updates metadata files inside the generated sync ZIP after the final metadata refresh.
- `tools/run-metadata.js` now prints package size.
- Updated `docs/RUN_METADATA.md`.
- Added `REQ-AGENT-013`.
- Added regression test coverage.
- Added `.openpcm-patch.json` with this patch's commit message.

## Verification

Ran:

```bash
bash -n tools/agent.sh
bash tools/agent.sh --version
node tools/run-tests.js
node tools/run-metadata.js
```

## Suggested Commit

fix(agent): refresh run metadata after final package
