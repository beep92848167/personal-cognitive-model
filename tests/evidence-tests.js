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

  test("presetList exposes low-RSI quick entry presets", ["REQ-EVIDENCE-007"], () => {
    const presets = Core.presetList();
    assertEqual(presets.length, 5);
    assert(presets.some(preset => preset.id === "tv_watched"), "TV watched preset should exist");
    assert(presets.some(preset => preset.id === "cognitive_context_note"), "context note preset should exist");
  });

  test("applyQuickEntryPreset fills draft fields without deleting existing tags", ["REQ-EVIDENCE-007"], () => {
    const draft = {
      medium: "Other",
      reaction: "Liked",
      cognitive_state: "Medium capacity",
      tags: ["competence"],
      note: ""
    };
    const result = Core.applyQuickEntryPreset(draft, "game_played");
    assertEqual(result.medium, "Game");
    assertEqual(result.reaction, "Not sure yet");
    assertEqual(result.cognitive_state, "Medium capacity");
    assertDeepEqual(result.tags, ["competence", "played"]);
    assertEqual(result.note, "Played: ");
  });

  test("topTagCounts returns the most frequent tags", ["REQ-DASHBOARD-001"], () => {
    const result = Core.topTagCounts([
      { tags: ["competence", "systems"] },
      { tags: ["competence"] },
      { tags: ["writing"] }
    ], 2);
    assertDeepEqual(result, [{ tag: "competence", count: 2 }, { tag: "systems", count: 1 }]);
  });

  test("buildDashboardSummary includes recent entries, current mode, and export reminder", ["REQ-DASHBOARD-001"], () => {
    const result = Core.buildDashboardSummary([
      { title: "Old", medium: "TV", reaction: "Liked", cognitive_state: "Low capacity", tags: ["slow"], timestamp_utc: "2026-01-01T00:00:00Z" },
      { title: "New", medium: "Book", reaction: "Loved", cognitive_state: "High capacity", tags: ["writing"], timestamp_utc: "2026-01-02T00:00:00Z" }
    ], { threshold: 2 });
    assertEqual(result.totalEntries, 2);
    assertEqual(result.recentEntries[0].title, "New");
    assertEqual(result.currentMode, "High capacity");
    assert(result.exportReminder.includes("Back up soon"), "dashboard should include an export reminder");
  });

  test("buildNextActions prioritizes continue and one-tap capture", ["REQ-DAILY-DRIVER-001"], () => {
    const result = Core.buildNextActions([
      { id: "old", title: "Old", medium: "TV", reaction: "Liked", tags: [], timestamp_utc: "2026-01-01T00:00:00Z" },
      { id: "new", title: "New", medium: "Book", reaction: "Loved", tags: [], timestamp_utc: "2026-01-02T00:00:00Z" }
    ], { now: "2026-01-02T01:00:00Z" });
    assertEqual(result[0].kind, "continue");
    assertEqual(result[0].entryId, "new");
    assert(result.some(action => action.kind === "preset" && action.presetId === "tv_watched"), "home actions should include one-tap presets");
  });

  test("buildDashboardSummary includes Daily Driver actions and timeline", ["REQ-DAILY-DRIVER-001"], () => {
    const result = Core.buildDashboardSummary([
      { id: "1", title: "Evidence", medium: "TV", reaction: "Liked", cognitive_state: "Medium capacity", tags: [], timestamp_utc: "2026-01-02T00:00:00Z" }
    ], { now: "2026-01-02T01:00:00Z" });
    assertEqual(result.continueEntry.title, "Evidence");
    assertEqual(result.recentTimeline.length, 1);
    assertEqual(result.recentTimeline[0].relativeTime, "1h ago");
    assert(result.nextActions.length >= 2, "dashboard should expose actionable next steps");
  });


})();
