(function () {
  const { test, assertEqual } = window.OpenPCMTest;
  const BrowserTesting = window.OpenPCMBrowserTesting;

  test("browserRunnerCapabilities documents no-Node browser testing", ["REQ-TEST-001"], () => {
    const capabilities = BrowserTesting.browserRunnerCapabilities();
    assertEqual(capabilities.noNodeRequired, true);
    assertEqual(capabilities.passFailSummary, true);
    assertEqual(capabilities.requirementCoverageView, true);
  });

  test("summaryText reports pass/fail browser status", ["REQ-TEST-002"], () => {
    const text = BrowserTesting.summaryText({
      passed: 53,
      failed: 0,
      requirements: { covered: 21, total: 24 }
    });
    assertEqual(text, "53 passed, 0 failed · 21/24 requirements covered");
  });

  test("coveragePercent calculates browser requirement coverage", ["REQ-TEST-003"], () => {
    const percent = BrowserTesting.coveragePercent({
      requirements: { covered: 21, total: 24 }
    });
    assertEqual(percent, 88);
  });

  test("statusClass marks failing browser reports", ["REQ-TEST-002"], () => {
    assertEqual(BrowserTesting.statusClass({ failed: 1 }), "fail");
    assertEqual(BrowserTesting.statusClass({ failed: 0 }), "pass");
  });
})();
