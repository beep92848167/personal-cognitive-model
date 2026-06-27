# Test Coverage

Coverage is tracked by requirement ID.

The canonical machine-readable mapping is:

```text
tests/test-manifest.json
```

Open the browser test runner:

```text
http://localhost:8080/tests/test.html
```

The test page shows:

- tests passed / failed
- requirements covered by tests
- requirements currently uncovered

## Coverage policy

A feature is not considered complete unless:

1. It has at least one requirement ID.
2. It has at least one test mapped to that requirement, or is explicitly marked manual-only.
3. The test runner passes on Android.
