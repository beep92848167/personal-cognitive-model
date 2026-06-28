# WORKFLOW

## Current operating model

Development now happens on Mark's Windows laptop in VS Code with direct repository access.

Git/GitHub is the primary sync mechanism. The historical ZIP handoff workflow exists only as a legacy fallback for Android-only development.

Android remains the final runtime/deployment target. Validate on Android at meaningful milestones, but optimise the day-to-day engineering loop for Windows, local tests, and normal git commits.

## Commands

### Propose next

Inspect the repository, roadmap, requirements, tests, and current git status. Propose the single highest-value next engineering increment.

### .

Approved. Implement the proposed increment, run available tests, commit, push, then report concisely for Mark's review.

Do not ask for another confirmation unless there is a genuine blocker, destructive action, credential issue, failing test that needs product judgement, or architectural decision outside the agreed roadmap.

### Continue

Continue with the next roadmap-aligned increment using the same implementation loop.

### Sync / ZIP workflow

Legacy fallback only. Use only if Mark is developing from Android without direct repository access.

## Preferred engineering loop

Propose → Implement → Test → Review diff → Commit → Push → Report

## Review cadence goal

Default to small verified increments. As trust and roadmap clarity improve, batch work so Mark can review after 10-20 successful increments rather than after every increment.
