# PCM Runner (Future Project)

## Goal

Build a local orchestration tool that automates the OpenPCM development workflow while keeping the user's machine in control.

## Motivation

Current workflow:

1. ChatGPT produces a verified engineering increment.
2. Local machine applies it.
3. Tests run.
4. Commit created.
5. Sync archive returned to ChatGPT.

This works well but still requires manual transport.

## Proposed Architecture

```
Git Repository
      │
      ▼
PCM Runner
      ├── Watch repository
      ├── Send project context to OpenAI API
      ├── Receive patch/instructions
      ├── Apply on temporary branch
      ├── Run full test suite
      ├── If green, commit
      ├── If red, stop and report
      ├── After N successful iterations, request human review
      └── Maintain complete engineering log
```

## Safety

- Never bypass failing tests.
- Never commit with failing requirements.
- Protect important files from unexpected edits.
- Require human approval for architectural changes.
- Keep an append-only activity log.

## Stretch Goals

- GitHub integration.
- Queue multiple engineering tasks.
- Background execution.
- Dashboard showing backlog, tests, coverage and recent commits.
- Reusable for non-OpenPCM projects.

## Priority

Backlog: Medium
Target: After OpenPCM v1 stabilizes.
