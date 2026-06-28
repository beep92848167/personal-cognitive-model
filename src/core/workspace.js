(function (global) {
  const DEFAULT_STORAGE_KEY = "openpcm_recommendation_workspace_v1";
  const STATUSES = ["watch_next", "reading", "completed", "rejected", "parked"];

  function normalizeItem(item = {}) {
    const title = String(item.title || item.recommendation?.title || "").trim();
    return {
      id: item.id || global.crypto?.randomUUID?.() || `workspace-${Date.now()}`,
      title,
      medium: item.medium || item.recommendation?.medium || "Other",
      status: STATUSES.includes(item.status) ? item.status : "watch_next",
      pinned: !!item.pinned,
      note: String(item.note || "").trim(),
      score: item.score ?? item.recommendation?.score ?? 0,
      confidence: item.confidence || item.recommendation?.explanation?.confidence || "Unknown",
      added_at_utc: item.added_at_utc || new Date().toISOString(),
      updated_at_utc: item.updated_at_utc || new Date().toISOString(),
      recommendation: item.recommendation || null
    };
  }

  function loadWorkspace(storage = global.localStorage, key = DEFAULT_STORAGE_KEY) {
    try {
      const raw = storage?.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.map(normalizeItem).filter(item => item.title) : [];
    } catch {
      return [];
    }
  }

  function saveWorkspace(items = [], storage = global.localStorage, key = DEFAULT_STORAGE_KEY) {
    const normalized = (items || []).map(normalizeItem).filter(item => item.title);
    storage?.setItem(key, JSON.stringify(normalized));
    return normalized;
  }

  function addToWorkspace(items = [], recommendation = {}, options = {}) {
    const title = String(options.title || recommendation.title || "").trim();
    if (!title) return (items || []).map(normalizeItem);
    const existing = (items || []).map(normalizeItem);
    if (existing.some(item => item.title.toLowerCase() === title.toLowerCase())) return existing;

    return [
      normalizeItem({
        title,
        medium: recommendation.medium,
        score: recommendation.score,
        confidence: recommendation.explanation?.confidence,
        recommendation,
        status: options.status || "watch_next",
        pinned: options.pinned || false,
        note: options.note || ""
      }),
      ...existing
    ];
  }

  function updateWorkspaceItem(items = [], id = "", patch = {}) {
    return (items || []).map(normalizeItem).map(item => {
      if (item.id !== id) return item;
      return normalizeItem({
        ...item,
        ...patch,
        id: item.id,
        added_at_utc: item.added_at_utc,
        updated_at_utc: new Date().toISOString()
      });
    });
  }

  function removeWorkspaceItem(items = [], id = "") {
    return (items || []).map(normalizeItem).filter(item => item.id !== id);
  }

  function workspaceSummary(items = []) {
    const normalized = (items || []).map(normalizeItem);
    const byStatus = {};
    for (const status of STATUSES) byStatus[status] = 0;
    for (const item of normalized) byStatus[item.status] = (byStatus[item.status] || 0) + 1;

    return {
      total: normalized.length,
      pinned: normalized.filter(item => item.pinned).length,
      byStatus
    };
  }

  function compareWorkspaceItems(items = []) {
    return (items || [])
      .map(normalizeItem)
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return (b.score || 0) - (a.score || 0) || a.title.localeCompare(b.title);
      });
  }

  global.OpenPCMWorkspace = {
    DEFAULT_STORAGE_KEY,
    STATUSES,
    normalizeItem,
    loadWorkspace,
    saveWorkspace,
    addToWorkspace,
    updateWorkspaceItem,
    removeWorkspaceItem,
    workspaceSummary,
    compareWorkspaceItems
  };
})(window);
