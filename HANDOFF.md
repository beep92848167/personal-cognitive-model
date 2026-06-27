# OpenPCM AI Handoff

## Engineering Increment

Added structured explanation graphs for recommendation reasoning.

## Changes

- Added `src/core/explanation-graph.js`.
- Added `tests/explanation-graph-tests.js`.
- Reasoning recommendations now include `explanationGraph` when the graph module is available.
- Discover UI displays explanation graph size.
- Added `REQ-EXPLANATION-GRAPH-001`.
- Added `docs/EXPLANATION_GRAPH.md`.
- Updated CLI/browser runners and script loading.

## Verification

Ran:

```bash
node tools/run-tests.js
```

Expected result:

- 77 passed
- 0 failed
- Requirement coverage remains complete.

## Suggested Commit

feat(reasoning): add explanation graph

## Risk

Medium-low. The graph is additive and deterministic; existing recommendation fields remain available.
