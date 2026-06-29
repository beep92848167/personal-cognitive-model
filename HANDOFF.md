# OpenPCM AI Handoff

## Engineering Increment

Added the Phase 1.3 local home dashboard summary.

## Why

The roadmap calls for the app home screen to provide a useful day-to-day summary immediately on launch, reducing navigation and RSI cost.

## Changes

- Added dashboard summary support in `src/core/evidence.js`:
  - `topTagCounts()`
  - `mostRecentCognitiveState()`
  - `exportReminder()`
  - `buildDashboardSummary()`
- Added a Home `Today` dashboard card showing:
  - Total entries
  - Current cognitive mode
  - Top tags
  - Export reminder
- Reused the dashboard summary for recent activity so the Home view is driven by one core summary object.
- Added `REQ-DASHBOARD-001` to docs and the requirements registry.
- Added regression tests for top tag counts and dashboard summary behavior.
- Added `.openpcm-patch.json` with this patch's commit message.

## Verification

Ran:

```bash
bash -n tools/agent.sh
node tools/run-tests.js
```

Result:

```text
PASS — 124 passed, 0 failed
Requirement coverage: 48/48
```

## Suggested Commit

feat(mobile): add home dashboard summary
