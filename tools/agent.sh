#!/usr/bin/env bash
set -euo pipefail
DOWNLOADS_DIR="${DOWNLOADS_DIR:-$HOME/storage/downloads}"
REPO_DIR="${REPO_DIR:-$DOWNLOADS_DIR/pcm-git}"
COMMIT_MSG="${1:-chore: apply OpenPCM patch}"
POLL_SECONDS="${POLL_SECONDS:-5}"
AGENT_LOG="${AGENT_LOG:-$REPO_DIR/agent.log}"
MODE="${OPENPCM_AGENT_MODE:-watch}"
PATCH_COMMIT_MSG=""
PATCH_ID=""
PATCH_TARGET_BRANCH=""
PATCH_TARGET_COMMIT=""
PATCH_MIN_WORKFLOW=""
if [[ "${1:-}" == "--once" ]]; then MODE="once"; shift; COMMIT_MSG="${1:-chore: apply OpenPCM patch}"; elif [[ "${1:-}" == "--status" ]]; then MODE="status"; fi
log(){ local s; s="$(date '+%Y-%m-%d %H:%M:%S')"; echo "[$s] $1"; mkdir -p "$(dirname "$AGENT_LOG")"; echo "[$s] $1" >> "$AGENT_LOG"; }
newest_patch_zip(){ local zips=() filtered=() f b; shopt -s nullglob; zips=("$DOWNLOADS_DIR"/openpcm-*.zip); shopt -u nullglob; for f in "${zips[@]}"; do b="$(basename "$f")"; [[ "$b" =~ ^[0-9]{8}-[0-9]{6}-openpcm- ]] && continue; [[ "$b" == *.crdownload || "$b" == *.part ]] && continue; filtered+=("$f"); done; (( ${#filtered[@]} == 0 )) && return 1; ls -t "${filtered[@]}" | head -n 1; }
agent_status(){ echo "OpenPCM Agent status"; echo "Downloads: $DOWNLOADS_DIR"; echo "Repo:      $REPO_DIR"; echo "Log:       $AGENT_LOG"; echo; if [[ -d "$REPO_DIR/.git" ]]; then cd "$REPO_DIR"; echo "Git branch: $(git rev-parse --abbrev-ref HEAD)"; echo "Git commit: $(git rev-parse --short HEAD)"; echo "Dirty state:"; git status --short || true; else echo "Repo is missing or is not a Git repository."; fi; echo; echo "Pending patch ZIP:"; newest_patch_zip || echo "none"; }
wait_until_stable(){ local f="$1" last="-1" ticks="0" size; while true; do [[ ! -f "$f" ]] && return 1; size="$(stat -c %s "$f" 2>/dev/null || wc -c < "$f")"; if [[ "$size" == "$last" ]]; then ticks=$((ticks+1)); else ticks=0; last="$size"; fi; (( ticks >= 2 )) && return 0; sleep 1; done; }
ensure_repo_ready(){ cd "$REPO_DIR"; [[ ! -d .git ]] && { log "ERROR: $REPO_DIR is not a Git repository."; return 1; }; local dirty; dirty="$(git status --porcelain | grep -v '^ M tests/last-test-run.json$' | grep -v '^?? agent.log$' | grep -v '^?? .openpcm-watch-seen$' || true)"; if [[ -n "$dirty" ]]; then log "ERROR: Working tree has unexpected local changes before agent run:"; echo "$dirty"; log "Resolve with git status/git reset/stash before starting the agent."; return 1; fi; }
sync_remote(){ cd "$REPO_DIR"; local branch; branch="$(git rev-parse --abbrev-ref HEAD)"; log "Fetching origin..."; git fetch origin; log "Rebasing onto origin/$branch..."; git rebase "origin/$branch"; }
apply_patch_from_temp(){ local patch="$1" tmp payload item name cand; tmp="$(mktemp -d)"; log "Extracting patch to temp directory..."; unzip -q "$patch" -d "$tmp"; payload="$tmp"; for cand in "$tmp" "$tmp"/*; do if [[ -d "$cand" && ( -f "$cand/index.html" || -f "$cand/.openpcm-sync.json" ) ]]; then payload="$cand"; break; fi; done; cd "$REPO_DIR"; log "Applying patch payload..."; shopt -s dotglob; for item in "$payload"/*; do name="$(basename "$item")"; [[ "$name" == ".git" || "$name" == "node_modules" ]] && continue; cp -a "$item" "$REPO_DIR/"; done; shopt -u dotglob; rm -rf "$tmp"; }
run_tests(){ cd "$REPO_DIR"; mkdir -p tests; [[ ! -f tools/run-tests.js ]] && { log "ERROR: Missing tools/run-tests.js"; return 1; }; command -v node >/dev/null 2>&1 || { log "ERROR: node is required."; return 1; }; log "Running tests..."; node tools/run-tests.js > tests/last-test-run.json; node -e 'const fs=require("fs");const r=JSON.parse(fs.readFileSync("tests/last-test-run.json","utf8"));if(r.failed>0||r.status!=="PASS")process.exit(1);console.log(`Tests: ${r.passed} passed, ${r.failed} failed`);'; }
write_sync_metadata(){ cd "$REPO_DIR"; local c b t; c="$(git rev-parse --short HEAD)"; b="$(git rev-parse --abbrev-ref HEAD)"; t="$(date -u +%Y-%m-%dT%H:%M:%SZ)"; node - "$c" "$b" "$t" <<'NODE'
const fs=require('fs');const [commit,branch,timestamp]=process.argv.slice(2);let tests={status:'UNKNOWN',passed:'',failed:'',requirements:{covered:'',total:''}};try{tests=JSON.parse(fs.readFileSync('tests/last-test-run.json','utf8'))}catch{};const sync={workflowVersion:9,timestamp,branch,commit,status:tests.status||'UNKNOWN',tests:{passed:String(tests.passed??''),failed:String(tests.failed??'')},requirements:{covered:String(tests.requirements?.covered??''),total:String(tests.requirements?.total??'')}};fs.writeFileSync('.openpcm-sync.json',JSON.stringify(sync,null,2)+'\n');
NODE
}
write_sync_summary(){ cd "$REPO_DIR"; local c b t pkg; c="$(git rev-parse --short HEAD)"; b="$(git rev-parse --abbrev-ref HEAD)"; t="$(date -u +%Y-%m-%dT%H:%M:%SZ)"; pkg="${1:-}"; PATCH_ID="${PATCH_ID:-}" PATCH_TARGET_COMMIT="${PATCH_TARGET_COMMIT:-}" PATCH_TARGET_BRANCH="${PATCH_TARGET_BRANCH:-}" node - "$c" "$b" "$t" "$pkg" <<'NODE'
const fs=require('fs');
const [commit,branch,timestamp,latestPackage]=process.argv.slice(2);
let tests={status:'UNKNOWN',passed:0,failed:0,total:0,requirements:{covered:0,total:0,uncovered:[]}};
try{tests=JSON.parse(fs.readFileSync('tests/last-test-run.json','utf8'))}catch{}
const summary={
  schemaVersion:'openpcm_sync_summary_v1',
  timestamp,
  branch,
  commit,
  latestPackage,
  patch:{
    patchId:process.env.PATCH_ID||'',
    targetCommit:process.env.PATCH_TARGET_COMMIT||'',
    targetBranch:process.env.PATCH_TARGET_BRANCH||''
  },
  status:tests.status||'UNKNOWN',
  tests:{
    passed:Number(tests.passed??0),
    failed:Number(tests.failed??0),
    total:Number(tests.total??0)
  },
  requirements:{
    covered:Number(tests.requirements?.covered??0),
    total:Number(tests.requirements?.total??0),
    uncovered:tests.requirements?.uncovered??[]
  },
  nextInstruction:'Upload the timestamped sync ZIP to ChatGPT and type Sync.'
};
fs.writeFileSync('SYNC_SUMMARY.json',JSON.stringify(summary,null,2)+'\n');
NODE
}
commit_and_push(){ cd "$REPO_DIR"; log "Git status:"; git status --short; git add -A; if git diff --cached --quiet; then log "No changes to commit."; else log "Committing: $COMMIT_MSG"; git commit -m "$COMMIT_MSG"; fi; log "Pushing..."; git push; }
create_sync_package(){ cd "$REPO_DIR"; local c b t n p; c="$(git rev-parse --short HEAD)"; b="$(git rev-parse --abbrev-ref HEAD)"; t="$(date +%Y%m%d-%H%M%S)"; n="${t}-openpcm-${b}-${c}.zip"; p="$DOWNLOADS_DIR/$n"; log "Refreshing sync metadata..."; write_sync_metadata; log "Writing fresh sync summary..."; write_sync_summary "$n"; log "Creating sync package: $n"; rm -f "$p"; zip -qr "$p" . -x ".git/*" "node_modules/*" "*.zip" "archive_*/*" "agent.log"; [[ ! -s "$p" ]] && { log "ERROR: Sync package was not created."; return 1; }; log "Sync package ready: $p"; }
archive_patch(){ local patch="$1" dir target base stem suffix; dir="$DOWNLOADS_DIR/archive_$(date +%Y%m%d)"; mkdir -p "$dir"; base="$(basename "$patch")"; target="$dir/$base"; if [[ -e "$target" ]]; then stem="${base%.zip}"; suffix="$(date +%H%M%S)"; target="$dir/${stem}-${suffix}.zip"; fi; mv "$patch" "$target"; log "Archived patch: $target"; }
process_patch(){ local patch="$1"; log "Patch detected: $(basename "$patch")"; wait_until_stable "$patch"; ensure_repo_ready; sync_remote; apply_patch_from_temp "$patch"; run_tests; commit_and_push; create_sync_package; archive_patch "$patch"; log "Patch processing complete."; }
if [[ "$MODE" == "status" ]]; then agent_status; exit 0; fi
log "========================="; log "OpenPCM Agent"; log "========================="; log "Watching: $DOWNLOADS_DIR"; log "Repo: $REPO_DIR"; log "Commit message: $COMMIT_MSG"; log "Mode: $MODE"; log "Press Ctrl+C to stop."
while true; do patch="$(newest_patch_zip || true)"; if [[ -n "${patch:-}" ]]; then if process_patch "$patch"; then log "Waiting for next patch..."; [[ "$MODE" == "once" ]] && exit 0; else log "Patch failed and was left in Downloads: $patch"; exit 1; fi; elif [[ "$MODE" == "once" ]]; then log "No pending patch ZIP found."; exit 1; fi; sleep "$POLL_SECONDS"; done
