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

## Catalogue

| ID | Requirement | Priority | Status |
|---|---|---:|---|
| REQ-CATALOGUE-001 | Discover must ingest the full Personal Cognitive Model media catalogue with source provenance. | High | Active |

## Profile Source

| ID | Requirement | Priority | Status |
|---|---|---:|---|
| REQ-PROFILE-001 | Discover must use the Personal Cognitive Model profile as an explicit recommendation source. | High | Active |
| REQ-PROFILE-002 | Personal Cognitive Model must record the user's AI pair-programming / vibe-coding development preferences. | High | Active |

## Preferences

| ID | Requirement | Priority | Status |
|---|---|---:|---|
| REQ-PREFERENCES-001 | OpenPCM must derive an inspectable preference model from PCM profile signals and local evidence. | High | Active |

## Reasoning

| ID | Requirement | Priority | Status |
|---|---|---:|---|
| REQ-REASONING-001 | OpenPCM must produce structured reasoning for recommendations using the preference model and catalogue. | High | Active |

## Discover

| ID | Requirement | Priority | Status |
|---|---|---:|---|
| REQ-DISCOVER-001 | Discover must generate explainable recommendations from saved evidence. | High | Active |
| REQ-DISCOVER-002 | Discover recommendation explanations must show reasons, risks, confidence, and sources. | High | Active |

## Profile Transfer

| ID | Requirement | Priority | Status |
|---|---|---:|---|
| REQ-PROFILE-TRANSFER-001 | User must be able to export and import the Personal Cognitive Model as validated portable JSON with merge or replace semantics. | High | Active |

## Workspace

| ID | Requirement | Priority | Status |
|---|---|---:|---|
| REQ-WORKSPACE-001 | User must be able to save, pin, compare, status-track, and remove recommendation workspace items. | High | Active |

## Experiments

| ID | Requirement | Priority | Status |
|---|---|---:|---|
| REQ-EXPERIMENTS-001 | OpenPCM must support deterministic recommendation experiments for comparing ranking strategies and measuring feedback performance. | High | Active |

## Recommendation Timeline

| ID | Requirement | Priority | Status |
|---|---|---:|---|
| REQ-TIMELINE-001 | OpenPCM must render a recommendation timeline showing score, confidence, feedback, learning, evidence, source, and graph changes over time. | High | Active |

## Decision History

| ID | Requirement | Priority | Status |
|---|---|---:|---|
| REQ-DECISION-001 | OpenPCM must record recommendation decisions so score, confidence, evidence, graph, feedback, and learning changes can be audited over time. | High | Active |

## Graph Viewer

| ID | Requirement | Priority | Status |
|---|---|---:|---|
| REQ-GRAPHVIEWER-001 | User must be able to inspect recommendation explanation graph nodes and links interactively. | High | Active |

## Recommendation Detail

| ID | Requirement | Priority | Status |
|---|---|---:|---|
| REQ-RECDETAIL-001 | User must be able to inspect recommendation score, evidence, risks, sources, learning, and explanation graph details. | High | Active |

## Explanation Graph

| ID | Requirement | Priority | Status |
|---|---|---:|---|
| REQ-EXPLANATION-GRAPH-001 | OpenPCM must produce a structured explanation graph for recommendation reasoning. | High | Active |

## Learning

| ID | Requirement | Priority | Status |
|---|---|---:|---|
| REQ-LEARNING-001 | OpenPCM must derive learning signals from recommendation feedback without mutating the Personal Cognitive Model. | High | Active |

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

## OpenPCM Agent

| ID | Requirement | Priority | Status |
|---|---|---:|---|
| REQ-AGENT-001 | The phone agent must detect new OpenPCM patch ZIPs and process them without manual extraction. | High | Active |
| REQ-AGENT-002 | The phone agent must archive successfully processed patch ZIPs to avoid reprocessing historical downloads. | High | Active |
| REQ-AGENT-003 | The phone agent must support status and one-shot modes for safer operation. | Medium | Active |

| REQ-AGENT-004 | The phone agent must generate a machine-readable sync summary for each successful sync package. | Medium | Active |

