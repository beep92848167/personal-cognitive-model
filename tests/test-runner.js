(function () {
  const tests = [];
  let manifest = { requirements: [] };

  function assert(condition, message = "Assertion failed") {
    if (!condition) throw new Error(message);
  }

  function assertEqual(actual, expected, message = "Values are not equal") {
    if (actual !== expected) {
      throw new Error(`${message}. Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
    }
  }

  function assertDeepEqual(actual, expected, message = "Objects are not equal") {
    const a = JSON.stringify(actual);
    const e = JSON.stringify(expected);
    if (a !== e) {
      throw new Error(`${message}. Expected ${e}, got ${a}`);
    }
  }

  function test(name, requirements, fn) {
    if (typeof requirements === "function") {
      fn = requirements;
      requirements = [];
    }
    tests.push({ name, requirements, fn });
  }

  async function loadManifest() {
    try {
      const res = await fetch("test-manifest.json", { cache: "no-store" });
      manifest = await res.json();
    } catch {
      manifest = { requirements: [] };
    }
  }

  async function runTests() {
    await loadManifest();

    const results = document.getElementById("results");
    results.innerHTML = "";

    let passed = 0;
    let failed = 0;
    const covered = new Set();

    for (const t of tests) {
      const item = document.createElement("div");
      item.className = "test";
      try {
        await t.fn();
        passed++;
        for (const req of t.requirements || []) covered.add(req);
        item.innerHTML = `
          <strong class="pass">PASS</strong> ${escapeHtml(t.name)}
          ${renderReqs(t.requirements)}
        `;
      } catch (err) {
        failed++;
        item.innerHTML = `
          <strong class="fail">FAIL</strong> ${escapeHtml(t.name)}
          ${renderReqs(t.requirements)}
          <pre>${escapeHtml(err.stack || err.message || String(err))}</pre>
        `;
      }
      results.appendChild(item);
    }

    const allReqs = manifest.requirements || [];
    const uncovered = allReqs.filter(r => !covered.has(r.id));

    const summary = document.createElement("div");
    summary.className = "summary";
    summary.innerHTML = `
      <h2>${failed === 0 ? "All tests passed" : "Some tests failed"}</h2>
      <p><span class="pass">${passed} passed</span> · <span class="fail">${failed} failed</span></p>
      <h3>Requirement coverage</h3>
      <p><strong>${covered.size}</strong> covered · <strong>${uncovered.length}</strong> uncovered · <strong>${allReqs.length}</strong> total</p>
      ${uncovered.length ? `
        <details>
          <summary>Uncovered requirements</summary>
          <ul>${uncovered.map(r => `<li><code>${escapeHtml(r.id)}</code> ${escapeHtml(r.title)}</li>`).join("")}</ul>
        </details>
      ` : `<p class="pass">All listed requirements are covered.</p>`}
    `;
    results.prepend(summary);
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
