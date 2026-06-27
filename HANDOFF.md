# OpenPCM AI Handoff

## Engineering Increment

Integrated the uploaded Personal Cognitive Model as an explicit Discover data source.

## Changes

- Added `src/data/pcm-seed.js` generated from `personal-cognitive-model.zip`.
- Added `src/core/profile.js`.
- Discover now combines:
  - explicit OpenPCM evidence,
  - PCM-derived profile evidence,
  - PCM recommendation/media candidates.
- Discover UI now shows the profile source summary.
- Added `REQ-PROFILE-001`.
- Added `tests/profile-tests.js`.
- Expanded Discover tests for profile-source integration.
- Updated CLI and browser runners.
- Updated core and project documentation.

## Verification

Ran:

```bash
node tools/run-tests.js
```

Expected result in this package:

- 43 passed
- 0 failed
- Coverage includes new profile-source requirement.

## Suggested Commit

feat(profile): use personal cognitive model in discover

## Risk

Medium. This embeds a generated profile seed into the browser app and starts using it for recommendations. The logic is deterministic and covered by tests.
