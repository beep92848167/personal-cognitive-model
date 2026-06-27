# OpenPCM AI Handoff

## Engineering Increment

Added recommendation explanation detail view.

## Changes

- Added `src/core/recommendation-detail.js`.
- Added `tests/recommendation-detail-tests.js`.
- Discover recommendations now include a `Why this?` action.
- Added `view-recommendation-detail`.
- Detail view shows score, confidence, supporting signals, risks, sources, feedback, learning adjustment, and explanation graph summary.
- Added `REQ-RECDETAIL-001`.
- Added `docs/RECOMMENDATION_DETAIL_VIEW.md`.
- Updated CLI/browser runners and script loading.

## Verification

Ran:

```bash
node tools/run-tests.js
```

Expected result:

- 80 passed
- 0 failed
- Requirement coverage remains complete.

## Suggested Commit

feat(ui): add recommendation explanation detail view

## Risk

Medium. Adds a new UI route and detail state, but recommendation generation remains unchanged.
