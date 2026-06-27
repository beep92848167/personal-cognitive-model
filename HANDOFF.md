# OpenPCM AI Handoff

## Engineering Increment

Updated the sync export workflow to improve Android file picker usability and handoff reliability.

## Changes

- Sync ZIP names now start with timestamp.
- Sync ZIPs are written to `~/storage/downloads/OpenPCM/`.
- Sync package metadata is written to `.openpcm-sync.json`.
- `HANDOFF.md` is generated into each sync ZIP.
- Sync mode keeps only the newest 20 sync ZIPs.
- Sync mode exits after export and skips server restart.

## Suggested Commit

feat(tools): improve sync package naming and handoff metadata

## Risk

Low. Changes are isolated to sync-mode workflow behaviour.
