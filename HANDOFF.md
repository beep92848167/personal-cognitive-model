# OpenPCM AI Handoff

## Engineering Increment

Introduced the V2 reasoning engine.

## Changes

- Added `src/core/reasoning.js`.
- Added `tests/reasoning-tests.js`.
- Discover now uses the reasoning engine when a preference model is available.
- Added `REQ-REASONING-001`.
- Added `docs/REASONING_ENGINE.md`.
- Updated CLI/browser runners and script loading.

## Verification

Ran:

```bash
node tools/run-tests.js
```

Expected result:

- 69 passed
- 0 failed
- Requirement coverage remains complete.

## Suggested Commit

feat(reasoning): introduce reasoning engine

## Risk

Medium. Discover recommendations now pass through the reasoning engine when available, but outputs remain deterministic and covered by tests.
