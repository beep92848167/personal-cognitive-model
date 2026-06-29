# Recommendation Session

Batch F adds a unified recommendation-session layer.

The session layer is the first orchestration point that turns the lower-level recommendation modules into one user-facing decision object. It does not replace the scoring, learning, prediction ledger, or cognitive-fit modules. It composes them in a deterministic order:

1. Rank candidates from local evidence with First Intelligence.
2. Build a learning profile from recommendation feedback.
3. Apply learned adjustments.
4. Apply current cognitive-fit adjustments.
5. Attach decision labels and next actions.
6. Build pending prediction-ledger entries.
7. Merge insight cards into a single action queue.

## Decision labels

- `try_now`: strong score, enough confidence, and no major immediate risk.
- `consider`: plausible match that should be inspected or saved.
- `save_for_later`: good match, but current cognitive capacity is wrong.
- `skip_for_now`: weak match or insufficient confidence.

## Why this matters

Previous batches created valuable pieces of intelligence. This layer makes them usable together so future UI can render a single recommendation session instead of stitching together multiple independent modules.
