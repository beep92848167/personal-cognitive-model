# Explanation Graph

`src/core/explanation-graph.js` turns recommendation reasoning into a graph.

## Graph contents

Nodes can include:

- candidate;
- score;
- supporting signals;
- conflicting signals;
- sources;
- feedback;
- learning adjustment.

Edges describe relationships such as:

- supports;
- conflicts;
- provides;
- calibrates;
- adjusts;
- produces.

## Purpose

The graph gives OpenPCM a structured explanation format that can power future:

- "Why this?" detail views;
- debugging tools;
- visualisation;
- exportable recommendation reasoning.
