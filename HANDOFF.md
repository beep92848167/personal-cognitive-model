# OpenPCM AI Handoff

## Engineering Increment

Made the phone sync workflow remote-first so laptop and phone development do not diverge.

## Changes

- `tools/update.sh` checks for unexpected dirty state before sync.
- `tools/update.sh` fetches and rebases onto `origin/<branch>` before applying a patch ZIP.
- ZIP discovery ignores timestamped generated sync ZIPs.
- Added `REQ-SYNC-004`.
- Expanded update workflow tests.
- Updated `docs/SYNC_WORKFLOW.md`.

## Verification

Ran:

```bash
bash -n tools/update.sh
node tools/run-tests.js
```

Expected result:

- shell syntax passes
- tests pass
- requirement coverage complete

## Suggested Commit

fix(sync): rebase before applying patches
