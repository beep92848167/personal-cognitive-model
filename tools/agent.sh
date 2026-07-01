#!/usr/bin/env bash
set -euo pipefail

AGENT_NAME="OpenPCM Agent"
AGENT_VERSION="1.1.1"
WORKFLOW_VERSION="12"

DOWNLOADS_DIR="${DOWNLOADS_DIR:-$HOME/storage/downloads}"
REPO_DIR="${REPO_DIR:-$DOWNLOADS_DIR/pcm-git}"
COMMIT_MSG="${1:-chore: apply OpenPCM patch}"
POLL_SECONDS="${POLL_SECONDS:-5}"
AGENT_LOG="${AGENT_LOG:-$REPO_DIR/agent.log}"
MODE="${OPENPCM_AGENT_MODE:-watch}"

RUN_ID=""
RUN_STARTED_AT=""
PATCH_COMMIT_MSG=""
PATCH_ID=""
PATCH_TARGET_BRANCH=""
PATCH_TARGET_COMMIT=""
PATCH_MIN_WORKFLOW=""
CURRENT_PATCH_FILE=""

if [[ "${1:-}" == "--once" ]]; then
  MODE="once"
  shift
  COMMIT_MSG="${1:-chore: apply OpenPCM patch}"
elif [[ "${1:-}" == "--status" ]]; then
  MODE="status"
elif [[ "${1:-}" == "--version" ]]; then
  MODE="version"
fi

log() {
  local stamp
  stamp="$(date '+%Y-%m-%d %H:%M:%S')"
  echo "[$stamp] $1"
  mkdir -p "$(dirname "$AGENT_LOG")"
  echo "[$stamp] $1" >> "$AGENT_LOG"
}

new_run_id() {
  date '+%Y%m%d-%H%M%S'
}

tool_version() {
  local tool="$1"
  if command -v "$tool" >/dev/null 2>&1; then
    "$tool" --version 2>/dev/null | head -n 1
  else
    echo ""
  fi
}

