(function (global) {
  const DEFAULT_STORAGE_KEY = "openpcm_recommendation_feedback_v1";
  const VALUES = {
    positive: 1,
    neutral: 0,
    negative: -1
  };

  function titleKey(title = "") {
    return String(title || "").trim().toLowerCase();
  }

  function normalizeFeedback(feedback = {}) {
    const title = String(feedback.title || "").trim();
    const value = VALUES[feedback.value] ?? Number(feedback.value || 0);
    return {
      title,
      key: titleKey(title),
      value: Math.max(-1, Math.min(1, value)),
      note: String(feedback.note || "").trim(),
      timestamp_utc: feedback.timestamp_utc || new Date().toISOString()
    };
  }

  function loadFeedback(storage = global.localStorage, key = DEFAULT_STORAGE_KEY) {
    try {
      const raw = storage?.getItem(key);
      if (!raw) return [];
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data.map(normalizeFeedback).filter(item => item.title) : [];
    } catch {
      return [];
    }
  }

  function saveFeedback(items = [], storage = global.localStorage, key = DEFAULT_STORAGE_KEY) {
    const normalized = items.map(normalizeFeedback).filter(item => item.title);
    storage?.setItem(key, JSON.stringify(normalized));
    return normalized;
  }

  function upsertFeedback(items = [], feedback = {}) {
    const normalized = normalizeFeedback(feedback);
    if (!normalized.title) return items.map(normalizeFeedback);

    const rest = items.map(normalizeFeedback).filter(item => item.key !== normalized.key);
    return [...rest, normalized];
  }

  function feedbackForTitle(items = [], title = "") {
    const key = titleKey(title);
    return items.map(normalizeFeedback).find(item => item.key === key) || null;
  }

  function applyFeedback(recommendations = [], feedbackItems = []) {
    return recommendations
      .map(recommendation => {
        const feedback = feedbackForTitle(feedbackItems, recommendation.title);
        const adjustment = feedback ? feedback.value * 15 : 0;
        const adjustedScore = Math.max(0, Math.min(100, Math.round((recommendation.score || 0) + adjustment)));
        return {
          ...recommendation,
          originalScore: recommendation.score,
          score: adjustedScore,
          feedback: feedback ? {
            value: feedback.value,
            note: feedback.note,
            timestamp_utc: feedback.timestamp_utc
          } : null
        };
      })
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  }

  global.OpenPCMCalibration = {
    DEFAULT_STORAGE_KEY,
    normalizeFeedback,
    loadFeedback,
    saveFeedback,
    upsertFeedback,
    feedbackForTitle,
    applyFeedback
  };
})(window);
