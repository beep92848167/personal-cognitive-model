# OpenPCM Requirements

## Evidence

| ID | Requirement | Priority | Status |
|---|---|---:|---|
| REQ-EVIDENCE-001 | Evidence item must have stable ID, title, type, reaction, tags, note, and timestamps. | High | Active |
| REQ-EVIDENCE-002 | Evidence normalization must support legacy fields such as `type`, `reasons`, and `notes`. | High | Active |
| REQ-EVIDENCE-003 | Evidence must persist locally between page refreshes. | High | Active |
| REQ-EVIDENCE-004 | User must be warned when adding a duplicate title. | Medium | Active |
| REQ-EVIDENCE-005 | User must be able to edit an existing evidence item. | High | Active |
| REQ-EVIDENCE-006 | User must be able to delete an evidence item. | High | Active |

## Library

| ID | Requirement | Priority | Status |
|---|---|---:|---|
| REQ-LIBRARY-001 | Library must list saved evidence newest-first. | High | Active |
| REQ-LIBRARY-002 | Library must filter evidence by type. | High | Active |
| REQ-LIBRARY-003 | Library must search title, note, and tags. | High | Active |
| REQ-LIBRARY-004 | Tapping evidence must open a detail view. | High | Active |

## Statistics

| ID | Requirement | Priority | Status |
|---|---|---:|---|
| REQ-STATS-001 | Statistics must count total evidence items. | Medium | Active |
| REQ-STATS-002 | Statistics must count evidence by type and reaction. | Medium | Active |
| REQ-STATS-003 | Statistics must count unique tags. | Medium | Active |

## Import / Export

| ID | Requirement | Priority | Status |
|---|---|---:|---|
| REQ-PORTABLE-001 | User must be able to export evidence as JSON. | High | Active |
| REQ-PORTABLE-002 | User must be able to import evidence from JSON. | High | Active |

## Profile Source

| ID | Requirement | Priority | Status |
|---|---|---:|---|
| REQ-PROFILE-001 | Discover must use the Personal Cognitive Model profile as an explicit recommendation source. | High | Active |

## Discover

| ID | Requirement | Priority | Status |
|---|---|---:|---|
| REQ-DISCOVER-001 | Discover must generate explainable recommendations from saved evidence. | High | Active |

## Calibration

| ID | Requirement | Priority | Status |
|---|---|---:|---|
| REQ-CALIBRATION-001 | User feedback on recommendations must calibrate future Discover scoring. | High | Active |

## Android Workflow

| ID | Requirement | Priority | Status |
|---|---|---:|---|
| REQ-ANDROID-001 | Android update workflow must be one-command after downloading a ZIP. | High | Active |
| REQ-ANDROID-002 | App must run locally in Android browser through Termux. | High | Active |

## Testing

| ID | Requirement | Priority | Status |
|---|---|---:|---|
| REQ-TEST-001 | Tests must run in Android browser without Node/npm. | High | Active |
| REQ-TEST-002 | Test runner must show pass/fail status. | High | Active |
| REQ-TEST-003 | Test runner must show requirement coverage. | High | Active |
