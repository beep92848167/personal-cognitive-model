# OpenPCM AI Handoff

## Engineering Increment

Improved Discover recommendation explanations and source transparency.

## Changes

- Added structured recommendation explanations:
  - headline
  - reason signals
  - watch-outs
  - confidence
  - source labels
- Discover UI now displays explanation details instead of only raw tags.
- Added source labelling for Personal Cognitive Model recommendation/media lists.
- Added `REQ-DISCOVER-002`.
- Expanded Discover tests.

## Verification

Ran:

```bash
node tools/run-tests.js
```

Expected result in this package:

- 49 passed
- 0 failed
- New Discover explanation requirement covered.

## Suggested Commit

feat(discover): improve recommendation explanations
