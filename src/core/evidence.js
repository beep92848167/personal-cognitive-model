(function (global) {
  const DEFAULT_STORAGE_KEY = "openpcm_evidence_v4";
  const LEGACY_STORAGE_KEYS = ["openpcm_evidence_v3", "openpcm_evidence_v2", "pcm_mobile_entries_v1"];
  const QUICK_ENTRY_PRESETS = {
    tv_watched: {
      id: "tv_watched",
      label: "TV watched",
      medium: "TV",
      reaction: "Not sure yet",
      tags: ["watched"],
      note: "Watched: "
    },
    book_read: {
      id: "book_read",
      label: "Book read",
      medium: "Book",
      reaction: "Not sure yet",
      tags: ["read"],
      note: "Read: "
    },
    game_played: {
      id: "game_played",
      label: "Game played",
      medium: "Game",
      reaction: "Not sure yet",
      tags: ["played"],
      note: "Played: "
    },
    recommendation_feedback: {
      id: "recommendation_feedback",
      label: "Recommendation feedback",
      medium: "Other",
      reaction: "Mixed",
      tags: ["recommendation feedback"],
      note: "Recommendation feedback: "
    },
    cognitive_context_note: {
      id: "cognitive_context_note",
      label: "Health/cognitive context note",
      medium: "Health / Cognitive Context",
      reaction: "Not sure yet",
      cognitive_state: "Low capacity",
      tags: ["context note"],
      note: "Context: "
    }
  };

  function createId(prefix = "ev") {
    if (global.crypto && typeof global.crypto.randomUUID === "function") return global.crypto.randomUUID();
    return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  function normalizeEntry(entry = {}, options = {}) {
    const now = options.now || new Date().toISOString();
    const idFactory = options.idFactory || createId;
    return {
      id: entry.id || idFactory(),
      title: entry.title || "Untitled",
      medium: entry.medium || entry.type || "Other",
      reaction: entry.reaction || "Not sure yet",
      cognitive_state: entry.cognitive_state || entry.cognitive || "Not recorded",
      tags: Array.isArray(entry.tags) ? entry.tags : (Array.isArray(entry.reasons) ? entry.reasons : []),
      note: entry.note || entry.notes || "",
      timestamp_utc: entry.timestamp_utc || entry.created_utc || now,
      updated_utc: entry.updated_utc || null
    };
  }

  function normalizeEntries(entries = [], options = {}) {
    return Array.isArray(entries) ? entries.map(entry => normalizeEntry(entry, options)) : [];
  }

  function sortNewestFirst(entries = []) {
    return entries.slice().sort((a, b) => new Date(b.timestamp_utc) - new Date(a.timestamp_utc));
  }

  function filterEntries(entries = [], { search = "", medium = "All" } = {}) {
    const query = String(search || "").toLowerCase();
    return entries.filter(entry => {
      const mediumMatch = medium === "All" || entry.medium === medium;
      const searchMatch =
        !query ||
        String(entry.title || "").toLowerCase().includes(query) ||
        String(entry.note || "").toLowerCase().includes(query) ||
        (entry.tags || []).join(" ").toLowerCase().includes(query);
      return mediumMatch && searchMatch;
    });
  }

  function findDuplicateTitle(entries = [], title = "", editingId = "") {
    const target = String(title || "").trim().toLowerCase();
    if (!target) return null;
    return entries.find(entry => String(entry.title || "").toLowerCase() === target && entry.id !== editingId) || null;
  }

  function upsertEntry(entries = [], entry) {
    const normalized = normalizeEntry(entry);
    const exists = entries.some(existing => existing.id === normalized.id);
    return exists
      ? entries.map(existing => existing.id === normalized.id ? normalized : existing)
      : [...entries, normalized];
  }

  function removeEntry(entries = [], id) {
    return entries.filter(entry => entry.id !== id);
  }

  function presetList(presets = QUICK_ENTRY_PRESETS) {
    return Object.values(presets).map(preset => ({ ...preset, tags: [...(preset.tags || [])] }));
  }

  function getQuickEntryPreset(id, presets = QUICK_ENTRY_PRESETS) {
    const preset = presets[id] || null;
    return preset ? { ...preset, tags: [...(preset.tags || [])] } : null;
  }

  function applyQuickEntryPreset(draft = {}, presetId, presets = QUICK_ENTRY_PRESETS) {
    const preset = getQuickEntryPreset(presetId, presets);
    if (!preset) return { ...draft, tags: Array.isArray(draft.tags) ? [...draft.tags] : [] };
    const draftTags = Array.isArray(draft.tags) ? draft.tags : [];
    const tags = Array.from(new Set([...draftTags, ...(preset.tags || [])]));
    return {
      ...draft,
      medium: preset.medium || draft.medium,
      reaction: preset.reaction || draft.reaction,
      cognitive_state: preset.cognitive_state || draft.cognitive_state || "Not recorded",
      tags,
      note: draft.note ? draft.note : (preset.note || "")
    };
  }

  function buildStats(entries = []) {
    const byType = {};
    const byReaction = {};
    const tags = new Set();

    for (const entry of entries) {
      byType[entry.medium] = (byType[entry.medium] || 0) + 1;
      byReaction[entry.reaction] = (byReaction[entry.reaction] || 0) + 1;
      for (const tag of entry.tags || []) tags.add(tag);
    }

    return {
      total: entries.length,
      byType,
      byReaction,
      uniqueTags: tags.size,
      topType: topCount(byType),
      topReaction: topCount(byReaction)
    };
  }

  function topCount(counts) {
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
    return top ? `${top[0]}: ${top[1]}` : "None";
  }

  function loadEntriesFromStorage(storage = global.localStorage, storageKey = DEFAULT_STORAGE_KEY, legacyKeys = LEGACY_STORAGE_KEYS) {
    try {
      const current = JSON.parse(storage.getItem(storageKey));
      if (Array.isArray(current)) return normalizeEntries(current);
    } catch {}

    for (const key of legacyKeys) {
      try {
        const legacy = JSON.parse(storage.getItem(key));
        if (Array.isArray(legacy) && legacy.length) {
          const normalized = normalizeEntries(legacy);
          saveEntriesToStorage(normalized, storage, storageKey);
          return normalized;
        }
      } catch {}
    }

    return [];
  }

  function saveEntriesToStorage(entries = [], storage = global.localStorage, storageKey = DEFAULT_STORAGE_KEY) {
    storage.setItem(storageKey, JSON.stringify(normalizeEntries(entries)));
  }

  global.OpenPCMCore = {
    DEFAULT_STORAGE_KEY,
    LEGACY_STORAGE_KEYS,
    QUICK_ENTRY_PRESETS,
    createId,
    normalizeEntry,
    normalizeEntries,
    sortNewestFirst,
    filterEntries,
    findDuplicateTitle,
    upsertEntry,
    removeEntry,
    presetList,
    getQuickEntryPreset,
    applyQuickEntryPreset,
    buildStats,
    loadEntriesFromStorage,
    saveEntriesToStorage
  };
})(window);
