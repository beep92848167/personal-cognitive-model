# OpenPCM AI Handoff

## Engineering Increment

Added recommendation timelines.

## Changes

- Added `src/core/recommendation-timeline.js`.
- Added `tests/recommendation-timeline-tests.js`.
- Recommendation detail now renders a timeline from decision history.
- Added `REQ-TIMELINE-001`.
- Added `docs/RECOMMENDATION_TIMELINE.md`.
- Updated CLI/browser runners and script loading.

## Verification

Ran:

```bash
node tools/run-tests.js
```

Expected result:

- 94 passed
- 0 failed
- Requirement coverage remains complete.

## Suggested Commit

feat(ui): add recommendation timeline

## Risk

Medium-low. Timeline is derived from existing decision history and is additive.
