# OpenPCM AI Handoff

## Engineering Increment

Agent now reads `.openpcm-patch.json` and automatically uses its embedded commit message.

## Changes

- `tools/agent.sh` reads patch metadata from extracted patch payload.
- Agent validates patch kind and target branch.
- Agent logs patch ID, target commit, target branch, workflow version, and commit message.
- Agent uses `commitMessage` automatically when present.
- Added patch metadata documentation.
- Added `REQ-AGENT-005`.
- Expanded agent tests.
- Added `.openpcm-patch.json` manifest for this patch.

## Verification

Ran:

```bash
bash -n tools/agent.sh
node tools/run-tests.js
```

## Suggested Commit

feat(agent): read commit message from patch metadata
