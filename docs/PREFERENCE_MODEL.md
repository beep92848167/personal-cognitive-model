# Preference Model

`src/core/preferences.js` derives an inspectable preference model from:

- Personal Cognitive Model profile signals;
- OpenPCM local evidence;
- recent local reactions.

## Purpose

The preference model separates preference inference from recommendation ranking.

This keeps Discover focused on recommendations while the preference module owns:

- long-term positive signals;
- long-term negative signals;
- recent evidence signals;
- conflict detection;
- stable top preference tags.

## Boundary

OpenPCM does not own identity/profile data. It derives a local preference model from explicit sources.
