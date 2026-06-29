# OpenPCM AI Handoff

## Engineering Batch

Delivered Daily Driver Batch A: action-oriented home capture and resume flow.

## Why

The mobile app should reduce the effort required to capture evidence from the phone home screen. The previous dashboard was informative; this batch makes it actionable.

## Changes

- Added Daily Driver domain helpers in `src/core/evidence.js`:
  - `describeRelativeTime()`
  - `lastActivity()`
  - `buildRecentTimeline()`
  - `buildNextActions()`
- Extended `buildDashboardSummary()` with:
  - `continueEntry`
  - `nextActions`
  - `recentTimeline`
- Updated Home UI:
  - action chips in the hero card
  - one-tap preset launch from Home
  - continue-last-entry affordance
  - richer recent activity timeline with relative time and cognitive mode
- Added mobile CSS for action buttons and timeline cards.
- Added `REQ-DAILY-DRIVER-001` to docs and the requirements registry.
- Added regression tests for Daily Driver next actions and timeline summary behavior.
- Added `.openpcm-patch.json` with this patch's commit message.

## Verification

Ran:

```bash
bash -n tools/agent.sh
node tools/run-tests.js
```

Result:

```text
PASS — 126 passed, 0 failed
Requirement coverage: 49/49
```

## Suggested Commit

feat(mobile): add daily driver home actions


## Latest increment: Batch B First Intelligence foundation

Suggested commit: `feat(recommendations): add first intelligence scoring engine`

Implemented:
- Added `src/core/first-intelligence.js` as a reusable recommendation scoring API.
- Added evidence weighting from reaction strength, recency, medium, tags, and explicit notes.
- Added confidence percentage / High-Medium-Low confidence labels.
- Added inspectable recommendation explanations with matched evidence and risks.
- Added ranked recommendation output for candidate catalogues.
- Added regression tests and requirements coverage for First Intelligence.

Verification target after applying patch:
- Browser test runner should report all tests passing.
- Requirement coverage should include `REQ-FIRST-INTELLIGENCE-001` and `REQ-FIRST-INTELLIGENCE-002`.
