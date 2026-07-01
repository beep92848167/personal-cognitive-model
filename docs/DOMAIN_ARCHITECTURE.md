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


## Dynamic discovery

The registry now exposes:

```js
registry.routes()
registry.storageKeys()
```

The browser bootstrap also exposes:

```js
window.OpenPCMDomainRoutes()
window.OpenPCMDomainStorageKeys()
```

This lets application code discover registered domain capabilities without directly coupling to a specific domain.

## Evidence domain behaviour

Evidence now provides real domain-interface behaviour:

- `validate(data)`
- `importData(data)`
- `exportData(data)`

These functions preserve existing behaviour while giving future OpenPCM features a standard integration point.
