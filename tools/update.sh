#!/data/data/com.termux/files/usr/bin/bash
set -e

REPO="$HOME/storage/downloads/pcm-git"
DOWNLOADS="$HOME/storage/downloads"
TMP="$HOME/.openpcm-update"
SYNC=0

if [ "${1:-}" = "-sync" ]; then
  SYNC=1
  shift
fi

cd "$DOWNLOADS"

ZIP=$(ls -t openpcm*.zip pcm*.zip 2>/dev/null | head -n 1 || true)

if [ -z "$ZIP" ]; then
  echo "No OpenPCM zip found in Downloads."
  echo "Download a patch zip first, then run:"
  echo "  bash tools/update.sh"
  exit 1
fi

MSG="${1:-chore: apply OpenPCM update}"

echo "Using newest zip:"
echo "  $ZIP"
echo

if [ ! -d "$REPO/.git" ]; then
  echo "Repo not found at:"
  echo "  $REPO"
  exit 1
fi

rm -rf "$TMP"
mkdir -p "$TMP"

echo "Unzipping..."
unzip -oq "$DOWNLOADS/$ZIP" -d "$TMP"

echo "Applying files..."
cp -a "$TMP"/. "$REPO"/

cd "$REPO"

echo
echo "Git status:"
git status --short
echo

git add .

if git diff --cached --quiet; then
  echo "No changes to commit."
else
  echo "Committing:"
  echo "  $MSG"
  git commit -m "$MSG"
  echo
  echo "Pushing..."
  git push
fi

if [ "$SYNC" -eq 1 ]; then
  if ! command -v zip >/dev/null 2>&1; then
    echo
    echo "ERROR: zip is not installed."
    echo "Run:"
    echo "  pkg install zip"
    exit 1
  fi

  repo_name="openpcm"
  branch=$(git branch --show-current)
  sha=$(git rev-parse --short HEAD)
  ts=$(date +%Y%m%d-%H%M%S)

  # Write directly to Android Downloads. Subfolders can be hidden from some
  # Android file pickers even when Termux can see them.
  sync_dir="$DOWNLOADS"
  sync_zip="$sync_dir/${ts}-${repo_name}-${branch}-${sha}.zip"

  mkdir -p tests

  echo
  echo "Running tests..."

  if command -v node >/dev/null 2>&1; then
    if ! node tools/run-tests.js > tests/last-test-run.json; then
      echo
      echo "ERROR: tests failed."
      echo "See:"
      echo "  tests/last-test-run.json"
      exit 1
    fi
  else
    test_count=$(python - <<'PY'
import json
from pathlib import Path
try:
    data = json.loads(Path("tests/test-manifest.json").read_text())
    print(len(data.get("requirements", [])))
except Exception:
    print(0)
PY
)
    cat > tests/last-test-run.json <<EOF
{
  "workflowVersion": 4,
  "timestamp": "$(date -Iseconds)",
  "repository": "$repo_name",
  "branch": "$branch",
  "commit": "$sha",
  "status": "NOT_RUN",
  "passed": 0,
  "failed": 0,
  "total": 0,
  "testCount": $test_count,
  "runner": "tools/run-tests.js",
  "note": "Node.js is not installed in this Termux environment, so CLI tests were not run. Install with: pkg install nodejs"
}
EOF
    echo "Node.js not installed; wrote NOT_RUN test artifact."
    echo "Optional install:"
    echo "  pkg install nodejs"
  fi

  test_status=$(python - <<'PY'
import json
from pathlib import Path
data = json.loads(Path("tests/last-test-run.json").read_text())
print(data.get("status", "UNKNOWN"))
PY
)
  test_passed=$(python - <<'PY'
import json
from pathlib import Path
data = json.loads(Path("tests/last-test-run.json").read_text())
print(data.get("passed", 0))
PY
)
  test_failed=$(python - <<'PY'
import json
from pathlib import Path
data = json.loads(Path("tests/last-test-run.json").read_text())
print(data.get("failed", 0))
PY
)

  cat > .openpcm-sync.json <<EOF
{
  "workflowVersion": 4,
  "repository": "$repo_name",
  "workingDirectory": "$(basename "$(git rev-parse --show-toplevel)")",
  "branch": "$branch",
  "commit": "$sha",
  "commitMessage": "$MSG",
  "timestamp": "$(date -Iseconds)",
  "exportedBy": "tools/update.sh -sync",
  "testResults": "tests/last-test-run.json"
}
EOF

  cat > HANDOFF.md <<EOF
# OpenPCM AI Handoff

## Sync Package

- Workflow version: 4
- Branch: $branch
- Commit: $sha
- Created: $(date -Iseconds)
- Commit message: $MSG
- Test artifact: tests/last-test-run.json
- Test status: $test_status

## Next Step

Upload this ZIP to ChatGPT and type:

\`\`\`
SYNC
\`\`\`
EOF

  echo
  echo "Creating sync package..."
  zip -qr "$sync_zip" . \
    -x ".git/*" \
    -x ".DS_Store" \
    -x "__pycache__/*" \
    -x "*.pyc"

  if [ ! -s "$sync_zip" ]; then
    echo "ERROR: sync package missing or empty."
    exit 1
  fi

  sync_size=$(ls -lh "$sync_zip" | awk '{print $5}')

  # Keep the newest workflow sync packages only. Patch ZIPs such as
  # openpcm-workflow-*.zip are intentionally ignored.
  keep_count=20
  old_packages=$(ls -1t "$sync_dir"/20??????-??????-openpcm-*.zip 2>/dev/null | tail -n +$((keep_count + 1)) || true)
  if [ -n "$old_packages" ]; then
    echo "$old_packages" | xargs -r rm -f
  fi

  echo
  echo "──────────────────────────────────────"
  echo "✓ Commit: $sha"
  echo "✓ Pushed: origin/$branch"
  echo
  echo "✓ Test artifact"
  echo
  echo "tests/last-test-run.json"
  echo "Status: $test_status ($test_passed passed, $test_failed failed)"
if [ -f tests/last-test-run.json ]; then
  python - <<'PY'
import json
from pathlib import Path
d=json.loads(Path("tests/last-test-run.json").read_text())
r=d.get("requirements",{})
tot=r.get("total",0); cov=r.get("covered",0)
print(f"Coverage: {cov}/{tot} requirements")
unc=r.get("uncovered",[])
if unc:
    print("Uncovered:")
    for u in unc:
        print("  -",u.get("id","?"))
PY
fi
  echo
  echo "✓ Sync package"
  echo
  echo "$(basename "$sync_zip")"
  echo "$sync_size"
  echo
  echo "Location"
  echo
  echo "$sync_dir"
  echo
  echo "Next"
  echo
  echo "1. Upload ZIP to ChatGPT"
  echo "2. Type: SYNC"
  echo "──────────────────────────────────────"
  echo
  echo "Sync mode complete. Server restart skipped."
  exit 0
fi

echo "Stopping any old server on port 8080..."
pkill -f "python -m http.server 8080" 2>/dev/null || true

echo
echo "Starting OpenPCM..."
echo "Open this in your browser:"
echo "  http://localhost:8080"
echo
echo "Press Ctrl+C to stop the server."
echo

python -m http.server 8080
