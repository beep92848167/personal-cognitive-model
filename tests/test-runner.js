(function () {
  const tests = [];

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

  function test(name, fn) {
    tests.push({ name, fn });
  }

  async function runTests() {
    const results = document.getElementById("results");
    results.innerHTML = "";

    let passed = 0;
    let failed = 0;

    for (const t of tests) {
      const item = document.createElement("div");
      item.className = "test";
      try {
        await t.fn();
        passed++;
        item.innerHTML = `<strong class="pass">PASS</strong> ${escapeHtml(t.name)}`;
      } catch (err) {
        failed++;
        item.innerHTML = `
          <strong class="fail">FAIL</strong> ${escapeHtml(t.name)}
          <pre>${escapeHtml(err.stack || err.message || String(err))}</pre>
        `;
      }
      results.appendChild(item);
    }

    const summary = document.createElement("div");
    summary.className = "summary";
    summary.innerHTML = `
      <h2>${failed === 0 ? "All tests passed" : "Some tests failed"}</h2>
      <p><span class="pass">${passed} passed</span> · <span class="fail">${failed} failed</span></p>
    `;
    results.prepend(summary);
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
