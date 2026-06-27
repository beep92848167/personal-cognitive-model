(function (global) {
  function createHarness(options = {}) {
    const tests = [];
    const covered = new Set();

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
      tests.push({ name, requirements: requirements || [], fn });
    }

    async function runAll(manifest = { requirements: [], source: "unknown" }) {
      const started = Date.now();
      const results = [];

      for (const t of tests) {
        try {
          await t.fn();
          for (const req of t.requirements || []) covered.add(req);
          results.push({ name: t.name, status: "PASS", requirements: t.requirements || [] });
        } catch (err) {
          results.push({
            name: t.name,
            status: "FAIL",
            requirements: t.requirements || [],
            message: err.message || String(err),
            stack: err.stack || ""
          });
        }
      }

      const requirements = manifest.requirements || [];
      const failed = results.filter(result => result.status === "FAIL");
      const passed = results.length - failed.length;

      return {
        workflowVersion: 4,
        timestamp: new Date().toISOString(),
        status: failed.length ? "FAIL" : "PASS",
        passed,
        failed: failed.length,
        total: results.length,
        durationMs: Date.now() - started,
        runner: options.runner || "unknown",
        requirements: {
          source: manifest.source || "unknown",
          total: requirements.length,
          covered: covered.size,
          uncovered: requirements.filter(req => !covered.has(req.id)).map(req => ({
            id: req.id,
            title: req.title || "",
            area: req.area || "",
            priority: req.priority || "",
            status: req.status || ""
          }))
        },
        failures: failed.map(result => ({
          test: result.name,
          message: result.message,
          stack: result.stack || ""
        })),
        results
      };
    }

    return {
      test,
      assert,
      assertEqual,
      assertDeepEqual,
      runAll,
      get tests() {
        return tests;
      }
    };
  }

  function normalizeRequirements(requirements = []) {
    return requirements.map(req => ({
      id: req.id,
      title: req.shortTitle || req.title || "",
      area: req.area || "",
      priority: req.priority || "",
      status: req.status || ""
    }));
  }

  global.OpenPCMTestHarness = {
    createHarness,
    normalizeRequirements
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = global.OpenPCMTestHarness;
  }
})(typeof globalThis !== "undefined" ? globalThis : window);
