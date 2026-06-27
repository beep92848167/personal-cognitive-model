# OpenPCM Mobile v0.7.0 — Core Engine Refactor

## What's new

- Shared evidence Core module
- UI now calls `OpenPCMCore`
- Tests now exercise shared production logic
- Storage helpers covered by tests
- `project.json` introduced
- Release notes added

## Apply

```bash
u "refactor(core): introduce evidence core module"
```

## Verify

Open:

```text
http://localhost:8080/tests/test.html
```

Expected: all tests pass.
