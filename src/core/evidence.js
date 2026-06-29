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

  function topTagCounts(entries = [], limit = 5) {
    const counts = {};
    for (const entry of entries) {
      for (const tag of entry.tags || []) {
        counts[tag] = (counts[tag] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }));
  }

  function mostRecentCognitiveState(entries = []) {
    const recent = sortNewestFirst(entries).find(entry => entry.cognitive_state && entry.cognitive_state !== "Not recorded");
    return recent ? recent.cognitive_state : "Not recorded";
  }

  function exportReminder(entries = [], options = {}) {
    const threshold = Number.isFinite(options.threshold) ? options.threshold : 5;
    const total = entries.length;
    if (!total) return "Add evidence first, then export your PCM backup.";
    if (total >= threshold) return `Export reminder: ${total} entries captured locally. Back up soon.`;
    const remaining = threshold - total;
    return `Export reminder: back up after ${remaining} more ${remaining === 1 ? "entry" : "entries"}.`;
  }


  function describeRelativeTime(timestampUtc, options = {}) {
    if (!timestampUtc) return "No timestamp";
    const nowMs = options.now ? new Date(options.now).getTime() : Date.now();
    const thenMs = new Date(timestampUtc).getTime();
    if (!Number.isFinite(thenMs)) return "Unknown time";
    const minutes = Math.max(0, Math.round((nowMs - thenMs) / 60000));
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    return `${days}d ago`;
  }

  function lastActivity(entries = []) {
    return sortNewestFirst(normalizeEntries(entries))[0] || null;
  }

  function buildRecentTimeline(entries = [], options = {}) {
    return sortNewestFirst(normalizeEntries(entries))
      .slice(0, options.limit || 5)
      .map(entry => ({
        id: entry.id,
        title: entry.title,
        medium: entry.medium,
        reaction: entry.reaction,
        cognitive_state: entry.cognitive_state,
        timestamp_utc: entry.timestamp_utc,
        relativeTime: describeRelativeTime(entry.timestamp_utc, options)
      }));
  }

  function buildNextActions(entries = [], options = {}) {
    const normalized = normalizeEntries(entries);
    const actions = [];
    const recent = lastActivity(normalized);

    if (recent) {
      actions.push({
        id: "continue_last",
        label: `Continue: ${recent.title}`,
        kind: "continue",
        entryId: recent.id,
        note: `${recent.medium} · ${describeRelativeTime(recent.timestamp_utc, options)}`
      });
    } else {
      actions.push({
        id: "first_capture",
        label: "Add first evidence",
        kind: "nav",
        target: "add",
        note: "Start your portable PCM dataset."
      });
    }

    const presets = presetList().slice(0, options.presetLimit || 3);
    for (const preset of presets) {
      actions.push({
        id: `preset_${preset.id}`,
        label: preset.label,
        kind: "preset",
        presetId: preset.id,
        note: preset.medium
      });
    }

    if (normalized.length >= (options.exportThreshold || 5)) {
      actions.push({
        id: "export_backup",
        label: "Export backup",
        kind: "nav",
        target: "settings",
        note: "Protect local-only evidence."
      });
    }

    return actions.slice(0, options.limit || 5);
  }

  function buildDashboardSummary(entries = [], options = {}) {
    const sorted = sortNewestFirst(normalizeEntries(entries));
    return {
      totalEntries: sorted.length,
      recentEntries: sorted.slice(0, options.recentLimit || 3),
      topTags: topTagCounts(sorted, options.tagLimit || 5),
      currentMode: mostRecentCognitiveState(sorted),
      exportReminder: exportReminder(sorted, options),
      continueEntry: lastActivity(sorted),
      nextActions: buildNextActions(sorted, options),
      recentTimeline: buildRecentTimeline(sorted, { ...options, limit: options.timelineLimit || 5 })
    };
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
    topTagCounts,
    mostRecentCognitiveState,
    exportReminder,
    describeRelativeTime,
    lastActivity,
    buildRecentTimeline,
    buildNextActions,
    buildDashboardSummary,
    loadEntriesFromStorage,
    saveEntriesToStorage
  };
})(window);
