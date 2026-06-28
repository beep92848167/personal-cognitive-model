# OpenPCM AI Handoff

## Engineering Increment

Fixed Termux ZIP discovery in the `u` sync workflow.

## Changes

- Updated `tools/update.sh`.
- Replaced GNU `find -printf` ZIP discovery with Termux-friendly Bash globbing.
- Preserved test-before-commit workflow.
- Preserved verified sync ZIP creation after push.
- Expanded update workflow tests.
- Updated `docs/SYNC_WORKFLOW.md`.

## Verification

Ran:

```bash
node tools/run-tests.js
```

Expected result:

- 114 passed
- 0 failed
- Requirement coverage complete.

## Suggested Commit

fix(sync): make ZIP discovery portable on Termux
