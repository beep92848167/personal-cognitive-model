# OpenPCM AI Collaboration Protocol

Status: Canonical
Version: 1.0

This document defines the working protocol between Mark and the AI engineering assistant for OpenPCM.

## Purpose

The protocol exists to reduce unnecessary confirmation loops and make AI-assisted engineering measurable, repeatable, and honest.

The key principle is:

> Do work when authorised. Report blockers honestly. Do not substitute planning for delivery.

---

## Commands

### `SYNC`

Meaning:

> The uploaded repository ZIP is the current source of truth.

When Mark sends `SYNC`, the AI assistant should:

1. Treat the uploaded ZIP as the baseline repository state.
2. Inspect the repository metadata:
   - `.openpcm-sync.json`
   - `HANDOFF.md`
   - `tests/last-test-run.json`
3. Report repository status:
   - commit
   - branch
   - workflow version
   - test result
   - requirement coverage
4. Identify the single highest-value next engineering increment.
5. End with the suggested commit command.

A `SYNC` response should not modify the repository unless Mark explicitly asks for implementation in the same message.

---

### `.`

Meaning:

> Approved. Implement the previously agreed next engineering increment now.

When Mark sends `.`, the AI assistant should:

1. Use the current uploaded repository ZIP as the working copy.
2. Modify the repository.
3. Run available verification where possible.
4. Return an updated repository ZIP.
5. Provide:
   - concise change summary
   - verification performed
   - suggested `u -sync` command
   - execution score

A `.` response should not merely restate the plan.

---

## Success and miss tracking

The assistant maintains an execution score for `.` responses.

### Success

A `.` counts as success when the assistant returns a real engineering artifact, such as:

- updated repository ZIP;
- verified patch;
- or a clear blocker caused by missing/corrupt input.

### Miss

A `.` counts as a miss when the assistant:

- restates the plan instead of doing the work;
- asks for confirmation unnecessarily;
- claims work is done without producing an artifact;
- assumes tooling is unavailable without trying;
- produces an incomplete or misleading result.

Mark is the final arbiter of whether a response counts as success or miss.

---

## ZIP handoff workflow

### Mark side

After applying an AI-produced ZIP, Mark normally runs:

```bash
cd ~/storage/downloads/pcm-git
u -sync "commit message"
```

This should:

1. Apply the newest patch ZIP.
2. Commit changes.
3. Push to GitHub.
4. Run tests where available.
5. Write `tests/last-test-run.json`.
6. Create a timestamp-first sync ZIP in Downloads.
7. Skip server restart in sync mode.

### AI side

After Mark uploads the generated sync ZIP and sends `SYNC`, the AI assistant treats that ZIP as the new baseline.

---

## Sync ZIP naming

Sync ZIPs should use timestamp-first names so Android file pickers show the newest file clearly:

```text
YYYYMMDD-HHMMSS-openpcm-<branch>-<sha>.zip
```

Example:

```text
20260627-182536-openpcm-main-5316be2.zip
```

---

## Required handoff files

Each sync ZIP should include:

```text
.openpcm-sync.json
HANDOFF.md
tests/last-test-run.json
```

### `.openpcm-sync.json`

Identifies:

- workflow version
- repository
- branch
- commit
- commit message
- timestamp
- test result path

### `HANDOFF.md`

Summarises:

- what changed
- suggested next action
- risk
- next instruction for the AI assistant

### `tests/last-test-run.json`

Records:

- test status
- passed count
- failed count
- total tests
- runner
- duration
- requirement coverage
- failures, if any

---

## Engineering expectations

The assistant should optimise for:

1. correctness
2. data integrity
3. testability
4. simplicity
5. architecture
6. features

The assistant should not claim tests passed unless it actually ran or inspected test output.

If verification was not run, say so explicitly.

---

## Current working agreement

- `SYNC` loads and evaluates repository state.
- `.` executes the approved next increment.
- Planning is acceptable during `SYNC`.
- Delivery is expected during `.`.
- The repository is the durable memory.
- Chat context is useful but not canonical.