newest_patch_zip() {
  local current="$DOWNLOADS_DIR/openpcm-current.zip"
  if [[ -f "$current" ]]; then
    echo "$current"
    return 0
  fi

  local zips=()
  local filtered=()
  local file base

  shopt -s nullglob
  zips=("$DOWNLOADS_DIR"/openpcm-*.zip)
  shopt -u nullglob

  for file in "${zips[@]}"; do
    base="$(basename "$file")"
    [[ "$base" =~ ^[0-9]{8}-[0-9]{6}-openpcm- ]] && continue
    [[ "$base" == *.crdownload || "$base" == *.part ]] && continue
    filtered+=("$file")
  done

  (( ${#filtered[@]} == 0 )) && return 1
  ls -t "${filtered[@]}" | head -n 1
}

agent_version() {
  echo "$AGENT_NAME $AGENT_VERSION"
  echo "Workflow version: $WORKFLOW_VERSION"
}

agent_status() {
  agent_version
  echo
  echo "Downloads: $DOWNLOADS_DIR"
  echo "Repo:      $REPO_DIR"
  echo "Log:       $AGENT_LOG"
  echo

  if [[ -d "$REPO_DIR/.git" ]]; then
    cd "$REPO_DIR"
    echo "Git branch: $(git rev-parse --abbrev-ref HEAD)"
    echo "Git commit: $(git rev-parse --short HEAD)"
    echo "Dirty state:"
    git status --short || true
  else
    echo "Repo is missing or is not a Git repository."
  fi

  echo
  echo "Pending patch ZIP:"
  newest_patch_zip || echo "none"
}

wait_until_stable() {
  local file="$1"
  local last_size="-1"
  local stable_ticks="0"
  local size

  while true; do
    [[ ! -f "$file" ]] && return 1
    size="$(stat -c %s "$file" 2>/dev/null || wc -c < "$file")"

    if [[ "$size" == "$last_size" ]]; then
      stable_ticks="$((stable_ticks + 1))"
    else
      stable_ticks="0"
      last_size="$size"
    fi

    (( stable_ticks >= 2 )) && return 0
    sleep 1
  done
}

ensure_repo_ready() {
  cd "$REPO_DIR"
  [[ ! -d .git ]] && { log "ERROR: $REPO_DIR is not a Git repository."; return 1; }

  local dirty
  dirty="$(git status --porcelain \
    | grep -v '^ M tests/last-test-run.json$' \
    | grep -v '^ M .openpcm-sync.json$' \
    | grep -v '^ M SYNC_SUMMARY.json$' \
    | grep -v '^ M ENGINEERING_STATUS.json$' \
    | grep -v '^ M ENGINEERING_DASHBOARD.md$' \
    | grep -v '^ M RUN_METADATA.json$' \
    | grep -v '^?? agent.log$' \
    | grep -v '^?? .openpcm-watch-seen$' \
    || true)"

  if [[ -n "$dirty" ]]; then
    log "ERROR: Working tree has unexpected local changes before agent run:"
    echo "$dirty"
    log "Resolve with git status/git reset/stash before starting the agent."
    return 1
  fi
}

sync_remote() {
  cd "$REPO_DIR"
  local branch
  branch="$(git rev-parse --abbrev-ref HEAD)"
  log "Fetching origin..."
  git fetch origin
  log "Rebasing onto origin/$branch..."
  git rebase "origin/$branch"
}

read_patch_metadata() {
  local payload="$1"
  local metadata="$payload/.openpcm-patch.json"

  PATCH_COMMIT_MSG=""
  PATCH_ID=""
  PATCH_TARGET_BRANCH=""
  PATCH_TARGET_COMMIT=""
  PATCH_MIN_WORKFLOW=""

  if [[ ! -f "$metadata" ]]; then
    log "Patch metadata: none found; using default commit message."
    return 0
  fi

  if ! command -v node >/dev/null 2>&1; then
    log "Patch metadata found, but node is unavailable; using default commit message."
    return 0
  fi

  local parsed
  parsed="$(node - "$metadata" <<'NODE'
const fs = require("fs");
const file = process.argv[2];

try {
  const data = JSON.parse(fs.readFileSync(file, "utf8"));

  if (data.kind && data.kind !== "openpcm-patch") {
    console.error(`Unsupported patch kind: ${data.kind}`);
    process.exit(2);
  }

  const values = [
    data.commitMessage || "",
    data.patchId || "",
    data.targetBranch || "",
    data.targetCommit || "",
    String(data.minimumWorkflowVersion || "")
  ];

  process.stdout.write(values.map(v => String(v).replace(/\r?\n/g, " ")).join("\n"));
} catch (error) {
  console.error(`Invalid patch metadata: ${error.message}`);
  process.exit(2);
}
NODE
)" || {
    log "Patch metadata invalid; refusing to apply patch."
    return 1
  }

  PATCH_COMMIT_MSG="$(printf '%s\n' "$parsed" | sed -n '1p')"
  PATCH_ID="$(printf '%s\n' "$parsed" | sed -n '2p')"
  PATCH_TARGET_BRANCH="$(printf '%s\n' "$parsed" | sed -n '3p')"
  PATCH_TARGET_COMMIT="$(printf '%s\n' "$parsed" | sed -n '4p')"
  PATCH_MIN_WORKFLOW="$(printf '%s\n' "$parsed" | sed -n '5p')"

  log "Patch metadata:"
  [[ -n "$PATCH_ID" ]] && log "  Patch ID: $PATCH_ID"
  [[ -n "$PATCH_TARGET_BRANCH" ]] && log "  Target branch: $PATCH_TARGET_BRANCH"
  [[ -n "$PATCH_TARGET_COMMIT" ]] && log "  Target commit: $PATCH_TARGET_COMMIT"
  [[ -n "$PATCH_MIN_WORKFLOW" ]] && log "  Minimum workflow: $PATCH_MIN_WORKFLOW"
  [[ -n "$PATCH_COMMIT_MSG" ]] && log "  Commit message: $PATCH_COMMIT_MSG"

  local current_branch current_commit
  current_branch="$(git -C "$REPO_DIR" rev-parse --abbrev-ref HEAD 2>/dev/null || true)"
  current_commit="$(git -C "$REPO_DIR" rev-parse --short HEAD 2>/dev/null || true)"

  if [[ -n "$PATCH_TARGET_BRANCH" && "$PATCH_TARGET_BRANCH" != "$current_branch" ]]; then
    log "ERROR: Patch targets branch $PATCH_TARGET_BRANCH but repo is on $current_branch."
    return 1
  fi

  if [[ -n "$PATCH_TARGET_COMMIT" && "$PATCH_TARGET_COMMIT" != "$current_commit" ]]; then
    log "WARNING: Patch targets commit $PATCH_TARGET_COMMIT but repo is currently $current_commit."
    log "Agent will continue because it rebases before applying patches."
  fi

  if [[ -n "$PATCH_COMMIT_MSG" ]]; then
    COMMIT_MSG="$PATCH_COMMIT_MSG"
  fi
}

apply_patch_from_temp() {
  local patch="$1"
  local tmpdir payload item name candidate

  tmpdir="$(mktemp -d)"
  log "Extracting patch to temp directory..."
  unzip -q "$patch" -d "$tmpdir"

  payload="$tmpdir"
  for candidate in "$tmpdir" "$tmpdir"/*; do
    if [[ -d "$candidate" && ( -f "$candidate/index.html" || -f "$candidate/.openpcm-sync.json" ) ]]; then
      payload="$candidate"
      break
    fi
  done

  read_patch_metadata "$payload"

  cd "$REPO_DIR"
  log "Applying patch payload..."
  shopt -s dotglob
  for item in "$payload"/*; do
    name="$(basename "$item")"
    [[ "$name" == ".git" || "$name" == "node_modules" ]] && continue
    cp -a "$item" "$REPO_DIR/"
  done
  shopt -u dotglob

  rm -rf "$tmpdir"
}

run_tests() {
  cd "$REPO_DIR"
  mkdir -p tests

  [[ ! -f tools/run-tests.js ]] && { log "ERROR: Missing tools/run-tests.js"; return 1; }
  command -v node >/dev/null 2>&1 || { log "ERROR: node is required."; return 1; }

  log "Running tests..."
  node tools/run-tests.js > tests/last-test-run.json
  node -e '
    const fs = require("fs");
    const r = JSON.parse(fs.readFileSync("tests/last-test-run.json", "utf8"));
    if (r.failed > 0 || r.status !== "PASS") process.exit(1);
    console.log(`Tests: ${r.passed} passed, ${r.failed} failed`);
  '
}

write_sync_metadata() {
  cd "$REPO_DIR"
  local commit branch timestamp
  commit="$(git rev-parse --short HEAD)"
  branch="$(git rev-parse --abbrev-ref HEAD)"
  timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

  AGENT_NAME="$AGENT_NAME" AGENT_VERSION="$AGENT_VERSION" WORKFLOW_VERSION="$WORKFLOW_VERSION" RUN_ID="$RUN_ID" \
  node - "$commit" "$branch" "$timestamp" <<'NODE'
const fs = require("fs");
const [commit, branch, timestamp] = process.argv.slice(2);
let tests = { status: "UNKNOWN", passed: "", failed: "", requirements: { covered: "", total: "" } };
try { tests = JSON.parse(fs.readFileSync("tests/last-test-run.json", "utf8")); } catch {}
const sync = {
  workflowVersion: Number(process.env.WORKFLOW_VERSION || 0),
  timestamp,
  branch,
  commit,
  status: tests.status || "UNKNOWN",
  agent: {
    name: process.env.AGENT_NAME || "",
    version: process.env.AGENT_VERSION || "",
    workflowVersion: Number(process.env.WORKFLOW_VERSION || 0),
    runId: process.env.RUN_ID || ""
  },
  tests: {
    passed: String(tests.passed ?? ""),
    failed: String(tests.failed ?? "")
  },
  requirements: {
    covered: String(tests.requirements?.covered ?? ""),
    total: String(tests.requirements?.total ?? "")
  }
};
fs.writeFileSync(".openpcm-sync.json", JSON.stringify(sync, null, 2) + "\n");
NODE
}

write_sync_summary() {
  cd "$REPO_DIR"

  local commit branch timestamp latest_package
  commit="$(git rev-parse --short HEAD)"
  branch="$(git rev-parse --abbrev-ref HEAD)"
  timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  latest_package="${1:-}"

  AGENT_NAME="$AGENT_NAME" AGENT_VERSION="$AGENT_VERSION" WORKFLOW_VERSION="$WORKFLOW_VERSION" RUN_ID="$RUN_ID" \
  PATCH_ID="${PATCH_ID:-}" PATCH_TARGET_COMMIT="${PATCH_TARGET_COMMIT:-}" PATCH_TARGET_BRANCH="${PATCH_TARGET_BRANCH:-}" \
  node - "$commit" "$branch" "$timestamp" "$latest_package" <<'NODE'
const fs = require("fs");
const [commit, branch, timestamp, latestPackage] = process.argv.slice(2);
let tests = {
  status: "UNKNOWN",
  passed: 0,
  failed: 0,
  total: 0,
  requirements: { covered: 0, total: 0, uncovered: [] }
};
try { tests = JSON.parse(fs.readFileSync("tests/last-test-run.json", "utf8")); } catch {}
const summary = {
  schemaVersion: "openpcm_sync_summary_v1",
  timestamp,
  branch,
  commit,
  latestPackage,
  agent: {
    name: process.env.AGENT_NAME || "",
    version: process.env.AGENT_VERSION || "",
    workflowVersion: Number(process.env.WORKFLOW_VERSION || 0),
    runId: process.env.RUN_ID || ""
  },
  patch: {
    patchId: process.env.PATCH_ID || "",
    targetCommit: process.env.PATCH_TARGET_COMMIT || "",
    targetBranch: process.env.PATCH_TARGET_BRANCH || ""
  },
  status: tests.status || "UNKNOWN",
  tests: {
    passed: Number(tests.passed ?? 0),
    failed: Number(tests.failed ?? 0),
    total: Number(tests.total ?? 0)
  },
  requirements: {
    covered: Number(tests.requirements?.covered ?? 0),
    total: Number(tests.requirements?.total ?? 0),
    uncovered: tests.requirements?.uncovered ?? []
  },
  nextInstruction: "Upload the timestamped sync ZIP to ChatGPT and type Sync."
};
fs.writeFileSync("SYNC_SUMMARY.json", JSON.stringify(summary, null, 2) + "\n");
NODE
}

write_engineering_status() {
  cd "$REPO_DIR"

  if [[ -f tools/engineering-dashboard.js ]] && command -v node >/dev/null 2>&1; then
    log "Writing fresh engineering status..."
    AGENT_NAME="$AGENT_NAME" AGENT_VERSION="$AGENT_VERSION" WORKFLOW_VERSION="$WORKFLOW_VERSION" RUN_ID="$RUN_ID" \
      node tools/engineering-dashboard.js >/dev/null
  fi
}

write_run_metadata() {
  cd "$REPO_DIR"

  local commit branch generated_at package_name package_path package_size
  commit="$(git rev-parse --short HEAD)"
  branch="$(git rev-parse --abbrev-ref HEAD)"
  generated_at="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  package_name="${1:-}"
  package_path="${2:-}"
  package_size="0"

  if [[ -n "$package_path" && -f "$package_path" ]]; then
    package_size="$(stat -c %s "$package_path" 2>/dev/null || wc -c < "$package_path")"
  fi

  AGENT_NAME="$AGENT_NAME" AGENT_VERSION="$AGENT_VERSION" WORKFLOW_VERSION="$WORKFLOW_VERSION" RUN_ID="$RUN_ID" RUN_STARTED_AT="$RUN_STARTED_AT" \
  PATCH_ID="${PATCH_ID:-}" PATCH_TARGET_COMMIT="${PATCH_TARGET_COMMIT:-}" PATCH_TARGET_BRANCH="${PATCH_TARGET_BRANCH:-}" PATCH_COMMIT_MSG="${PATCH_COMMIT_MSG:-}" CURRENT_PATCH_FILE="${CURRENT_PATCH_FILE:-}" \
  PACKAGE_NAME="$package_name" PACKAGE_SIZE="$package_size" GENERATED_AT="$generated_at" \
  GIT_VERSION="$(tool_version git)" NODE_VERSION="$(tool_version node)" BASH_VERSION_TEXT="$BASH_VERSION" \
  node - "$commit" "$branch" <<'NODE'
const fs = require("fs");
const os = require("os");
const [commit, branch] = process.argv.slice(2);
let tests = { status: "UNKNOWN", passed: 0, failed: 0, total: 0, durationMs: 0, requirements: { covered: 0, total: 0, uncovered: [] } };
try { tests = JSON.parse(fs.readFileSync("tests/last-test-run.json", "utf8")); } catch {}

const metadata = {
  schemaVersion: "openpcm_run_metadata_v1",
  run: {
    id: process.env.RUN_ID || "",
    startedAt: process.env.RUN_STARTED_AT || "",
    generatedAt: process.env.GENERATED_AT || ""
  },
  agent: {
    name: process.env.AGENT_NAME || "",
    version: process.env.AGENT_VERSION || "",
    workflowVersion: Number(process.env.WORKFLOW_VERSION || 0)
  },
  repository: {
    branch,
    commit
  },
  patch: {
    patchId: process.env.PATCH_ID || "",
    commitMessage: process.env.PATCH_COMMIT_MSG || "",
    targetCommit: process.env.PATCH_TARGET_COMMIT || "",
    targetBranch: process.env.PATCH_TARGET_BRANCH || "",
    sourceFile: process.env.CURRENT_PATCH_FILE || ""
  },
  tools: {
    git: process.env.GIT_VERSION || "",
    node: process.env.NODE_VERSION || "",
    bash: process.env.BASH_VERSION_TEXT || ""
  },
  platform: {
    os: os.platform(),
    arch: os.arch(),
    release: os.release()
  },
  tests: {
    status: tests.status || "UNKNOWN",
    passed: Number(tests.passed ?? 0),
    failed: Number(tests.failed ?? 0),
    total: Number(tests.total ?? 0),
    durationMs: Number(tests.durationMs ?? 0)
  },
  requirements: {
    covered: Number(tests.requirements?.covered ?? 0),
    total: Number(tests.requirements?.total ?? 0),
    uncovered: tests.requirements?.uncovered ?? []
  },
  package: {
    zipName: process.env.PACKAGE_NAME || "",
    zipSizeBytes: Number(process.env.PACKAGE_SIZE || 0)
  },
  workflow: {
    version: Number(process.env.WORKFLOW_VERSION || 0),
    schemaVersions: {
      runMetadata: 1,
      syncSummary: 1,
      engineeringStatus: 1,
      patchManifest: 2
    }
  }
};

fs.writeFileSync("RUN_METADATA.json", JSON.stringify(metadata, null, 2) + "\n");
NODE
}

commit_and_push() {
  cd "$REPO_DIR"

  log "Git status:"
  git status --short

  git add -A

  if git diff --cached --quiet; then
    log "No changes to commit."
  else
    log "Committing: $COMMIT_MSG"
    git commit -m "$COMMIT_MSG"
  fi

  log "Pushing..."
  git push
}

create_sync_package() {
  cd "$REPO_DIR"

  local commit branch timestamp package_name package_path
  commit="$(git rev-parse --short HEAD)"
  branch="$(git rev-parse --abbrev-ref HEAD)"
  timestamp="$(date +%Y%m%d-%H%M%S)"
  package_name="${timestamp}-openpcm-${branch}-${commit}.zip"
  package_path="$DOWNLOADS_DIR/$package_name"

  log "Refreshing sync metadata..."
  write_sync_metadata

  log "Writing fresh sync summary..."
  write_sync_summary "$package_name"

  write_engineering_status

  log "Writing run metadata..."
  write_run_metadata "$package_name" ""

  log "Creating sync package: $package_name"
  rm -f "$package_path"
  zip -qr "$package_path" . -x ".git/*" "node_modules/*" "*.zip" "archive_*/*" "agent.log"

  [[ ! -s "$package_path" ]] && { log "ERROR: Sync package was not created."; return 1; }

  log "Refreshing final metadata with package size..."
  write_run_metadata "$package_name" "$package_path"

  if [[ -f tools/engineering-dashboard.js ]] && command -v node >/dev/null 2>&1; then
    AGENT_NAME="$AGENT_NAME" AGENT_VERSION="$AGENT_VERSION" WORKFLOW_VERSION="$WORKFLOW_VERSION" RUN_ID="$RUN_ID" \
      node tools/engineering-dashboard.js >/dev/null
  fi

  # Replace metadata files in the already-created sync package so the ZIP
  # contains the final post-package state, including package size.
  zip -q "$package_path" RUN_METADATA.json SYNC_SUMMARY.json ENGINEERING_STATUS.json ENGINEERING_DASHBOARD.md .openpcm-sync.json

  log "Sync package ready: $package_path"
}

archive_patch() {
  local patch="$1"
  local archive_dir target base stem suffix

  archive_dir="$DOWNLOADS_DIR/archive_$(date +%Y%m%d)"
  mkdir -p "$archive_dir"

  base="$(basename "$patch")"
  target="$archive_dir/$base"
  if [[ -e "$target" ]]; then
    stem="${base%.zip}"
    suffix="$(date +%H%M%S)"
    target="$archive_dir/${stem}-${suffix}.zip"
  fi

  mv "$patch" "$target"
  log "Archived patch: $target"
}

process_patch() {
  local patch="$1"
  RUN_ID="$(new_run_id)"
  RUN_STARTED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  CURRENT_PATCH_FILE="$(basename "$patch")"

  log "Patch detected: $(basename "$patch")"
  log "Run ID: $RUN_ID"
  wait_until_stable "$patch"
  ensure_repo_ready
  sync_remote
  apply_patch_from_temp "$patch"
  run_tests
  commit_and_push
  create_sync_package
  archive_patch "$patch"
  log "Patch processing complete."
}

if [[ "$MODE" == "version" ]]; then
  agent_version
  exit 0
fi

if [[ "$MODE" == "status" ]]; then
  agent_status
  exit 0
fi

log "========================="
log "$AGENT_NAME"
log "Version: $AGENT_VERSION"
log "Workflow: $WORKFLOW_VERSION"
log "========================="
log "Watching: $DOWNLOADS_DIR"
log "Repo: $REPO_DIR"
log "Commit message: $COMMIT_MSG"
log "Mode: $MODE"
log "Press Ctrl+C to stop."

while true; do
  patch="$(newest_patch_zip || true)"

  if [[ -n "${patch:-}" ]]; then
    if process_patch "$patch"; then
      log "Waiting for next patch..."
      [[ "$MODE" == "once" ]] && exit 0
    else
      log "Patch failed and was left in Downloads: $patch"
      exit 1
    fi
  elif [[ "$MODE" == "once" ]]; then
    log "No pending patch ZIP found."
    exit 1
  fi

  sleep "$POLL_SECONDS"
done
