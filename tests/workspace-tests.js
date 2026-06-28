(function () {
  const { test, assertEqual } = window.OpenPCMTest;
  const Workspace = window.OpenPCMWorkspace;

  const recommendation = {
    title: "Counterpart",
    medium: "TV",
    score: 87,
    explanation: { confidence: "High" }
  };

  test("addToWorkspace adds recommendation once", ["REQ-WORKSPACE-001"], () => {
    const first = Workspace.addToWorkspace([], recommendation);
    const second = Workspace.addToWorkspace(first, recommendation);
    assertEqual(first.length, 1);
    assertEqual(second.length, 1);
    assertEqual(first[0].title, "Counterpart");
    assertEqual(first[0].status, "watch_next");
  });

  test("updateWorkspaceItem changes status pin and note", ["REQ-WORKSPACE-001"], () => {
    const items = Workspace.addToWorkspace([], recommendation);
    const updated = Workspace.updateWorkspaceItem(items, items[0].id, {
      status: "completed",
      pinned: true,
      note: "Great fit"
    });

    assertEqual(updated[0].status, "completed");
    assertEqual(updated[0].pinned, true);
    assertEqual(updated[0].note, "Great fit");
  });

  test("removeWorkspaceItem removes by id", ["REQ-WORKSPACE-001"], () => {
    const items = Workspace.addToWorkspace([], recommendation);
    const removed = Workspace.removeWorkspaceItem(items, items[0].id);
    assertEqual(removed.length, 0);
  });

  test("workspaceSummary counts statuses and pins", ["REQ-WORKSPACE-001"], () => {
    const items = [
      Workspace.normalizeItem({ title: "A", status: "watch_next", pinned: true }),
      Workspace.normalizeItem({ title: "B", status: "completed" }),
      Workspace.normalizeItem({ title: "C", status: "completed" })
    ];
    const summary = Workspace.workspaceSummary(items);
    assertEqual(summary.total, 3);
    assertEqual(summary.pinned, 1);
    assertEqual(summary.byStatus.completed, 2);
  });

  test("compareWorkspaceItems sorts pinned then score", ["REQ-WORKSPACE-001"], () => {
    const sorted = Workspace.compareWorkspaceItems([
      { title: "Low", score: 20 },
      { title: "Pinned", score: 10, pinned: true },
      { title: "High", score: 90 }
    ]);

    assertEqual(sorted[0].title, "Pinned");
    assertEqual(sorted[1].title, "High");
  });

  test("saveWorkspace and loadWorkspace round-trip through storage", ["REQ-WORKSPACE-001"], () => {
    const storage = {
      data: {},
      getItem(key) { return this.data[key] || null; },
      setItem(key, value) { this.data[key] = value; }
    };
    Workspace.saveWorkspace([{ title: "Counterpart" }], storage, "workspace");
    assertEqual(Workspace.loadWorkspace(storage, "workspace")[0].title, "Counterpart");
  });
})();
