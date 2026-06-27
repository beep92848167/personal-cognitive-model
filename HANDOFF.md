# OpenPCM AI Handoff

## Engineering Increment

Extracted entry validation into a dedicated core module.

## Changes

- Added `src/core/validation.js`.
- Updated `app.js` to use `OpenPCMValidation` for save validation and duplicate-title warnings.
- Added `tests/validation-tests.js`.
- Updated `tests/test.html` to load validation tests.
- Updated `src/core/README.md` with core module responsibilities.

## Suggested Commit

refactor(core): extract validation module

## Risk

Low. Existing duplicate-warning behaviour is preserved; title validation remains blocking as before.
