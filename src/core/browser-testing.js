(function (global) {
  function browserRunnerCapabilities(report = null) {
    return {
      noNodeRequired: true,
      passFailSummary: true,
      requirementCoverageView: true,
      sharedHarness: !!global.OpenPCMTestHarness,
      latestReportAvailable: !!report
    };
  }

  function coveragePercent(report = {}) {
    const total = report.requirements?.total || 0;
    const covered = report.requirements?.covered || 0;
    return total ? Math.round((covered / total) * 100) : 0;
  }

  function summaryText(report = {}) {
    const passed = report.passed ?? 0;
    const failed = report.failed ?? 0;
    const covered = report.requirements?.covered ?? 0;
    const total = report.requirements?.total ?? 0;
    return `${passed} passed, ${failed} failed · ${covered}/${total} requirements covered`;
  }

  function statusClass(report = {}) {
    return report.failed ? "fail" : "pass";
  }

  global.OpenPCMBrowserTesting = {
    browserRunnerCapabilities,
    coveragePercent,
    summaryText,
    statusClass
  };
})(window);
