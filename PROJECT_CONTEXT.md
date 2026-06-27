# PROJECT_CONTEXT

Version: 1.0

## Mission
Build OpenPCM as a maintainable, evidence-driven cognitive modelling platform.

## Principles
- Repository is the source of truth.
- Small incremental changes.
- Review by exception.
- UI contains no business logic.
- Domain logic lives in src/core.
- Requirements are traceable.
- Tests evolve with features.
- Record technical debt.

## Workflow
- Semantic commits
- ADRs
- Quality dashboard
- Definition of Done
- Engineering documentation kept current.


## AI Collaboration Protocol

See `docs/AI_COLLABORATION_PROTOCOL.md` for the canonical `SYNC` and `.` workflow.


## Requirement Registry

Machine-readable requirements live in `requirements/requirements.json` and are used by `tools/run-tests.js` for coverage reporting.


## Personal Cognitive Model Source

The browser app includes `src/data/pcm-seed.js`, generated from the latest Personal Cognitive Model ZIP provided by Mark. `src/core/profile.js` adapts that profile into recommendation evidence and candidates for Discover.


## Android Workflow

The canonical Termux/Android workflow is documented in `docs/ANDROID_WORKFLOW.md` and represented in `src/core/android-workflow.js`.
