# Recommendation Experiments

`src/core/experiments.js` supports deterministic recommendation experiments.

Experiments allow OpenPCM to compare ranking strategies such as:

- baseline;
- confidence-weighted;
- source-rich;
- learning-forward.

Each recommendation can carry experiment metadata, and feedback can be summarized by experiment variant.

This provides a foundation for improving recommendations empirically rather than by intuition alone.
