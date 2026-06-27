(function () {
  const { test, assertEqual } = window.OpenPCMTest;
  const Android = window.OpenPCMAndroidWorkflow;

  test("workflowSteps describes one-command sync workflow", ["REQ-ANDROID-001"], () => {
    const steps = Android.workflowSteps("sync");
    assertEqual(steps.length, 3);
    assertEqual(steps[1].detail, 'u -sync "commit message"');
    assertEqual(steps[2].label, "Upload generated sync ZIP");
  });

  test("workflowSteps describes local run workflow", ["REQ-ANDROID-002"], () => {
    const steps = Android.workflowSteps("run", { port: 8080 });
    assertEqual(steps[1].detail, 'u "commit message"');
    assertEqual(steps[2].detail, "http://localhost:8080");
  });

  test("commandHelp documents Termux shortcuts", ["REQ-ANDROID-001", "REQ-ANDROID-002"], () => {
    const commands = Android.commandHelp();
    assertEqual(commands.sync, 'u -sync "commit message"');
    assertEqual(commands.run, "run");
    assertEqual(commands.repo, "pcm");
  });

  test("environmentChecks returns actionable Termux fixes", ["REQ-ANDROID-002"], () => {
    const checks = Android.environmentChecks({ storage: false, gitRepo: true, zip: false, unzip: true, python: true, node: false });
    assertEqual(checks[0].ok, false);
    assertEqual(checks[0].fix, "Run: termux-setup-storage");
    assertEqual(checks.find(check => check.name === "zip").fix, "Run: pkg install zip");
  });
})();
