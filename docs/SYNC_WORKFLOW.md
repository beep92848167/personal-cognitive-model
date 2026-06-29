# Sync Workflow Reliability

`tools/update.sh` powers the Android/Termux `u` workflow.

## Normal mode

```bash
u "commit message"
```

The script:

1. applies the newest `openpcm-*.zip`;
2. runs tests if Node is available;
3. commits only if tests pass;
4. pushes;
5. starts the local server.

## Sync mode

```bash
u -sync "commit message"
```

The script:

1. applies the newest `openpcm-*.zip`;
2. runs tests if Node is available;
3. commits only if tests pass;
4. pushes;
5. creates a timestamped sync ZIP in Downloads;
6. verifies the ZIP exists and is non-empty;
7. prints the ZIP name and location;
8. skips server restart.

## Design rule

Never push untested code when the test runner is available.

Never report sync success unless a non-empty sync ZIP was created.


## Termux portability

ZIP discovery uses Bash globbing plus `ls -t` rather than GNU-specific `find -printf`.

This matters because Android/Termux environments can differ in which `find` implementation is available.


## Sync metadata

Before creating a sync ZIP, `tools/update.sh` rewrites `.openpcm-sync.json` with:

- current branch;
- current short commit;
- UTC timestamp;
- test status;
- passed/failed test counts;
- requirement coverage.

This prevents stale sync ZIP metadata after successful commits.
