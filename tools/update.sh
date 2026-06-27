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

  repo=$(basename "$(git rev-parse --show-toplevel)")
  branch=$(git branch --show-current)
  sha=$(git rev-parse --short HEAD)
  ts=$(date +%Y%m%d-%H%M%S)
  sync_zip="$DOWNLOADS/${repo}-${branch}-${sha}-${ts}.zip"

  echo
  echo "Creating sync package..."
  zip -qr "$sync_zip" . \
    -x ".git/*" \
    -x ".DS_Store" \
    -x "__pycache__/*" \
    -x "*.pyc"

  if [ ! -f "$sync_zip" ]; then
    echo "ERROR: sync package was not created."
    exit 1
  fi

  echo
  echo "✓ Sync package created:"
  echo "  $sync_zip"
  echo
  echo "Next:"
  echo "  1. Upload this ZIP to ChatGPT"
  echo "  2. Type: SYNC"
fi

echo
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
