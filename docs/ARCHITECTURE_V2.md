# OpenPCM V2 Architecture Notes

## Module direction

Current V1 core modules:

- `evidence.js`
- `validation.js`
- `portable.js`
- `detail.js`
- `profile.js`
- `discover.js`
- `calibration.js`
- `android-workflow.js`
- `browser-testing.js`

Proposed V2 additions:

- `catalogue.js`
- `preferences.js`
- `reasoning.js`
- `learning.js`

## Boundary rules

### Personal Cognitive Model

Owns durable identity/profile knowledge.

Examples:

- cognition;
- learning;
- stable preferences;
- media knowledge;
- known creators;
- health/capacity context.

### OpenPCM

Owns application evidence and local reasoning outputs.

Examples:

- saved evidence;
- local recommendation feedback;
- calibration history;
- generated recommendations;
- UI state;
- sync metadata.

## Avoid

- duplicating the Personal Cognitive Model as an independent profile;
- black-box scoring;
- recommendation explanations without source traceability;
- cognitive-state recommendations before the reasoning model is mature.

## Cognitive fit boundary

`cognitive-fit.js` is an OpenPCM reasoning output, not a durable identity mutation. It combines the current cognitive state with candidate load signals to decide whether a recommendation is suitable *right now*. It may change ranking and explanation output, but it does not rewrite the Personal Cognitive Model.
