# OpenPCM AI Handoff

## Engineering Increment

Fully replaced `tools/update.sh` with a known-good self-safe remote-first implementation.

## Changes

- Replaced malformed update script.
- Preserved self-safe execution.
- Preserved Termux-friendly ZIP discovery.
- Added fetch/rebase before applying patches.
- Preserved test-before-commit.
- Preserved sync metadata refresh and sync ZIP creation.
- Added `REQ-SYNC-004`.

## Verification

Ran:

```bash
bash -n tools/update.sh
node tools/run-tests.js
```

Expected result:

- shell syntax passes
- tests pass

## Suggested Commit

fix(sync): replace update script with remote-first version
