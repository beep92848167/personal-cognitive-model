# Knowledge Domain

OpenPCM now includes a Knowledge domain plugin.

## Files

```text
src/domains/knowledge/knowledge-domain.js
tests/knowledge-domain-tests.js
```

## Domain responsibilities

The Knowledge domain owns:

- knowledge item normalization;
- knowledge validation;
- knowledge import/export;
- knowledge storage keys;
- knowledge route registration;
- token-based search through the shared search service.

## Knowledge schema

```js
{
  id,
  title,
  summary,
  body,
  kind,
  status,
  tags,
  links,
  source_ids,
  created_utc,
  updated_utc
}
```

Valid kinds:

```text
concept
note
reference
question
model
```

Valid statuses:

```text
draft
active
review
archived
```

## Architecture meaning

Knowledge is the third independent domain after Evidence and Tasks.

This proves the domain architecture can support richer structured information domains, not only capture lists or tasks.
