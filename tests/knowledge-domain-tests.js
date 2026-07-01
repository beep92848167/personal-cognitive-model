(function () {
  const { test, assert } = window.OpenPCMTest;

  test("knowledge domain normalizes minimal knowledge input", ["REQ-KNOWLEDGE-001"], () => {
    const item = window.OpenPCMKnowledgeDomainAPI.normalizeKnowledgeItem({ title: "Working memory" }, {
      now: "2026-07-01T00:00:00.000Z",
      idFactory: () => "knowledge-1"
    });

    assert(item.id === "knowledge-1", "knowledge id should be filled");
    assert(item.title === "Working memory", "title should be preserved");
    assert(item.kind === "note", "kind should default to note");
    assert(item.status === "active", "status should default to active");
  });

  test("knowledge domain validates invalid records", ["REQ-KNOWLEDGE-002"], () => {
    const issues = window.OpenPCMKnowledgeDomain.validate([
      null,
      { title: "", kind: "nonsense", status: "weird", links: "not-array", source_ids: "not-array" }
    ]);

    assert(issues.length >= 6, "validation should report malformed knowledge data");
  });

  test("knowledge domain imports and exports through standard interface", ["REQ-KNOWLEDGE-003"], () => {
    const domain = window.OpenPCMDomainRegistry.get("knowledge");
    const imported = domain.importData([{ title: "A concept", kind: "concept", tags: ["thinking"] }]);
    const exported = domain.exportData(imported);

    assert(Array.isArray(imported), "importData should return an array");
    assert(Array.isArray(exported), "exportData should return an array");
    assert(exported[0].title === "A concept", "exportData should preserve title");
    assert(exported[0].kind === "concept", "exportData should preserve valid kind");
  });

  test("knowledge domain is registered as a plugin", ["REQ-KNOWLEDGE-004"], () => {
    const domain = window.OpenPCMDomainRegistry.get("knowledge");
    const routes = window.OpenPCMDomainRegistry.routes();

    assert(domain.id === "knowledge", "knowledge domain should be registered");
    assert(routes.some(route => route.id === "knowledge-library"), "knowledge route should be discoverable");
  });

  test("knowledge domain can search through shared search service", ["REQ-KNOWLEDGE-005"], () => {
    const results = window.OpenPCMKnowledgeDomain.search([
      { title: "Cognitive load", summary: "Memory pressure", tags: ["learning"] },
      { title: "Car maintenance", summary: "Oil and tyres", tags: ["vehicle"] }
    ], "memory learning");

    assert(results.length === 1, "knowledge search should match the relevant item");
    assert(results[0].title === "Cognitive load", "knowledge search should return matching item");
  });
})();
