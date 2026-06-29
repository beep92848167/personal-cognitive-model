# OpenPCM Core

Core modules contain business logic that should remain independent of the UI.

- `evidence.js` owns evidence normalization, storage helpers, sorting, filtering, duplicate lookup, and statistics.
- `validation.js` owns form/domain validation, input normalization, duplicate-title warning messages, and structured validation results.

UI code may display validation results, but validation rules and normalization rules should live here.

- `detail.js` owns pure detail-view model and HTML rendering helpers for saved evidence.

- `discover.js` owns deterministic, explainable recommendation scoring from saved evidence.

- `profile.js` adapts the Personal Cognitive Model profile into evidence and recommendation candidates.

- `calibration.js` owns recommendation feedback storage and score adjustment for Discover calibration.

- `android-workflow.js` documents and validates the Android/Termux workflow model used by the app and handoff process.

- `browser-testing.js` models browser test runner capabilities, summaries, and coverage percentages.

- `catalogue.js` ingests the full Personal Cognitive Model media catalogue with source provenance.

- `preferences.js` derives an inspectable preference model from PCM profile signals and local OpenPCM evidence.

- `reasoning.js` produces structured recommendation reasoning from catalogue candidates and the preference model.

- `learning.js` derives local recommendation learning signals from feedback without mutating the Personal Cognitive Model.

- `explanation-graph.js` converts recommendation reasoning into structured graph nodes and edges.

- `recommendation-detail.js` renders inspectable recommendation explanation detail models and HTML.

- `profile.js` also exposes `developmentPreferencesSummary()` for AI pair-programming / vibe-coding workflow preferences in the PCM seed.

- `graph-viewer.js` renders interactive explanation graph nodes, links, and selected node details.

- `decision-history.js` records recommendation decisions for auditability and score-change analysis over time.

- `recommendation-timeline.js` turns decision history into inspectable recommendation timelines.

- `experiments.js` supports deterministic recommendation experiments and feedback performance summaries.

- `workspace.js` manages saved recommendation workspace items, statuses, pins, and comparison sorting.

- `profile-transfer.js` exports, validates, parses, and imports portable Personal Cognitive Model JSON.


## First intelligence

`first-intelligence.js` provides the first reusable recommendation-scoring API. It turns local evidence into weighted preference signals, scores candidate items, assigns confidence, and returns inspectable explanations with matches and risks.

- `prediction-ledger.js` records predicted recommendation outcomes, actual feedback, prediction errors, calibration summaries, and insight cards.
