# Learning Layer

`src/core/learning.js` derives local learning signals from recommendation feedback.

## Boundary

The learning layer does **not** mutate the Personal Cognitive Model.

It creates local OpenPCM learning signals from:

- confirmed matches;
- false positives;
- neutral feedback;
- repeated signal-level feedback.

## Purpose

Learning improves future recommendation scoring while keeping durable identity/profile data separate.
