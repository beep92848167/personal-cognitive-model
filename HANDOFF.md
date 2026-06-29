# OpenPCM AI Handoff

## Engineering Increment

Added OpenPCM Agent as the primary phone-side patch automation engine.

## Changes

- Added `tools/agent.sh`.
- Added root `watch-openpcm.sh` compatibility wrapper.
- Agent watches Downloads for `openpcm-*.zip`.
- Agent extracts patches to a temporary directory before applying.
- Agent fetches/rebases before applying patches.
- Agent runs tests before commit.
- Agent commits, pushes, refreshes sync metadata, creates sync ZIP.
- Agent archives processed patch ZIPs to `archive_YYYYMMDD`.
- Added `.gitignore` entries for `agent.log` and `.openpcm-watch-seen`.
- Added `docs/OPENPCM_AGENT.md`.
- Added `REQ-AGENT-001` and `REQ-AGENT-002`.
- Added `tests/agent-tests.js`.

## Suggested Commit

feat(agent): add phone-side patch automation engine
