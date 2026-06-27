# OpenPCM Core

Core modules contain business logic that should remain independent of the UI.

- `evidence.js` owns evidence normalization, storage helpers, sorting, filtering, duplicate lookup, and statistics.
- `validation.js` owns form/domain validation, input normalization, duplicate-title warning messages, and structured validation results.

UI code may display validation results, but validation rules and normalization rules should live here.

- `detail.js` owns pure detail-view model and HTML rendering helpers for saved evidence.
