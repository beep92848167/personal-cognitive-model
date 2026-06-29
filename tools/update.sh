#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="${REPO_DIR:-$HOME/storage/downloads/pcm-git}"
DOWNLOADS_DIR="${DOWNLOADS_DIR:-$HOME/storage/downloads}"
PORT="${PORT:-8080}"

mode="run"
commit_message=""

if [[ "${1:-}" == "-sync" ]]; then
  mode="sync"
  shift
fi

commit_message="${1:-}"

if [[ -z "$commit_message" ]]; then
  echo "Usage:"
  echo "  u \"commit message\""
  echo "  u -sync \"commit message\""
  exit 2
fi

cd "$REPO_DIR"

newest_zip() {
  # Portable Termux-friendly implementation.
  # Avoid GNU find -printf because it is not always available on Android.
  local zips=()
  shopt -s nullglob
  zips=("$DOWNLOADS_DIR"/openpcm-*.zip)
  shopt -u nullglob

  if (( ${#zips[@]} == 0 )); then
    return 1
  fi

  ls -t "${zips[@]}" | head -n 1
}

run_tests_if_available() {
  mkdir -p tests

  if [[ -f "tools/run-tests.js" ]] && command -v node >/dev/null 2>&1; then
    echo
    echo "Running tests..."
    node tools/run-tests.js > tests/last-test-run.json

    if command -v node >/dev/null 2>&1; then
      node -e '
        const fs = require("fs");
        const r = JSON.parse(fs.readFileSync("tests/last-test-run.json", "utf8"));
        if (r.failed > 0 || r.status !== "PASS") {
          console.error(`Tests failed: ${r.failed} failed`);
          process.exit(1);
        }
      '
    fi
    return 0
  fi

  echo
  echo "Running tests..."
  echo "Node test runner unavailable; preserving existing test artifact."
  return 0
}

write_sync_metadata() {
  local commit branch timestamp status passed failed covered total
  commit="$(git rev-parse --short HEAD)"
  branch="$(git rev-parse --abbrev-ref HEAD)"
  timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

  status="UNKNOWN"
  passed=""
  failed=""
  covered=""
  total=""

  if [[ -f tests/last-test-run.json ]] && command -v node >/dev/null 2>&1; then
    status="$(node -e 'const fs=require("fs"); const r=JSON.parse(fs.readFileSync("tests/last-test-run.json","utf8")); process.stdout.write(String(r.status || "UNKNOWN"));')"
    passed="$(node -e 'const fs=require("fs"); const r=JSON.parse(fs.readFileSync("tests/last-test-run.json","utf8")); process.stdout.write(String(r.passed ?? ""));')"
    failed="$(node -e 'const fs=require("fs"); const r=JSON.parse(fs.readFileSync("tests/last-test-run.json","utf8")); process.stdout.write(String(r.failed ?? ""));')"
    covered="$(node -e 'const fs=require("fs"); const r=JSON.parse(fs.readFileSync("tests/last-test-run.json","utf8")); process.stdout.write(String(r.requirements?.covered ?? ""));')"
    total="$(node -e 'const fs=require("fs"); const r=JSON.parse(fs.readFileSync("tests/last-test-run.json","utf8")); process.stdout.write(String(r.requirements?.total ?? ""));')"
  fi

  cat > .openpcm-sync.json <<EOF
{
  "workflowVersion": 5,
  "timestamp": "$timestamp",
  "branch": "$branch",
  "commit": "$commit",
  "status": "$status",
  "tests": {
    "passed": "$passed",
    "failed": "$failed"
  },
  "requirements": {
    "covered": "$covered",
    "total": "$total"
  }
}
EOF
}

create_sync_package() {
  local commit branch timestamp package_name package_path
  commit="$(git rev-parse --short HEAD)"
  branch="$(git rev-parse --abbrev-ref HEAD)"
  timestamp="$(date +%Y%m%d-%H%M%S)"
  package_name="${timestamp}-openpcm-${branch}-${commit}.zip"
  package_path="$DOWNLOADS_DIR/$package_name"

  echo
  echo "Updating sync metadata..."
  write_sync_metadata

  echo
  echo "Creating sync package..."

  rm -f "$package_path"

  zip -qr "$package_path" . \
    -x ".git/*" \
    -x "node_modules/*" \
    -x "*.zip" \
    -x "archive_*/*"

  if [[ ! -s "$package_path" ]]; then
    echo "ERROR: Sync package was not created or is empty." >&2
    return 1
  fi

  echo
  echo "✓ Sync package"
  basename "$package_path"
  du -h "$package_path" | awk '{print $1}'
  echo
  echo "Location"
  dirname "$package_path"
  echo
  echo "Next"
  echo "1. Upload ZIP to ChatGPT"
  echo "2. Type: SYNC"
}

start_server() {
  echo
  echo "Stopping any old server on port $PORT..."
  pkill -f "python.*http.server.*$PORT" >/dev/null 2>&1 || true

  echo
  echo "Starting OpenPCM..."
  echo "Open this in your browser:"
  echo "  http://localhost:$PORT"
  echo
  echo "Press Ctrl+C to stop the server."
  python -m http.server "$PORT"
}

zip_file="$(newest_zip || true)"
if [[ -z "$zip_file" ]]; then
  echo "ERROR: No openpcm-*.zip found in $DOWNLOADS_DIR" >&2
  exit 1
fi

echo "Using newest zip:"
echo "  $(basename "$zip_file")"

tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT

echo
echo "Unzipping..."
unzip -q "$zip_file" -d "$tmpdir"

echo "Applying files..."
shopt -s dotglob
for item in "$tmpdir"/*; do
  name="$(basename "$item")"
  [[ "$name" == ".git" ]] && continue
  cp -a "$item" "$REPO_DIR/"
done
shopt -u dotglob

echo
echo "Git status:"
git status --short

run_tests_if_available

echo
echo "Committing:"
echo "  $commit_message"
git add -A
if git diff --cached --quiet; then
  echo "No changes to commit."
else
  git commit -m "$commit_message"
fi

echo
echo "Pushing..."
git push

echo
echo "----------------------------------------"
echo "✓ Commit: $(git rev-parse --short HEAD)"
echo "✓ Pushed: origin/$(git rev-parse --abbrev-ref HEAD)"

if [[ -f tests/last-test-run.json ]]; then
  echo
  echo "✓ Test artifact"
  echo "tests/last-test-run.json"
  if command -v node >/dev/null 2>&1; then
    node -e 'const fs=require("fs"); const r=JSON.parse(fs.readFileSync("tests/last-test-run.json","utf8")); console.log(`Status: ${r.status} (${r.passed} passed, ${r.failed} failed)`);'
  fi
fi

if [[ "$mode" == "sync" ]]; then
  create_sync_package
  echo "----------------------------------------"
  echo
  echo "Sync mode complete. Server restart skipped."
else
  start_server
fi
