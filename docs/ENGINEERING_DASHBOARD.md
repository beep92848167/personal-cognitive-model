# Engineering Dashboard

OpenPCM now includes a generated engineering dashboard.

## Files

```text
ENGINEERING_STATUS.json
ENGINEERING_DASHBOARD.md
```

## Generate

```bash
node tools/engineering-dashboard.js
```

## Purpose

The dashboard gives a fast project-health snapshot:

- current branch and commit;
- working-tree state;
- test status;
- requirement coverage;
- requirements grouped by area, priority, and status;
- sync metadata health;
- latest patch metadata;
- overall health score.

The JSON form is intended for AI/automation consumption.

The Markdown form is intended for quick human review.

## Agent integration

When available, the phone agent should regenerate the dashboard before creating a sync package so each uploaded sync ZIP contains current engineering status.
