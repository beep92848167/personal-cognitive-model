(function () {
  const { test, assert, assertEqual } = window.OpenPCMTest;

  test("validation service reports missing strings and invalid enum values", ["REQ-SERVICE-001"], () => {
    const validation = window.OpenPCMValidationService;
    const missing = validation.requireNonEmptyString("", 0, "missing-title", "Title is required.");
    const invalid = validation.requireOneOf("urgent", ["low", "medium", "high"], 1, "invalid-priority", "priority");

    assertEqual(missing.length, 1, "missing string should produce one issue");
    assertEqual(invalid.length, 1, "invalid enum should produce one issue");
  });

  test("import export service clones and normalizes lists", ["REQ-SERVICE-002"], () => {
    const service = window.OpenPCMImportExportService;
    const input = [{ title: "A" }];
    const output = service.importList(input, item => Object.assign({}, item, { normalized: true }));

    assert(output[0].normalized, "normalizer should be applied");
    assert(input[0].normalized !== true, "input should not be mutated");
  });

  test("search service matches tokenized text across configured fields", ["REQ-SERVICE-003"], () => {
    const service = window.OpenPCMSearchService;
    const item = { title: "Deep Work", tags: ["focus", "attention"] };

    assert(service.matchesQuery(item, "deep focus", ["title", "tags"]), "search should match across fields");
    assert(!service.matchesQuery(item, "finance", ["title", "tags"]), "search should reject missing tokens");
  });

  test("storage service reads and writes JSON through an adapter", ["REQ-SERVICE-004"], () => {
    const backing = {};
    const adapter = {
      getItem(key) { return Object.prototype.hasOwnProperty.call(backing, key) ? backing[key] : null; },
      setItem(key, value) { backing[key] = String(value); },
      removeItem(key) { delete backing[key]; }
    };

    const storage = window.OpenPCMStorageService.createJsonStorage(adapter, "test");
    storage.save({ ok: true });

    assert(storage.load().ok, "stored JSON should load");
    storage.clear();
    assert(storage.load(null) === null, "cleared JSON should return fallback");
  });

  test("domains can use shared import/export services", ["REQ-SERVICE-005"], () => {
    const tasks = window.OpenPCMDomainRegistry.get("tasks");
    const imported = tasks.importData([{ title: "Shared service task" }]);

    assert(imported[0].id, "shared import path should still normalize tasks");
    assert(imported[0].title === "Shared service task", "shared import path should preserve title");
  });
})();
