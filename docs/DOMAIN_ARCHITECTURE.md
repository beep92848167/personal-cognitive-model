# Domain Plugin Architecture

OpenPCM now has a lightweight domain plugin foundation.

## Registry

```text
src/core/domain-registry.js
```

The registry supports:

- `register(domain)`
- `get(id)`
- `has(id)`
- `list()`
- `clear()`

## Standard domain shape

```js
{
  id,
  title,
  description,
  routes,
  storageKeys,
  validate,
  importData,
  exportData,
  requirements
}
```

## First domain

```text
src/domains/evidence/evidence-domain.js
```

Evidence is now represented as the first registered domain plugin.

This is currently a non-invasive architecture foundation. Existing UI behavior is preserved, while future increments can migrate Evidence logic and other capabilities into domain modules.
