# OpenPCM AI Handoff

## Engineering Increment

Made the CLI test runner optional during sync export.

## Changes

- `u -sync` no longer fails just because Node.js is missing.
- If Node.js is installed, `u -sync` runs `tools/run-tests.js`.
- If tests fail, sync export still fails.
- If Node.js is not installed, `u -sync` writes a `NOT_RUN` test artifact and continues.
- The test artifact includes an install hint: `pkg install nodejs`.
- This keeps the sync workflow usable on Termux while still recording test status honestly.

## Suggested Commit

fix(tools): make node test runner optional during sync

## Risk

Low. This only changes sync-mode tooling behaviour.
