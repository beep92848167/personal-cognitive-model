# Personal Cognitive Model (PCM)

A portable, AI-agnostic profile format for carrying a user's preferences, cognitive context, learning style, media taste, and recommendation calibration between AI systems.

## What this is

The PCM is designed to help any AI understand:

- how the user thinks and learns
- what kinds of media they enjoy and why
- how cognitive capacity changes through the day
- what recommendations have succeeded or failed
- how to update the profile without losing evidence

## Core principle

Recommend and explain by **underlying features**, not labels.

For this user, the strongest drivers are:

- exceptional writing
- people navigating complex systems
- civilizational and institutional storytelling
- competence under pressure
- meaningful consequences
- consistency
- strong dialogue
- stewardship and building complex systems

## Repository structure

```text
profile/       user-specific cognitive, learning, health, and daily capacity modules
media/         TV, movies, books, documentaries, games, comedy, M/M stories
knowledge/     features, creators, evidence, counterfactuals, calibration, recommendations
schemas/       JSON schemas
docs/          documentation and scoring guidance
tools/         validation helpers
examples/      example PCM fragments
```

## How an AI should use this

1. Read `manifest.json`.
2. Read `profile/` for user context.
3. Read `knowledge/features.json` and `knowledge/evidence.json`.
4. Read relevant `media/` modules.
5. Make recommendations using both:
   - **Taste Fit**
   - **Current Cognitive Fit**
6. Record feedback in `knowledge/calibration.json`.
7. Never delete evidence unless correcting a factual error.

Generated: 2026-06-26T11:07:07.283475+00:00
