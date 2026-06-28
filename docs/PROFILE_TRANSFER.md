# Portable PCM Import / Export

`src/core/profile-transfer.js` supports portable Personal Cognitive Model transfer.

## Export

Exports a validated JSON object containing:

- profile;
- knowledge;
- media;
- metadata;
- export schema version.

## Import

Core import supports:

- schema validation;
- merge mode;
- replace mode;
- error reporting.

The UI currently exposes export and copy-to-clipboard. Full import UI should be enabled after file-picker workflow hardening.

## Purpose

This supports the original OpenPCM goal: a user-owned, portable cognitive model that can move between devices and future applications.
