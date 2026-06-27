# OpenPCM Shortcuts

Adds low-RSI Termux shortcuts.

## Install

After downloading this zip:

```bash
cd ~/storage/downloads
unzip openpcm-shortcuts.zip
cp -r tools pcm-git/
cd pcm-git
bash tools/install-shortcuts.sh
source ~/.bashrc
git add tools
git commit -m "chore(android): add Termux shortcuts"
git push
```

## Future workflow

After downloading a new OpenPCM zip:

```bash
u "feat: describe update"
```

To run app only:

```bash
run
```

To go to repo:

```bash
pcm
```

To check Git status:

```bash
gs
```
