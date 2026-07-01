# Tasks Domain

OpenPCM now includes a second domain plugin: Tasks.

## Files

```text
src/domains/tasks/tasks-domain.js
tests/tasks-domain-tests.js
```

## Domain responsibilities

The Tasks domain owns:

- task normalization;
- task validation;
- task import/export;
- task storage keys;
- task route registration.

## Task schema

```js
{
  id,
  title,
  description,
  status,
  priority,
  tags,
  due_utc,
  created_utc,
  updated_utc,
  completed_utc
}
```

Valid statuses:

```text
open
in_progress
blocked
done
archived
```

Valid priorities:

```text
low
medium
high
critical
```

## Architecture meaning

Tasks proves the domain plugin architecture supports more than Evidence.

Future domains should follow this pattern:

```text
src/domains/<domain>/<domain>-domain.js
tests/<domain>-domain-tests.js
```
