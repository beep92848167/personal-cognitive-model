# PCM Roadmap

Last updated: 2026-06-27T03:34:58.973596+00:00

## Guiding principle

Every release should reduce interaction cost for the user.

The project exists to make a portable Personal Cognitive Model usable across AI systems while minimizing RSI-triggering workflows, repetitive typing, cognitive load, and platform friction.

---

# Phase 0 — Current State

Status: Working prototype exists.

Completed:

- GitHub repository created.
- Initial PCM JSON structure created.
- Android Termux installed.
- PCM Mobile prototype runs locally on Android via browser.
- Evidence-entry form works locally.
- JSON export/import exists in prototype.
- Low-RSI need confirmed as a core product requirement.

---

# Phase 1 — Make PCM Mobile usable day-to-day

Goal: Turn the prototype into something the user can actually use regularly.

## 1.1 Improve evidence entry

Tasks:

- Add larger buttons and spacing.
- Add Save confirmation.
- Add Undo last entry.
- Add duplicate title warning.
- Add quick-entry presets:
  - TV watched
  - Book read
  - Game played
  - Recommendation feedback
  - Health/cognitive context note

Definition of done:

- User can add evidence with minimal typing and no confusion.

## 1.2 Add cognitive state selector

Tasks:

- Add today's cognitive state:
  - High
  - Medium
  - Low
  - Symptom flare
- Add time-of-day mode:
  - Morning / high capacity
  - Afternoon / recovery
  - Evening / low load
- Store this with each entry.

Definition of done:

- Recommendations can later use Current Cognitive Fit.

## 1.3 Add local dashboard

Tasks:

- Show total entries.
- Show recent entries.
- Show top tags.
- Show current mode.
- Show export reminder.

Definition of done:

- Opening the app gives a useful summary.

---

# Phase 2 — GitHub-friendly workflow

Goal: Let the user update the GitHub repo with minimal RSI burden.

## 2.1 Export PCM patch

Tasks:

- Export entries as `pcm-mobile-export.json`.
- Export changelog text.
- Export suggested commit message.

Definition of done:

- User can generate one file/package to upload to GitHub.

## 2.2 Termux helper integration

Tasks:

- Add script to move exported JSON into repo.
- Add validate command.
- Add git status helper.
- Add commit helper.

Definition of done:

- Updating repo from Android takes only a few commands.

## 2.3 Eventually: GitHub sync

Tasks:

- Research GitHub API token workflow.
- Add one-tap sync prototype.
- Keep authentication safe and optional.

Definition of done:

- App can push updates to GitHub without VS Code.

---

# Phase 3 — OpenPCM schema

Goal: Separate personal data from reusable standard.

## 3.1 Define stable modules

Modules:

- manifest
- profile/cognition
- profile/learning
- profile/health_context
- profile/daily_capacity
- media/tv
- media/movies
- media/books
- media/games
- knowledge/features
- knowledge/evidence
- knowledge/calibration

## 3.2 Stable IDs

Tasks:

- Add stable IDs to works.
- Add stable IDs to creators.
- Add stable IDs to features.
- Add cross-links.

## 3.3 Validation

Tasks:

- JSON Schema per module.
- Cross-reference checks.
- GitHub Action validation.

---

# Phase 4 — Recommendation engine

Goal: Make recommendations explainable and self-calibrating.

## 4.1 Scoring model

Every recommendation should include:

- Taste Fit
- Cognitive Fit
- Confidence
- Why it matches
- Cautions

## 4.2 Prediction ledger

Tasks:

- Store predicted rating.
- Store actual reaction.
- Store prediction error.
- Store reason for mismatch.

## 4.3 Calibration loop

Tasks:

- Increase/decrease feature confidence from evidence.
- Track failed predictions separately.
- Avoid overfitting to one outlier.

---

# Phase 5 — PCM Mobile as real app

Goal: Move beyond Termux/browser prototype.

Options:

- Progressive Web App first.
- Flutter app later.
- GitHub Releases APK eventually.

Features:

- Home dashboard.
- Add evidence.
- Recommendations.
- Reading recovery mode.
- Game recommendations.
- M/M integrated story recommendations.
- Voice note capture.
- GitHub sync.
- Export/import.

---

# Phase 6 — AI integration

Goal: Let an AI read and update the PCM safely.

Tasks:

- AI Import Protocol.
- AI Update Protocol.
- Prompt templates.
- Recommended response format.
- Safety rules for health context.
- Low-RSI interaction rules.

---

# Immediate next task

Start with Phase 1.1:

**Improve evidence entry in PCM Mobile.**

First implementation batch:

1. Add Save confirmation.
2. Add Undo last entry.
3. Add bigger touch-friendly buttons.
4. Add quick-entry mode labels.
5. Preserve existing export/import.

Suggested commit:

```text
feat: improve PCM Mobile evidence entry
```
