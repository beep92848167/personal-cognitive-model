# OpenPCM Agent

`tools/agent.sh` is the phone-side automation engine. It watches Downloads for `openpcm-*.zip`, rebases, applies patches from a temp directory, runs tests, commits, pushes, packages sync zips, and archives processed patches.

Commands:

```bash
agent
bash tools/agent.sh --once "chore: apply OpenPCM patch"
bash tools/agent.sh --status
```

Do not manually unzip patch ZIPs into the repository.
