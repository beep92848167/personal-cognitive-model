(function () {
  const harness = window.OpenPCMTestHarness.createHarness({ runner: "tests/test.html" });
  let manifest = { source: "none", requirements: [] };

  const { test, assert, assertEqual, assertDeepEqual } = harness;

  async function loadManifest() {
    try {
      const res = await fetch("../requirements/requirements.json", { cache: "no-store" });
      const registry = await res.json();
      manifest = {
        source: "requirements/requirements.json",
        requirements: window.OpenPCMTestHarness.normalizeRequirements(registry.requirements || [])
      };
      return;
    } catch {}

    try {
      const res = await fetch("test-manifest.json", { cache: "no-store" });
      const fallback = await res.json();
      manifest = {
        source: "tests/test-manifest.json",
        requirements: window.OpenPCMTestHarness.normalizeRequirements(fallback.requirements || [])
      };
    } catch {
      manifest = { source: "none", requirements: [] };
    }
  }

  async function runTests() {
    await loadManifest();

    const results = document.getElementById("results");
    results.innerHTML = "";

    const report = await harness.runAll(manifest);

    for (const result of report.results) {
      const item = document.createElement("div");
      item.className = "test";
      item.innerHTML = result.status === "PASS"
        ? `<strong class="pass">PASS</strong> ${escapeHtml(result.name)}${renderReqs(result.requirements)}`
        : `<strong class="fail">FAIL</strong> ${escapeHtml(result.name)}${renderReqs(result.requirements)}<pre>${escapeHtml(result.stack || result.message || "")}</pre>`;
      results.appendChild(item);
    }

    const uncovered = report.requirements.uncovered || [];
    const summary = document.createElement("div");
    summary.className = "summary";
    summary.innerHTML = `
      <h2>${report.failed === 0 ? "All tests passed" : "Some tests failed"}</h2>
      <p><span class="pass">${report.passed} passed</span> · <span class="fail">${report.failed} failed</span></p>
      <h3>Requirement coverage</h3>
      <p><strong>${report.requirements.covered}</strong> covered · <strong>${uncovered.length}</strong> uncovered · <strong>${report.requirements.total}</strong> total</p>
      <p class="reqs">Source: <code>${escapeHtml(report.requirements.source)}</code></p>
      ${uncovered.length ? `
        <details>
          <summary>Uncovered requirements</summary>
          <ul>${uncovered.map(r => `<li><code>${escapeHtml(r.id)}</code> ${escapeHtml(r.title)} ${r.area ? `<span class="reqs">(${escapeHtml(r.area)} · ${escapeHtml(r.priority)})</span>` : ""}</li>`).join("")}</ul>
        </details>
      ` : `<p class="pass">All listed requirements are covered.</p>`}
    `;
    results.prepend(summary);

    window.OpenPCMLastTestReport = report;
  }

  function renderReqs(reqs) {
    if (!reqs || !reqs.length) return `<div class="reqs">No requirements mapped</div>`;
    return `<div class="reqs">${reqs.map(r => `<code>${escapeHtml(r)}</code>`).join(" ")}</div>`;
  }

  function escapeHtml(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  window.OpenPCMTest = {
    test,
    assert,
    assertEqual,
    assertDeepEqual,
    runTests
  };

  document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("run").addEventListener("click", runTests);
    runTests();
  });
})();
