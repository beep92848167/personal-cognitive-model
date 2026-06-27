(function (global) {
  const DEFAULTS = {
    repo: "~/storage/downloads/pcm-git",
    port: 8080,
    updateCommand: "u",
    syncCommand: "u -sync",
    runCommand: "run"
  };

  function workflowSteps(mode = "sync", options = {}) {
    const config = { ...DEFAULTS, ...options };
    const sync = mode === "sync";
    return [
      {
        id: "download",
        label: "Download ZIP",
        detail: "Save the assistant-produced OpenPCM ZIP to Android Downloads."
      },
      {
        id: "apply",
        label: sync ? "Apply, test, commit, push, and sync" : "Apply, commit, push, and run",
        detail: sync
          ? `${config.syncCommand} "commit message"`
          : `${config.updateCommand} "commit message"`
      },
      {
        id: sync ? "upload-sync" : "open-app",
        label: sync ? "Upload generated sync ZIP" : "Open local app",
        detail: sync
          ? "Upload the timestamped OpenPCM ZIP from Downloads back to ChatGPT."
          : `http://localhost:${config.port}`
      }
    ];
  }

  function commandHelp(options = {}) {
    const config = { ...DEFAULTS, ...options };
    return {
      update: `${config.updateCommand} "commit message"`,
      sync: `${config.syncCommand} "commit message"`,
      run: config.runCommand,
      repo: "pcm",
      status: "gs"
    };
  }

  function environmentChecks(env = {}) {
    return [
      { name: "Termux storage", ok: !!env.storage, fix: "Run: termux-setup-storage" },
      { name: "Git repository", ok: !!env.gitRepo, fix: "Clone or restore repo at ~/storage/downloads/pcm-git" },
      { name: "zip", ok: !!env.zip, fix: "Run: pkg install zip" },
      { name: "unzip", ok: !!env.unzip, fix: "Run: pkg install unzip" },
      { name: "python", ok: !!env.python, fix: "Run: pkg install python" },
      { name: "node", ok: !!env.node, fix: "Optional for verified CLI tests: pkg install nodejs" }
    ];
  }

  global.OpenPCMAndroidWorkflow = {
    DEFAULTS,
    workflowSteps,
    commandHelp,
    environmentChecks
  };
})(window);
