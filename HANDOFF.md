# OpenPCM AI Handoff

## Engineering Increment

Introduced the V2 preference model.

## Changes

- Added `src/core/preferences.js`.
- Added `tests/preferences-tests.js`.
- Discover summary now includes `preferenceModel`.
- Discover top preference tags now come from the preference model when available.
- Added `REQ-PREFERENCES-001`.
- Added `docs/PREFERENCE_MODEL.md`.
- Updated CLI/browser runners and script loading.

## Verification

Ran:

```bash
node tools/run-tests.js
```

Expected result:

- 65 passed
- 0 failed
- Requirement coverage remains complete.

## Suggested Commit

feat(preferences): introduce preference model

## Risk

Medium-low. Discover still uses the existing scoring profile, but now exposes and uses a dedicated preference model for top signals.
