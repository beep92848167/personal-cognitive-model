#!/data/data/com.termux/files/usr/bin/bash
set -e

cd "$HOME/storage/downloads/pcm-git"

pkill -f "python -m http.server 8080" 2>/dev/null || true

echo "OpenPCM running at:"
echo "  http://localhost:8080"
echo
echo "Press Ctrl+C to stop."

python -m http.server 8080
