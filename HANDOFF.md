# OpenPCM AI Handoff

## Engineering Increment

Added a command-line test runner and wired it into sync exports.

## Changes

- Added `tools/run-tests.js`.
- `u -sync` now runs the CLI test suite before creating a sync ZIP.
- `u -sync` writes real test results to `tests/last-test-run.json`.
- Sync export fails if tests fail.
- Sync export fails if Node.js is unavailable, with an install hint for Termux.
- Browser test runner remains unchanged.

## Suggested Commit

feat(test): run automated tests during sync export

## Risk

Medium-low. The change affects tooling only, but `u -sync` now depends on Node.js.
