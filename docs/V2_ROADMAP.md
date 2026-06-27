# OpenPCM V2 Roadmap

Status: Active planning

## V2 objective

Turn OpenPCM from an evidence tracker with explainable recommendations into an explainable personal reasoning engine.

## Architectural principle

> OpenPCM never owns your identity. It reasons over it.

The Personal Cognitive Model remains the source of truth for long-lived personal profile data.

OpenPCM owns:

- captured evidence;
- recommendation results;
- calibration feedback;
- local observations;
- reasoning outputs.

## V2 reasoning pipeline

```text
Personal Cognitive Model
          +
OpenPCM Evidence
          +
Media Catalogue
          ↓
Preference Model
          ↓
Reasoning Engine
          ↓
Explainable Recommendations
          ↓
Calibration
          ↓
Learning
```

## Milestone 1 — Full catalogue ingestion

Goal: Discover should use the full Personal Cognitive Model media catalogue rather than partial candidate lists.

Target sources:

- `media/television.json`
- `media/movies.json`
- `media/novels.json`
- `media/games.json`
- `media/documentaries.json`
- `media/comedy.json`
- `media/integrated_m2m.json`

Expected outcome:

- recommendation candidates come from the full PCM catalogue;
- duplicate/already-known items are suppressed;
- source labels remain transparent.

## Milestone 2 — Preference Model

Goal: extract preference inference into `src/core/preferences.js`.

Responsibilities:

- merge PCM profile signals with OpenPCM evidence;
- separate long-term preferences from short-term evidence;
- expose a stable, inspectable preference model.

## Milestone 3 — Reasoning Engine

Goal: introduce `src/core/reasoning.js`.

Responsibilities:

- compare candidates against preference model;
- calculate confidence;
- identify conflicts and risks;
- produce structured explanation objects.

## Milestone 4 — Learning

Goal: improve recommendation calibration beyond simple score adjustment.

Potential signals:

- false positives;
- false negatives;
- emerging interests;
- fading interests;
- repeated rejection patterns.

Learning should not mutate the Personal Cognitive Model directly.

## Milestone 5 — Cognitive state recommendations

Goal: add cognitive-capacity-aware recommendations last.

Modes:

- high capacity;
- medium capacity;
- low capacity;
- symptom flare / recovery.

This is intentionally deferred until the catalogue, preference, reasoning, and learning layers are stronger.
