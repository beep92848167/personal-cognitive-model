# Run Metadata

OpenPCM Agent writes a run-level metadata file:

```text
RUN_METADATA.json
```

## Purpose

`RUN_METADATA.json` is the authoritative post-run record for AI and automation.

It records:

- agent name, version, workflow version, and run ID;
- repository branch and commit;
- patch ID, target commit, and embedded commit message;
- tool versions such as Git, Node, and Bash;
- platform information;
- test results and requirement coverage;
- generated sync package name and size;
- schema versions used by workflow artifacts.

## Inspect

```bash
node tools/run-metadata.js
```

## Relationship to other files

- `.openpcm-sync.json` is the compact sync compatibility record.
- `SYNC_SUMMARY.json` is the quick sync handoff.
- `ENGINEERING_STATUS.json` is the project health snapshot.
- `RUN_METADATA.json` is the detailed execution record.


## Freshness guarantee

`RUN_METADATA.json` must be refreshed after the sync ZIP is created so it can record the final package name and package size.

After refreshing it, the agent replaces metadata files inside the generated ZIP so the uploaded package contains the final post-package execution record.
