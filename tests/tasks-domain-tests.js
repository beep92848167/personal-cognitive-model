(function () {
  const { test, assert } = window.OpenPCMTest;

  test("tasks domain normalizes minimal task input", ["REQ-TASKS-001"], () => {
    const task = window.OpenPCMTasksDomainAPI.normalizeTask({ title: "Ship patch" }, {
      now: "2026-07-01T00:00:00.000Z",
      idFactory: () => "task-1"
    });

    assert(task.id === "task-1", "task id should be filled");
    assert(task.title === "Ship patch", "task title should be preserved");
    assert(task.status === "open", "task status should default to open");
    assert(task.priority === "medium", "task priority should default to medium");
  });

  test("tasks domain validates invalid task data", ["REQ-TASKS-002"], () => {
    const issues = window.OpenPCMTasksDomain.validate([
      null,
      { title: "", status: "nonsense", priority: "urgent" }
    ]);

    assert(issues.length >= 4, "validation should report malformed task data");
  });

  test("tasks domain imports and exports through standard interface", ["REQ-TASKS-003"], () => {
    const domain = window.OpenPCMDomainRegistry.get("tasks");
    const imported = domain.importData([{ title: "Review evidence", status: "in_progress" }]);
    const exported = domain.exportData(imported);

    assert(Array.isArray(imported), "importData should return an array");
    assert(Array.isArray(exported), "exportData should return an array");
    assert(exported[0].title === "Review evidence", "exportData should preserve task title");
    assert(exported[0].status === "in_progress", "exportData should preserve valid status");
  });

  test("tasks domain is registered as a plugin", ["REQ-TASKS-004"], () => {
    const domain = window.OpenPCMDomainRegistry.get("tasks");
    const routes = window.OpenPCMDomainRegistry.routes();

    assert(domain.id === "tasks", "tasks domain should be registered");
    assert(routes.some(route => route.id === "task-list"), "task route should be discoverable");
  });
})();
