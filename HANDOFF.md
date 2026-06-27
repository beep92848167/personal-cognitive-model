# OpenPCM AI Handoff

## Engineering Increment

Implemented Workflow v4 for sync exports.

## Changes

- Sync ZIPs are now written directly to Downloads.
- Sync ZIP filenames remain timestamp-first:
  `YYYYMMDD-HHMMSS-openpcm-<branch>-<sha>.zip`
- `.openpcm-sync.json` now records `workflowVersion: 4`.
- `HANDOFF.md` is generated into each sync ZIP.
- Sync export now verifies the ZIP exists and is non-empty.
- Sync output prints the ZIP size.
- Retention only removes timestamped OpenPCM sync packages, avoiding patch ZIP confusion.
- Sync mode exits after export and skips server restart.

## Suggested Commit

fix(tools): write sync packages directly to downloads

## Risk

Low. Changes are isolated to `tools/update.sh` sync-mode export behaviour.
