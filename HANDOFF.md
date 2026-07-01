# OpenPCM AI Handoff

## Engineering Increment

Added Shared Domain Services for reusable domain infrastructure.

## Changes

- Added shared validation service.
- Added shared import/export service.
- Added shared search service.
- Added shared storage service.
- Updated Evidence and Tasks domains to use shared import/export helpers when available.
- Added shared service tests.
- Added `REQ-SERVICE-001` through `REQ-SERVICE-005`.
- Added `docs/SHARED_DOMAIN_SERVICES.md`.
- Added `.openpcm-patch.json` with this patch's commit message.

## Verification

Ran:

```bash
node tools/run-tests.js
node tools/engineering-dashboard.js
```

## Suggested Commit

feat(services): add shared domain services
