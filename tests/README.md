# OpenPCM Tests

Open:

```text
http://localhost:8080/tests/test.html
```

## What this tests

- Evidence normalization
- Save/load behavior
- Duplicate title detection logic
- Filtering
- Search matching
- Statistics helpers

## Design goal

Tests must run on Android without requiring Node, npm, Playwright, Jest, or a desktop computer.


## CLI test runner

Run the automated core test suite from the command line:

```bash
node tools/run-tests.js
```

`u -sync` runs this command automatically and writes the result to:

```text
tests/last-test-run.json
```

If any test fails, sync package creation stops.
