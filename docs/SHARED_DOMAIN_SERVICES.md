# Shared Domain Services

OpenPCM now includes a shared services layer for domain plugins.

## Files

```text
src/services/validation.js
src/services/import-export.js
src/services/search.js
src/services/storage.js
tests/shared-services-tests.js
```

## Purpose

Domains should define meaning and behaviour specific to the domain.

Shared services should provide reusable infrastructure:

- validation helpers;
- import/export list cloning and normalization;
- token-based search helpers;
- JSON storage adapters.

## Architecture

```text
UI
  ↓
Domain plugins
  ↓
Shared services
  ↓
Storage/runtime adapters
```

This prevents future domains from duplicating common behaviour.
