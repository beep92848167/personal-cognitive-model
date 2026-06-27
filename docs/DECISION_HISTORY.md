# Decision History

`src/core/decision-history.js` records recommendation decisions over time.

Each decision can capture timestamp, candidate, score, confidence, supporting evidence, conflicting evidence, source provenance, feedback, learning adjustment, and explanation graph references.

This supports auditability and future answers to "why did this recommendation change?"
