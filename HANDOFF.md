# OpenPCM AI Handoff

## Engineering Increment

Unified browser and CLI test runner reporting around a shared test harness.

## Changes

- Added `tests/test-harness.js`.
- Reworked `tools/run-tests.js` to use the shared harness.
- Reworked `tests/test-runner.js` to use the shared harness.
- Browser runner now prefers `requirements/requirements.json`.
- Browser runner now shows the same requirement source and uncovered requirement metadata as the CLI runner.
- Updated `tests/test.html` to load the shared harness.
- Updated `tests/README.md`.

## Verification

Ran:

```bash
node tools/run-tests.js
```

Result:

- 34 passed
- 0 failed
- Requirement coverage remains 15/20.

## Suggested Commit

refactor(test): unify browser and CLI test runners

## Risk

Medium. Browser test display logic changed, but the CLI verification passed and test definitions are unchanged.
