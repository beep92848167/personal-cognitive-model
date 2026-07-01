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


## Freshness guarantee

`ENGINEERING_STATUS.json` and `ENGINEERING_DASHBOARD.md` must be regenerated immediately before the sync ZIP is created.

They describe the final committed repository snapshot being uploaded, not an earlier pre-commit working state.

Generated files such as `ENGINEERING_STATUS.json`, `ENGINEERING_DASHBOARD.md`, `SYNC_SUMMARY.json`, and `tests/last-test-run.json` are ignored when calculating the dashboard's working-tree health so the dashboard does not mark itself dirty.
