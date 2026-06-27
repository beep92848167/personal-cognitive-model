# OpenPCM AI Handoff

## Engineering Increment

Added the machine-readable requirement registry and connected the CLI test runner to it.

## Changes

- Added `requirements/requirements.json` generated from `docs/REQUIREMENTS.md`.
- Registry records requirement ID, title, area, priority, status, implementation flag, and test links.
- Updated `tools/run-tests.js` to prefer `requirements/requirements.json` for requirement coverage.
- Coverage output now records the requirement source and preserves area/priority/status metadata for uncovered requirements.
- Updated `PROJECT_CONTEXT.md` with the registry location.

## Verification

Ran:

```bash
node tools/run-tests.js
```

Result:

- 28 passed
- 0 failed
- Requirement source: `requirements/requirements.json`

## Suggested Commit

feat(requirements): compute coverage from registry

## Risk

Low. Test reporting now uses the registry when present, with fallback to `tests/test-manifest.json`.
