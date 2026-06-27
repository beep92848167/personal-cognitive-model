#!/data/data/com.termux/files/usr/bin/bash
set -e

cd "$HOME/storage/downloads/pcm-git"

echo "Serving OpenPCM at:"
echo "http://localhost:8080"
echo
echo "Press Ctrl+C to stop."

python -m http.server 8080
