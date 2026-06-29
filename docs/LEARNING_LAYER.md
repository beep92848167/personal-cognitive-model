# Learning Layer

`src/core/learning.js` derives local learning signals from recommendation feedback.

## Boundary

The learning layer does **not** mutate the Personal Cognitive Model.

It creates local OpenPCM learning signals from:

- confirmed matches;
- false positives;
- neutral feedback;
- repeated signal-level feedback;
- timestamp-aware feedback recency;
- emerging interests and stale preference signals.

## Purpose

Learning improves future recommendation scoring while keeping durable identity/profile data separate.

## Current capabilities

- Classifies feedback as positive, neutral, or negative.
- Weights feedback by strength, explicit reason text, and recency.
- Builds signal-level adjustments from accepted and rejected recommendations.
- Detects emerging interests from recent positive feedback.
- Detects stale signals where old positive evidence may need fresh confirmation.
- Applies learned adjustments to recommendation scores.
- Returns inspectable learning explanations and insight cards for future UI surfaces.
