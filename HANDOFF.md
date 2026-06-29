# OpenPCM AI Handoff

## Engineering Batch

Delivered Batch C: adaptive learning engine.

## Why

First Intelligence can score candidates from evidence. The next step is for OpenPCM to learn from recommendation feedback so future rankings improve from what actually worked or failed for the user.

## Changes

- Expanded `src/core/learning.js` from simple signal counters into an adaptive learning layer:
  - feedback recency weighting;
  - feedback strength weighting;
  - weighted signal adjustments;
  - emerging-interest detection;
  - stale-signal detection;
  - inspectable learning explanations;
  - learning insight cards for future UI surfaces.
- Preserved existing `REQ-LEARNING-001` behavior for confirmed matches, false positives, neutral feedback, and score adjustment.
- Added `REQ-LEARNING-002` for adaptive learning behavior.
- Updated Learning Layer documentation.
- Added regression tests for recency weighting, emerging/stale detection, weighted adjustments, explanations, and insight cards.
- Added `.openpcm-patch.json` with this patch's commit message.

## Verification

Ran:

```bash
bash -n tools/agent.sh
node tools/run-tests.js
```

Result:

```text
PASS — 136 passed, 0 failed
Requirement coverage: 52/52
```

## Suggested Commit

feat(learning): add adaptive feedback learning engine
