# Browser Test Runner

OpenPCM includes a browser-native test runner that works without Node/npm.

Open this page while the local server is running:

```text
http://localhost:8080/tests/test.html
```

The page automatically runs tests and displays:

- pass/fail summary;
- requirement coverage;
- coverage percentage;
- requirement source;
- uncovered requirements;
- runner capabilities.

The browser runner and CLI runner share `tests/test-harness.js`, so test registration and reporting stay aligned.

## Android use

From Termux:

```bash
run
```

Then open:

```text
http://localhost:8080/tests/test.html
```

This satisfies the browser testing workflow even on Android devices where Node.js is not installed.
