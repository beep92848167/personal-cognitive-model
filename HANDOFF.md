# OpenPCM AI Handoff

## Engineering Increment

Introduced the V2 recommendation learning layer.

## Changes

- Added `src/core/learning.js`.
- Added `tests/learning-tests.js`.
- Discover now derives a local learning profile from recommendation feedback.
- Discover can apply signal-level learning adjustments after calibration.
- Added `REQ-LEARNING-001`.
- Added `docs/LEARNING_LAYER.md`.
- Updated CLI/browser runners and script loading.

## Verification

Ran:

```bash
node tools/run-tests.js
```

Expected result:

- 73 passed
- 0 failed
- Requirement coverage remains complete.

## Suggested Commit

feat(learning): introduce recommendation learning layer

## Risk

Medium. Recommendation scores can now be adjusted by local learning signals, but PCM profile data is not mutated.
