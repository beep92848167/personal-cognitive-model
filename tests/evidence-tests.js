(function () {
  const { test, assert, assertEqual, assertDeepEqual } = window.OpenPCMTest;
  const Core = window.OpenPCMCore;

  test("normalizeEntry fills missing defaults", ["REQ-EVIDENCE-001"], () => {
    const e = Core.normalizeEntry({ title: "Black Sails" }, { idFactory: () => "test-id", now: "2026-01-01T00:00:00.000Z" });
    assertEqual(e.id, "test-id");
    assertEqual(e.title, "Black Sails");
    assertEqual(e.medium, "Other");
    assertEqual(e.reaction, "Not sure yet");
    assertEqual(e.cognitive_state, "Not recorded");
    assertDeepEqual(e.tags, []);
    assertEqual(e.note, "");
  });

  test("normalizeEntry maps legacy reasons to tags", ["REQ-EVIDENCE-002"], () => {
    const e = Core.normalizeEntry({ title: "Murderbot", type: "TV", reasons: ["competence", "dry humour"], notes: "Loved it" });
    assertEqual(e.medium, "TV");
    assertDeepEqual(e.tags, ["competence", "dry humour"]);
    assertEqual(e.note, "Loved it");
  });

  test("duplicate title detection ignores case", ["REQ-EVIDENCE-004"], () => {
    const dup = Core.findDuplicateTitle([{ id: "1", title: "Black Sails" }], "black sails");
    assertEqual(dup.id, "1");
  });

  test("duplicate detection ignores current editing item", ["REQ-EVIDENCE-004", "REQ-EVIDENCE-005"], () => {
    const dup = Core.findDuplicateTitle([{ id: "1", title: "Black Sails" }], "Black Sails", "1");
    assertEqual(dup, null);
  });

  test("upsertEntry updates an existing evidence item", ["REQ-EVIDENCE-005"], () => {
    const updated = Core.upsertEntry([{ id: "1", title: "Old" }], { id: "1", title: "New" });
    assertEqual(updated.length, 1);
    assertEqual(updated[0].title, "New");
  });

  test("upsertEntry adds a new evidence item", ["REQ-EVIDENCE-003"], () => {
    const updated = Core.upsertEntry([{ id: "1", title: "Existing" }], { id: "2", title: "New" });
    assertEqual(updated.length, 2);
    assertEqual(updated[1].title, "New");
  });

  test("removeEntry deletes an evidence item", ["REQ-EVIDENCE-006"], () => {
    const result = Core.removeEntry([{ id: "1", title: "Delete me" }, { id: "2", title: "Keep me" }], "1");
    assertEqual(result.length, 1);
    assertEqual(result[0].id, "2");
  });

  test("sortNewestFirst sorts evidence by newest timestamp", ["REQ-LIBRARY-001"], () => {
    const result = Core.sortNewestFirst([
      { title: "Old", timestamp_utc: "2026-01-01T00:00:00Z" },
      { title: "New", timestamp_utc: "2026-01-02T00:00:00Z" }
    ]);
    assertEqual(result[0].title, "New");
  });

  test("filterEntries filters by medium", ["REQ-LIBRARY-002"], () => {
    const result = Core.filterEntries([
      { title: "Black Sails", medium: "TV", tags: [] },
      { title: "Factorio", medium: "Game", tags: [] }
    ], { medium: "Game" });
    assertEqual(result.length, 1);
    assertEqual(result[0].title, "Factorio");
  });

  test("filterEntries searches title, note, and tags", ["REQ-LIBRARY-003"], () => {
    const entries = [
      { title: "Black Sails", medium: "TV", note: "", tags: ["institutions"] },
      { title: "Factorio", medium: "Game", note: "automation factory", tags: [] },
      { title: "Project Hail Mary", medium: "Book", note: "", tags: ["science"] }
    ];
    assertEqual(Core.filterEntries(entries, { search: "black" }).length, 1);
    assertEqual(Core.filterEntries(entries, { search: "factory" }).length, 1);
    assertEqual(Core.filterEntries(entries, { search: "science" }).length, 1);
  });

  test("buildStats counts total entries", ["REQ-STATS-001"], () => {
    const result = Core.buildStats([{ medium: "TV", reaction: "Loved", tags: [] }, { medium: "Game", reaction: "Liked", tags: [] }]);
    assertEqual(result.total, 2);
  });

  test("buildStats counts types and reactions", ["REQ-STATS-002"], () => {
    const result = Core.buildStats([
      { medium: "TV", reaction: "Loved", tags: [] },
      { medium: "TV", reaction: "Loved", tags: [] },
      { medium: "Game", reaction: "Liked", tags: [] }
    ]);
    assertEqual(result.byType.TV, 2);
    assertEqual(result.byType.Game, 1);
    assertEqual(result.byReaction.Loved, 2);
  });

  test("buildStats counts unique tags", ["REQ-STATS-003"], () => {
    const result = Core.buildStats([
      { medium: "TV", reaction: "Loved", tags: ["writing", "competence"] },
      { medium: "TV", reaction: "Loved", tags: ["writing"] },
      { medium: "Game", reaction: "Liked", tags: ["systems"] }
    ]);
    assertEqual(result.uniqueTags, 3);
  });

  test("storage helpers save and load normalized entries", ["REQ-EVIDENCE-003"], () => {
    const fakeStorage = { data: {}, getItem(key) { return this.data[key] || null; }, setItem(key, value) { this.data[key] = value; } };
    Core.saveEntriesToStorage([{ title: "Stored", type: "TV" }], fakeStorage, "test_key");
    const loaded = Core.loadEntriesFromStorage(fakeStorage, "test_key", []);
    assertEqual(loaded.length, 1);
    assertEqual(loaded[0].title, "Stored");
    assertEqual(loaded[0].medium, "TV");
  });

  test("storage helper migrates legacy keys", ["REQ-EVIDENCE-002", "REQ-EVIDENCE-003"], () => {
    const fakeStorage = {
      data: { legacy_key: JSON.stringify([{ title: "Legacy", type: "Book" }]) },
      getItem(key) { return this.data[key] || null; },
      setItem(key, value) { this.data[key] = value; }
    };
    const loaded = Core.loadEntriesFromStorage(fakeStorage, "new_key", ["legacy_key"]);
    assertEqual(loaded.length, 1);
    assertEqual(loaded[0].medium, "Book");
    assert(fakeStorage.data.new_key, "legacy data should be written to new key");
  });
})();
