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


## Sync test artifact

`u -sync` writes `tests/last-test-run.json`.

Node.js is optional for sync:
- If Node.js is installed, `u -sync` runs `node tools/run-tests.js`.
- If Node.js is missing, sync continues and records `status: "NOT_RUN"`.
- If Node.js is installed and tests fail, sync stops.

Install Node.js in Termux when you want verified CLI test results:

```bash
pkg install nodejs
```


Next planned suite: `portable-detail-tests.js` covering export/import/detail view.
