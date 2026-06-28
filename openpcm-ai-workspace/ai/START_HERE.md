Before making any changes:

1. Read `openpcm-ai-workspace/ai/AI_OPERATING_CHARTER.md`.
2. Read `openpcm-ai-workspace/ai/CONTEXT.md`.
3. Read `openpcm-ai-workspace/ai/ARCHITECTURE.md`.
4. Read `openpcm-ai-workspace/ai/WORKFLOW.md`.
5. Read `openpcm-ai-workspace/ai/ROADMAP.md`.
6. Read `PROJECT_CONTEXT.md`.
7. Check `git status --short`.
8. Then inspect the repository areas relevant to the current task.

Do not begin implementation until you understand the architecture and engineering philosophy.

Current operating model:

- Development happens on Mark's Windows laptop in VS Code.
- Git/GitHub is the primary sync mechanism.
- Android remains the runtime/deployment target, but not the primary development environment.
- The old ZIP workflow exists only as a legacy fallback for Android-only development.
- `.` means Mark approves the proposed increment: implement it, run tests, commit, push, then report concisely for review.
