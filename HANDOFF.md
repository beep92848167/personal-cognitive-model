# OpenPCM AI Handoff

## Engineering Increment

Added an interactive explanation graph viewer.

## Changes

- Added `src/core/graph-viewer.js`.
- Added `tests/graph-viewer-tests.js`.
- Recommendation detail view now embeds graph nodes, links, and selected node details.
- Added interactive node selection binding in `app.js`.
- Added `REQ-GRAPHVIEWER-001`.
- Added `docs/GRAPH_VIEWER.md`.
- Updated CLI/browser runners and script loading.
- Added the modular PCM task to the engineering backlog if the backlog file is present.

## Verification

Ran:

```bash
node tools/run-tests.js
```

Expected result:

- 86 passed
- 0 failed
- Requirement coverage remains complete.

## Suggested Commit

feat(ui): add interactive explanation graph viewer
