# OpenPCM AI Handoff

## Engineering Increment

Documented and tested the Android/Termux workflow.

## Changes

- Added `docs/ANDROID_WORKFLOW.md`.
- Added `src/core/android-workflow.js`.
- Added `tests/android-workflow-tests.js`.
- Updated `tools/install-shortcuts.sh` help text.
- Loaded Android workflow module in CLI/browser test runners.
- Updated core and project documentation.

## Verification

Ran:

```bash
node tools/run-tests.js
```

Expected result in this package:

- 53 passed
- 0 failed
- Android workflow requirements covered.

## Suggested Commit

feat(android): document and test Termux workflow

## Risk

Low. This is documentation plus testable workflow modelling; it does not change update execution semantics.