| REQ-AGENT-005 | The phone agent must read patch metadata and use the embedded commit message when present. | High | Active |

| REQ-AGENT-006 | The phone agent must include SYNC_SUMMARY.json in generated sync packages. | High | Active |

| REQ-AGENT-007 | The phone agent must regenerate SYNC_SUMMARY.json immediately before packaging so it matches the generated sync ZIP. | High | Active |

| REQ-AGENT-008 | The phone agent must prefer the patch metadata commit message over the default fallback message. | High | Active |

| REQ-AGENT-009 | The phone agent must preserve both patch metadata reading and fresh sync summary generation in the same workflow. | High | Active |


## Engineering Dashboard

| ID | Requirement | Priority | Status |
|---|---|---:|---|
| REQ-ENG-001 | The project must generate a machine-readable engineering status report. | High | Active |
| REQ-ENG-002 | The project must generate a human-readable engineering dashboard. | Medium | Active |

| REQ-ENG-003 | The engineering dashboard must be regenerated immediately before packaging so it matches the generated sync ZIP. | High | Active |


## Domain Architecture

| ID | Requirement | Priority | Status |
|---|---|---:|---|
| REQ-DOMAIN-001 | OpenPCM must provide a registry for registering and listing domain plugins. | High | Active |
| REQ-DOMAIN-002 | The domain registry must reject duplicate domain identifiers. | High | Active |
| REQ-DOMAIN-003 | The existing Evidence capability must be represented as the first registered domain plugin. | High | Active |

| REQ-DOMAIN-004 | Applications must be able to discover domain routes dynamically through the domain registry. | High | Active |

| REQ-DOMAIN-005 | The Evidence domain must provide validation, import, and export behavior through the standard domain interface. | High | Active |

| REQ-AGENT-010 | The phone agent must expose its version and workflow version. | High | Active |

| REQ-AGENT-011 | Generated workflow artifacts must include agent identity and run metadata. | High | Active |

| REQ-AGENT-012 | The phone agent must write an authoritative RUN_METADATA.json file for each successful run. | High | Active |

| REQ-AGENT-013 | The phone agent must refresh RUN_METADATA.json after package creation and include the final version in the generated sync ZIP. | High | Active |


## Tasks Domain

| ID | Requirement | Priority | Status |
|---|---|---:|---|
| REQ-TASKS-001 | The Tasks domain must normalize task records with default status and priority. | High | Active |
| REQ-TASKS-002 | The Tasks domain must validate malformed task records and invalid status or priority values. | High | Active |
| REQ-TASKS-003 | The Tasks domain must provide import and export through the standard domain interface. | High | Active |
| REQ-TASKS-004 | The Tasks domain must register routes and storage keys through the domain plugin registry. | High | Active |


## Shared Domain Services

| ID | Requirement | Priority | Status |
|---|---|---:|---|
| REQ-SERVICE-001 | OpenPCM must provide shared validation helpers for domain plugins. | High | Active |
| REQ-SERVICE-002 | OpenPCM must provide shared import/export helpers for domain plugins. | High | Active |
| REQ-SERVICE-003 | OpenPCM must provide shared search helpers for token-based domain search. | Medium | Active |
| REQ-SERVICE-004 | OpenPCM must provide shared JSON storage helpers for domain persistence. | Medium | Active |
| REQ-SERVICE-005 | Domain plugins must be able to use shared services without changing their public interface. | High | Active |


## Knowledge Domain

| ID | Requirement | Priority | Status |
|---|---|---:|---|
| REQ-KNOWLEDGE-001 | The Knowledge domain must normalize knowledge records with default kind and status. | High | Active |
| REQ-KNOWLEDGE-002 | The Knowledge domain must validate malformed records, invalid kind or status values, and invalid links or source IDs. | High | Active |
| REQ-KNOWLEDGE-003 | The Knowledge domain must provide import and export through the standard domain interface. | High | Active |
| REQ-KNOWLEDGE-004 | The Knowledge domain must register routes and storage keys through the domain plugin registry. | High | Active |
| REQ-KNOWLEDGE-005 | The Knowledge domain must support token-based search through the shared search service. | Medium | Active |
