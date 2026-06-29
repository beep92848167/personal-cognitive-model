# OpenPCM Agent

`tools/agent.sh` is the phone-side automation engine.

For each new `openpcm-*.zip` patch in Downloads, it:

1. waits for the ZIP to finish downloading;
2. verifies the repo has no unexpected local edits;
3. fetches and rebases onto origin;
4. extracts the patch into a temporary directory;
5. applies the patch after the rebase;
6. runs tests;
7. commits and pushes;
8. refreshes `.openpcm-sync.json`;
9. creates a timestamped sync ZIP;
10. archives the processed patch into `archive_YYYYMMDD`.

Do not manually unzip patch ZIPs into the repository.


## Agent commands

Start watch mode:

```bash
agent
```

Run exactly one pending patch:

```bash
tools/agent.sh --once "chore: apply OpenPCM patch"
```

Show current status:

```bash
tools/agent.sh --status
```

Recommended Termux alias:

```bash
agent() {
    cd ~/storage/downloads/pcm-git
    tools/agent.sh "chore: apply OpenPCM patch"
}
```
