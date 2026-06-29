# OpenPCM AI Handoff

## Engineering Batch

Delivered Batch E: cognitive-fit recommendation ranking.

## Why

Recommendation scoring, learning, and prediction calibration now exist. The next highest-value capability is making recommendations usable *right now* by accounting for current cognitive capacity. A technically strong recommendation can still be wrong during low capacity or symptom flare states.

## Changes

- Added `src/core/cognitive-fit.js` with:
  - cognitive-state normalization;
  - capacity profiles for high, medium, low, and symptom flare / recovery;
  - candidate cognitive-load estimation from tags, reasons, matches, risks, and explicit load fields;
  - cognitive-fit scoring and labels;
  - capacity-aware recommendation score adjustments;
  - inspectable explanation text;
  - good-now and save-for-later insight cards.
- Added `tests/cognitive-fit-tests.js`.
- Loaded the new module and tests in both Node and browser test runners.
- Added `REQ-COGNITIVE-FIT-001`, `REQ-COGNITIVE-FIT-002`, and `REQ-COGNITIVE-FIT-003`.
- Added `docs/COGNITIVE_FIT.md` and updated architecture/core docs.
- Added `.openpcm-patch.json` with this patch's commit message.

## Verification

Ran:

```bash
bash -n tools/agent.sh
node tools/run-tests.js
```

Result:

```text
PASS — 148 passed, 0 failed
Requirement coverage: 57/57
```

## Suggested Commit

feat(recommendations): add cognitive fit ranking
