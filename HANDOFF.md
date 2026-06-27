# OpenPCM AI Handoff

## Engineering Increment

Strengthened the core validation layer.

## Changes

- Added reusable validation helpers:
  - `ERRORS`
  - `textValue`
  - `normalizeTags`
  - `normalizeEntryInput`
- Moved title and note trimming out of `app.js` and into `src/core/validation.js`.
- Expanded validation test coverage for:
  - entry normalization
  - blank tag handling
  - non-text tag handling
  - blank title validation
  - duplicate handling while editing
- Updated core documentation to clarify validation ownership.

## Suggested Commit

test(core): strengthen validation coverage

## Risk

Low. Behaviour should remain unchanged, with validation and normalization more consistently centralized in the core layer.
