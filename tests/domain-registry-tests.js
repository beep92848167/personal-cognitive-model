(function () {
  const { test, assert } = window.OpenPCMTest;

  test("domain registry registers and lists domains", ["REQ-DOMAIN-001"], () => {
    const registry = window.OpenPCMDomains.createDomainRegistry();
    registry.register({ id: "example", title: "Example" });

    assert(registry.has("example"), "registered domain should be found");
    assert(registry.get("example").title === "Example", "registered domain should be retrievable");
    assert(registry.list().length === 1, "registered domain should be listed");
  });

  test("domain registry rejects duplicate ids", ["REQ-DOMAIN-002"], () => {
    const registry = window.OpenPCMDomains.createDomainRegistry();
    registry.register({ id: "example", title: "Example" });

    let threw = false;
    try {
      registry.register({ id: "example", title: "Duplicate" });
    } catch (error) {
      threw = true;
    }

    assert(threw, "duplicate domain id should throw");
  });

  test("evidence domain exposes standard plugin shape", ["REQ-DOMAIN-003"], () => {
    const domain = window.OpenPCMEvidenceDomain;

    assert(domain.id === "evidence", "evidence domain id should be evidence");
    assert(typeof domain.validate === "function", "evidence domain should validate");
    assert(Array.isArray(domain.storageKeys), "evidence domain should declare storage keys");
    assert(Array.isArray(domain.requirements), "evidence domain should declare requirements");
  });

  test("global registry includes evidence domain", ["REQ-DOMAIN-003"], () => {
    assert(window.OpenPCMDomainRegistry.has("evidence"), "global domain registry should include evidence domain");
  });

  test("domain registry exposes routes dynamically", ["REQ-DOMAIN-004"], () => {
    const routes = window.OpenPCMDomainRegistry.routes();
    assert(Array.isArray(routes), "routes should be an array");
    assert(routes.some(route => route.id === "evidence-library"), "evidence route should be discoverable");
  });

  test("evidence domain imports and exports through domain interface", ["REQ-DOMAIN-005"], () => {
    const domain = window.OpenPCMDomainRegistry.get("evidence");
    const imported = domain.importData([{ title: "Example", medium: "Book" }]);
    const exported = domain.exportData(imported);

    assert(Array.isArray(imported), "importData should return an array");
    assert(Array.isArray(exported), "exportData should return an array");
    assert(exported[0].title === "Example", "exportData should preserve title");
  });

  test("evidence domain validation reports malformed entries", ["REQ-DOMAIN-005"], () => {
    const domain = window.OpenPCMDomainRegistry.get("evidence");
    const issues = domain.validate([null, { title: "" }]);

    assert(issues.length >= 2, "validation should report invalid and titleless entries");
  });
})();

