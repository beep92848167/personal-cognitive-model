# OpenPCM Agent

`tools/agent.sh` is the phone-side automation engine. It watches Downloads for `openpcm-*.zip`, rebases, applies patches from a temp directory, runs tests, commits, pushes, packages sync zips, and archives processed patches.

Commands:

```bash
agent
bash tools/agent.sh --once "chore: apply OpenPCM patch"
bash tools/agent.sh --status
```

Do not manually unzip patch ZIPs into the repository.


## Sync summary

After a successful patch run, the agent writes:

```text
SYNC_SUMMARY.json
```

This file is included in the generated timestamped sync ZIP.

It contains:

- schema version;
- UTC timestamp;
- branch;
- commit;
- latest sync package name;
- test status;
- passed/failed/total test counts;
- requirement coverage;
- uncovered requirements, if any;
- next instruction for the human operator.

Inspect it with:

```bash
node tools/sync-summary.js
```


## Patch metadata

Patch ZIPs may include:

```text
.openpcm-patch.json
```

Example:

```json
{
  "schemaVersion": 2,
  "kind": "openpcm-patch",
  "patchId": "20260629-agent-metadata",
  "targetBranch": "main",
  "targetCommit": "3d4b4fb",
  "minimumWorkflowVersion": 9,
  "commitMessage": "feat(agent): read commit message from patch metadata"
}
```

When present, the agent reads this file after extracting the patch to a temporary directory.

The agent uses `commitMessage` automatically, logs the patch ID, validates the target branch, and warns if the target commit differs from the current local commit.
