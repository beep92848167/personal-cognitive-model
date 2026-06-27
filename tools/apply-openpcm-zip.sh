#!/data/data/com.termux/files/usr/bin/bash
set -e

REPO="$HOME/storage/downloads/pcm-git"

if [ -z "$1" ]; then
  echo "Usage:"
  echo "  bash tools/apply-openpcm-zip.sh ZIP_FILE [commit message]"
  echo
  echo "Example:"
  echo "  bash tools/apply-openpcm-zip.sh ~/storage/downloads/openpcm-mobile-v0.2-app-shell.zip \"feat(ui): introduce OpenPCM app shell\""
  exit 1
fi

ZIP="$1"
MSG="${2:-chore: apply OpenPCM update}"

if [ ! -f "$ZIP" ]; then
  echo "Zip not found: $ZIP"
  exit 1
fi

if [ ! -d "$REPO/.git" ]; then
  echo "Repo not found at $REPO"
  exit 1
fi

TMP="$HOME/.openpcm-update"
rm -rf "$TMP"
mkdir -p "$TMP"

echo "Unzipping update..."
unzip -oq "$ZIP" -d "$TMP"

echo "Applying files to repo..."
cp -r "$TMP"/* "$REPO"/

cd "$REPO"

echo "Git status:"
git status --short

echo
echo "Committing:"
echo "$MSG"
echo

git add .
git commit -m "$MSG" || echo "Nothing to commit."

echo
echo "Pushing..."
git push

echo
echo "Done."
