# OpenPCM AI Handoff

## Engineering Increment

Added recommendation decision history.

## Changes

- Added `src/core/decision-history.js`.
- Added `tests/decision-history-tests.js`.
- Discover records recommendation decisions locally.
- Recommendation detail view shows recorded decision count for that title.
- Added `REQ-DECISION-001`.
- Added `docs/DECISION_HISTORY.md`.
- Updated CLI/browser runners and script loading.

## Verification

Ran:

```bash
node tools/run-tests.js
```

Expected result:

- 91 passed
- 0 failed
- Requirement coverage remains complete.

## Suggested Commit

feat(reasoning): add decision history

## Risk

Medium. Adds local history state when Discover renders recommendations. Core logic is deterministic and covered by tests.
