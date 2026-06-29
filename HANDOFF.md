# OpenPCM AI Handoff

## Engineering Increment

Added low-RSI quick-entry presets for evidence capture.

## Why

Phase 1.1 of the roadmap calls for quick-entry presets so common capture flows require fewer taps and less typing.

## Changes

- Added core quick-entry preset support in `src/core/evidence.js`:
  - `QUICK_ENTRY_PRESETS`
  - `presetList()`
  - `getQuickEntryPreset()`
  - `applyQuickEntryPreset()`
- Added Add Evidence UI preset buttons for:
  - TV watched
  - Book read
  - Game played
  - Recommendation feedback
  - Health/cognitive context note
- Presets fill medium, reaction, cognitive state where relevant, starter note text, and tags while preserving existing selected tags.
- Added `REQ-EVIDENCE-007` to docs and registry.
- Added regression tests covering preset availability and draft application.
- Added `.openpcm-patch.json` with this patch's commit message.

## Verification

Ran:

```bash
bash -n tools/agent.sh
node tools/run-tests.js
```

Result:

```text
PASS — 122 passed, 0 failed
Requirement coverage: 47/47
```

## Suggested Commit

feat(evidence): add quick entry presets
