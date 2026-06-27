# Reasoning Engine

`src/core/reasoning.js` consumes:

- catalogue candidates;
- preference model signals;
- candidate source provenance.

It produces structured recommendation reasoning:

- score;
- confidence;
- uncertainty;
- supporting evidence;
- conflicting evidence;
- source list;
- explanation tree.

## Boundary

The reasoning engine does not own profile data and does not render UI.

It turns explicit model inputs into inspectable reasoning outputs.
