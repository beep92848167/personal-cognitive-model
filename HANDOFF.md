# OpenPCM AI Handoff

## Engineering Increment

Hardened the OpenPCM Agent with status and one-shot modes.

## Changes

- `tools/agent.sh --status` reports repo, branch, commit, dirty state, and pending patch ZIP.
- `tools/agent.sh --once` processes one pending patch then exits.
- Agent now tolerates `.openpcm-watch-seen` as harmless untracked state.
- Agent docs now include command examples and the Termux `agent` alias.
- Added `REQ-AGENT-003`.
- Expanded agent tests.

## Verification

Ran:

```bash
bash -n tools/agent.sh
node tools/run-tests.js
```

Expected result:

- shell syntax passes
- tests pass
- requirement coverage complete

## Suggested Commit

feat(agent): add status and one-shot modes
