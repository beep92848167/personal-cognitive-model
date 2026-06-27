(function () {
  const { test, assert, assertEqual, assertDeepEqual } = window.OpenPCMTest;

  function uuid() {
    return "test-" + Math.random().toString(16).slice(2);
  }

  function normalizeEntry(e) {
    return {
      id: e.id || uuid(),
      title: e.title || "Untitled",
      medium: e.medium || e.type || "Other",
      reaction: e.reaction || "Not sure yet",
      cognitive_state: e.cognitive_state || e.cognitive || "Not recorded",
      tags: Array.isArray(e.tags) ? e.tags : (Array.isArray(e.reasons) ? e.reasons : []),
      note: e.note || e.notes || "",
      timestamp_utc: e.timestamp_utc || e.created_utc || "2026-01-01T00:00:00.000Z",
      updated_utc: e.updated_utc || null
    };
  }

  function findDuplicate(entries, title, editingId = "") {
    const target = title.trim().toLowerCase();
    if (!target) return null;
    return entries.find(e => e.title.toLowerCase() === target && e.id !== editingId) || null;
  }

  function filterEntries(entries, { search = "", medium = "All" } = {}) {
    const query = search.toLowerCase();
    return entries.filter(e => {
      const mediumMatch = medium === "All" || e.medium === medium;
      const searchMatch =
        !query ||
        e.title.toLowerCase().includes(query) ||
        (e.note || "").toLowerCase().includes(query) ||
        (e.tags || []).join(" ").toLowerCase().includes(query);
      return mediumMatch && searchMatch;
    });
  }

  function stats(entries) {
    const byType = {};
    const byReaction = {};
    const tags = new Set();

    for (const e of entries) {
      byType[e.medium] = (byType[e.medium] || 0) + 1;
      byReaction[e.reaction] = (byReaction[e.reaction] || 0) + 1;
      for (const tag of e.tags || []) tags.add(tag);
    }

    return {
      total: entries.length,
      byType,
      byReaction,
      uniqueTags: tags.size
    };
  }

  test("normalizeEntry fills missing defaults", () => {
    const e = normalizeEntry({ title: "Black Sails" });
    assert(e.id, "id should be generated");
    assertEqual(e.title, "Black Sails");
    assertEqual(e.medium, "Other");
    assertEqual(e.reaction, "Not sure yet");
    assertEqual(e.cognitive_state, "Not recorded");
    assertDeepEqual(e.tags, []);
    assertEqual(e.note, "");
  });

  test("normalizeEntry maps legacy reasons to tags", () => {
    const e = normalizeEntry({
      title: "Murderbot",
      type: "TV",
      reasons: ["competence", "dry humour"],
      notes: "Loved it"
    });

    assertEqual(e.medium, "TV");
    assertDeepEqual(e.tags, ["competence", "dry humour"]);
    assertEqual(e.note, "Loved it");
  });

  test("duplicate title detection ignores case", () => {
    const entries = [
      { id: "1", title: "Black Sails" },
      { id: "2", title: "Murderbot" }
    ];

    const dup = findDuplicate(entries, "black sails");
    assertEqual(dup.id, "1");
  });

  test("duplicate detection ignores current editing item", () => {
    const entries = [{ id: "1", title: "Black Sails" }];
    const dup = findDuplicate(entries, "Black Sails", "1");
    assertEqual(dup, null);
  });

  test("filterEntries filters by medium", () => {
    const entries = [
      { title: "Black Sails", medium: "TV", tags: [] },
      { title: "Factorio", medium: "Game", tags: [] }
    ];

    const result = filterEntries(entries, { medium: "Game" });
    assertEqual(result.length, 1);
    assertEqual(result[0].title, "Factorio");
  });

  test("filterEntries searches title, note, and tags", () => {
    const entries = [
      { title: "Black Sails", medium: "TV", note: "", tags: ["institutions"] },
      { title: "Factorio", medium: "Game", note: "automation factory", tags: [] },
      { title: "Project Hail Mary", medium: "Book", note: "", tags: ["science"] }
    ];

    assertEqual(filterEntries(entries, { search: "black" }).length, 1);
    assertEqual(filterEntries(entries, { search: "factory" }).length, 1);
    assertEqual(filterEntries(entries, { search: "science" }).length, 1);
  });

  test("stats counts types, reactions, and unique tags", () => {
    const result = stats([
      { medium: "TV", reaction: "Loved", tags: ["writing", "competence"] },
      { medium: "TV", reaction: "Loved", tags: ["writing"] },
      { medium: "Game", reaction: "Liked", tags: ["systems"] }
    ]);

    assertEqual(result.total, 3);
    assertEqual(result.byType.TV, 2);
    assertEqual(result.byType.Game, 1);
    assertEqual(result.byReaction.Loved, 2);
    assertEqual(result.uniqueTags, 3);
  });
})();
