# Prediction Ledger

The prediction ledger closes the loop between recommendation scoring and actual user reaction.

## Purpose

First Intelligence predicts whether a candidate will fit the user. The learning layer adjusts future scores from feedback. The prediction ledger records the measurable gap between those predictions and what actually happened.

This gives OpenPCM a calibration surface:

- predicted score;
- predicted reaction;
- confidence;
- actual reaction or actual score;
- prediction error;
- mismatch reason;
- signal-level error patterns;
- pending feedback prompts.

## Design rules

- The ledger is derived runtime state, not canonical profile data.
- Ledger updates must not mutate the Personal Cognitive Model.
- Prediction error is stored as `actualScore - predictedScore`.
- Positive error means OpenPCM underrated the recommendation.
- Negative error means OpenPCM overrated the recommendation.
- Mismatch reasons should be preserved because they are often more useful than the numeric error.

## API

The core module is `src/core/prediction-ledger.js`.

Important functions:

- `normalizePrediction(recommendation, options)`
- `attachOutcome(prediction, feedback)`
- `buildPredictionLedger(recommendations, feedbackItems, options)`
- `ledgerSummary(ledger)`
- `signalPredictionErrors(ledger)`
- `predictionLedgerInsights(ledger)`
- `loadLedger(storage, key)`
- `saveLedger(ledger, storage, key)`

## Insight cards

The first ledger insight cards focus on actionability:

- pending feedback;
- calibration gaps;
- reliable predictions;
- empty ledger guidance.

Future UI can surface these on the home dashboard, recommendation detail view, or a dedicated calibration screen.
