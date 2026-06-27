# Android Workflow

OpenPCM is designed to be maintainable from Android using Termux.

## Shortcuts

After installing shortcuts, the normal commands are:

```bash
u "commit message"
```

Apply the newest OpenPCM patch ZIP from Downloads, commit, push, and run the local server.

```bash
u -sync "commit message"
```

Apply the newest OpenPCM patch ZIP from Downloads, commit, push, run available tests, create a timestamped sync ZIP in Downloads, and skip server restart.

```bash
run
```

Start the local OpenPCM server.

```bash
pcm
```

Go to the repository.

```bash
gs
```

Show Git status.

## One-command update

1. Download the ZIP supplied by the assistant.
2. Run:

```bash
cd ~/storage/downloads/pcm-git
u -sync "commit message"
```

3. Upload the generated timestamped ZIP from Downloads back to ChatGPT.
4. Type:

```text
SYNC.
```

## Local app

Start OpenPCM locally:

```bash
run
```

Open:

```text
http://localhost:8080
```

## Environment setup

Recommended Termux setup:

```bash
termux-setup-storage
pkg update
pkg install git python zip unzip nodejs
```

Node.js is optional for sync packaging, but recommended because it enables verified CLI test results.
