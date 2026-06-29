# Cognitive Fit

Cognitive Fit makes recommendations sensitive to the user's current capacity without mutating the Personal Cognitive Model.

## Purpose

A high-scoring recommendation is not always the right recommendation *right now*. Dense subtitles, complex geopolitics, horror, or stressful material may be excellent at high capacity but wrong during low capacity or symptom flare states.

## States

The first implementation normalizes common app labels into four states:

- high — high capacity;
- medium — medium capacity;
- low — low capacity / evening low-load mode;
- flare — symptom flare or recovery.

## Candidate load

`src/core/cognitive-fit.js` derives candidate load from explicit `cognitiveLoad`/`cognitive_load` values or from tags, reasons, matches, risks, medium, and type.

Examples of higher-load signals:

- complex;
- geopolitics;
- subtitles;
- dense;
- brutal;
- stressful.

Examples of lower-load signals:

- comfort;
- familiar;
- kids;
- gentle;
- short.

## Outputs

The module exposes:

- normalized state profiles;
- candidate cognitive-load estimates;
- fit score and label;
- recommendation score adjustments;
- explanation text;
- insight cards such as `good_now` and `save_for_later`.

The output is designed for Discover, recommendation detail views, and future AI assistant clients.
