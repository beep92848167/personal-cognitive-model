#!/data/data/com.termux/files/usr/bin/bash
set -e

BASHRC="$HOME/.bashrc"

touch "$BASHRC"

if ! grep -q "OpenPCM shortcuts" "$BASHRC"; then
cat >> "$BASHRC" <<'EOF'

# OpenPCM shortcuts
alias u='cd ~/storage/downloads/pcm-git && bash tools/update.sh'
alias run='cd ~/storage/downloads/pcm-git && bash tools/run.sh'
alias pcm='cd ~/storage/downloads/pcm-git'
alias gs='cd ~/storage/downloads/pcm-git && git status'
EOF
fi

echo "OpenPCM shortcuts installed."
echo
echo "Restart Termux, or run:"
echo "  source ~/.bashrc"
echo
echo "Commands:"
echo "  u    = update from newest zip, commit, push, run app"
echo "  run  = run OpenPCM app"
echo "  pcm  = go to repo"
echo "  gs   = git status"
