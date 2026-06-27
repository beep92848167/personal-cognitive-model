# OpenPCM AI Handoff

## Engineering Increment

Added the first deterministic Discover recommendation engine.

## Changes

- Added `src/core/discover.js`.
- Added `tests/discover-tests.js`.
- Added `REQ-DISCOVER-001` to `docs/REQUIREMENTS.md`.
- Added `REQ-DISCOVER-001` to `requirements/requirements.json`.
- Wired the Discover page to show explainable recommendations from saved evidence.
- Updated CLI and browser test runners.
- Updated `src/core/README.md`.

## Verification

Ran:

```bash
node tools/run-tests.js
```

Expected result in this package:

- 39 passed
- 0 failed
- Requirement coverage remains high with new Discover requirement covered.

## Suggested Commit

feat(discover): add explainable recommendation engine

## Risk

Medium. This introduces user-visible Discover behaviour, but the recommendation engine is deterministic and covered by unit tests.
