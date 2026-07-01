# OpenPCM AI Handoff

## Engineering Increment

Moved Evidence behaviour behind the standard domain interface.

## Changes

- Enhanced `src/core/domain-registry.js` with dynamic route and storage-key discovery.
- Enhanced `src/domains/evidence/evidence-domain.js` with:
  - validation
  - import
  - export
  - normalization bridge to core Evidence logic when available
- Enhanced `src/domains.js` with browser discovery helpers.
- Added tests for dynamic route discovery and Evidence domain behaviour.
- Added `REQ-DOMAIN-004` and `REQ-DOMAIN-005`.
- Updated `docs/DOMAIN_ARCHITECTURE.md`.
- Added `.openpcm-patch.json` with this patch's commit message.

## Verification

Ran:

```bash
node tools/run-tests.js
node tools/engineering-dashboard.js
```

## Suggested Commit

refactor(domain): move evidence behavior behind domain interface
