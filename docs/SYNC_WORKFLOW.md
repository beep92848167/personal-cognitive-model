# Sync Workflow Reliability

`tools/update.sh` is responsible for the Android/Termux `u` workflow.

## Required behaviour

For normal run mode:

```bash
u "commit message"
```

The script applies the newest `openpcm-*.zip`, commits, pushes, runs tests if available, and starts the local server.

For sync mode:

```bash
u -sync "commit message"
```

The script must:

1. apply the newest `openpcm-*.zip`;
2. commit;
3. push;
4. run tests if available;
5. create a timestamped sync ZIP in Downloads;
6. verify the ZIP exists and is non-empty;
7. print the ZIP name and location;
8. skip server restart.

## Why this matters

If push succeeds but no sync ZIP is created, ChatGPT cannot verify the newly pushed repository state through the normal ZIP workflow. The script now treats missing or empty sync packages as an explicit error.
