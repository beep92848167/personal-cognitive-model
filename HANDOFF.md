# OpenPCM AI Handoff

## Engineering Increment

Added recommendation feedback calibration to Discover.

## Changes

- Added `src/core/calibration.js`.
- Added `tests/calibration-tests.js`.
- Discover can now apply recommendation feedback to adjust and re-rank scores.
- Discover UI now includes `Good fit` and `Not for me` feedback buttons.
- Feedback is stored locally in `localStorage`.
- Added `REQ-CALIBRATION-001`.
- Updated CLI and browser runners.
- Updated core documentation.

## Verification

Ran:

```bash
node tools/run-tests.js
```

Expected result in this package:

- 47 passed
- 0 failed
- New calibration requirement covered.

## Suggested Commit

feat(discover): calibrate recommendations from feedback

## Risk

Medium. Adds local state for recommendation feedback and changes Discover ranking when feedback exists.
