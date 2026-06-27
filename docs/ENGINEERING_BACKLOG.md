# Engineering Backlog

Priority order:
1. REQ-TEST-001 Browser tests without Node/npm
2. REQ-TEST-002 Browser pass/fail runner
3. REQ-TEST-003 Requirement coverage view
4. REQ-ANDROID-001 One-command Android update
5. REQ-ANDROID-002 Termux local workflow

Rule: choose highest-value uncovered requirement first.


## Medium Priority

### Modularize Personal Cognitive Model

Split the monolithic PCM seed into modular profile files while preserving a single runtime PCM.

Proposed structure:

```text
src/data/profile/
    identity.json
    entertainment.json
    learning.json
    development.json
    cognition.json
    preferences.json
```

A build/load step should compose these into the existing runtime profile object so the rest of OpenPCM remains unchanged.
