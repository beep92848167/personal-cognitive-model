# OpenPCM AI Handoff

## Engineering Increment

Added recommendation experiment framework.

## Changes

- Added `src/core/experiments.js`.
- Added `tests/experiments-tests.js`.
- Discover now runs recommendations through a deterministic experiment framework when available.
- Discover UI shows active experiment and variant.
- Added `REQ-EXPERIMENTS-001`.
- Added `docs/EXPERIMENTS.md`.
- Updated CLI/browser runners and script loading.

## Verification

Ran:

```bash
node tools/run-tests.js
```

Expected result:

- 99 passed
- 0 failed
- Requirement coverage remains complete.

## Suggested Commit

feat(reasoning): add recommendation experiment framework

## Risk

Medium. Discover ranking now includes deterministic experiment metadata and may slightly alter ordering based on selected variant.
