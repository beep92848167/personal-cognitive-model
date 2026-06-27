# OpenPCM AI Handoff

## Engineering Increment

Updated `tools/update.sh` so sync mode exits after creating the repository ZIP.

## Changes

- `u -sync "message"` now commits, pushes, creates the sync ZIP, prints next steps, then exits.
- Server restart is skipped in sync mode.
- Normal `u "message"` behaviour is unchanged and still restarts the local server.

## Suggested Commit

fix(tools): skip server restart during sync export

## Risk

Low. This only changes control flow after a successful sync export.
