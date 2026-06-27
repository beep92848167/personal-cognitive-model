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

  function sortNewestFirst(entries) {
    return entries.slice().sort((a,b) => new Date(b.timestamp_utc) - new Date(a.timestamp_utc));
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

  function removeEntry(entries, id) {
    return entries.filter(e => e.id !== id);
  }

  function updateEntry(entries, updated) {
    return entries.map(e => e.id === updated.id ? updated : e);
  }

  test("normalizeEntry fills missing defaults", ["REQ-EVIDENCE-001"], () => {
    const e = normalizeEntry({ title: "Black Sails" });
    assert(e.id, "id should be generated");
    assertEqual(e.title, "Black Sails");
    assertEqual(e.medium, "Other");
    assertEqual(e.reaction, "Not sure yet");
    assertEqual(e.cognitive_state, "Not recorded");
    assertDeepEqual(e.tags, []);
    assertEqual(e.note, "");
  });

  test("normalizeEntry maps legacy reasons to tags", ["REQ-EVIDENCE-002"], () => {
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

  test("duplicate title detection ignores case", ["REQ-EVIDENCE-004"], () => {
    const entries = [
      { id: "1", title: "Black Sails" },
      { id: "2", title: "Murderbot" }
    ];

    const dup = findDuplicate(entries, "black sails");
    assertEqual(dup.id, "1");
  });

  test("duplicate detection ignores current editing item", ["REQ-EVIDENCE-004", "REQ-EVIDENCE-005"], () => {
    const entries = [{ id: "1", title: "Black Sails" }];
    const dup = findDuplicate(entries, "Black Sails", "1");
    assertEqual(dup, null);
  });

  test("updateEntry updates an existing evidence item", ["REQ-EVIDENCE-005"], () => {
    const entries = [{ id: "1", title: "Old" }];
    const updated = updateEntry(entries, { id: "1", title: "New" });
    assertEqual(updated[0].title, "New");
  });

  test("removeEntry deletes an evidence item", ["REQ-EVIDENCE-006"], () => {
    const entries = [{ id: "1", title: "Delete me" }, { id: "2", title: "Keep me" }];
    const result = removeEntry(entries, "1");
    assertEqual(result.length, 1);
    assertEqual(result[0].id, "2");
  });

  test("sortNewestFirst sorts evidence by newest timestamp", ["REQ-LIBRARY-001"], () => {
    const result = sortNewestFirst([
      { title: "Old", timestamp_utc: "2026-01-01T00:00:00Z" },
      { title: "New", timestamp_utc: "2026-01-02T00:00:00Z" }
    ]);
    assertEqual(result[0].title, "New");
  });

  test("filterEntries filters by medium", ["REQ-LIBRARY-002"], () => {
    const entries = [
      { title: "Black Sails", medium: "TV", tags: [] },
      { title: "Factorio", medium: "Game", tags: [] }
    ];

    const result = filterEntries(entries, { medium: "Game" });
    assertEqual(result.length, 1);
    assertEqual(result[0].title, "Factorio");
  });

  test("filterEntries searches title, note, and tags", ["REQ-LIBRARY-003"], () => {
    const entries = [
      { title: "Black Sails", medium: "TV", note: "", tags: ["institutions"] },
      { title: "Factorio", medium: "Game", note: "automation factory", tags: [] },
      { title: "Project Hail Mary", medium: "Book", note: "", tags: ["science"] }
    ];

    assertEqual(filterEntries(entries, { search: "black" }).length, 1);
    assertEqual(filterEntries(entries, { search: "factory" }).length, 1);
    assertEqual(filterEntries(entries, { search: "science" }).length, 1);
  });

  test("stats counts total entries", ["REQ-STATS-001"], () => {
    const result = stats([
      { medium: "TV", reaction: "Loved", tags: [] },
      { medium: "Game", reaction: "Liked", tags: [] }
    ]);
    assertEqual(result.total, 2);
  });

  test("stats counts types and reactions", ["REQ-STATS-002"], () => {
    const result = stats([
      { medium: "TV", reaction: "Loved", tags: [] },
      { medium: "TV", reaction: "Loved", tags: [] },
      { medium: "Game", reaction: "Liked", tags: [] }
    ]);

    assertEqual(result.byType.TV, 2);
    assertEqual(result.byType.Game, 1);
    assertEqual(result.byReaction.Loved, 2);
  });

  test("stats counts unique tags", ["REQ-STATS-003"], () => {
    const result = stats([
      { medium: "TV", reaction: "Loved", tags: ["writing", "competence"] },
      { medium: "TV", reaction: "Loved", tags: ["writing"] },
      { medium: "Game", reaction: "Liked", tags: ["systems"] }
    ]);

    assertEqual(result.uniqueTags, 3);
  });
})();
