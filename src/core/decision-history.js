(function (global) {
  const DEFAULT_STORAGE_KEY = "openpcm_decision_history_v1";

  function normalizeDecision(recommendation = {}, options = {}) {
    return {
      id: options.id || global.crypto?.randomUUID?.() || `decision-${Date.now()}`,
      timestamp_utc: options.timestamp_utc || new Date().toISOString(),
      title: recommendation.title || recommendation.candidate?.title || "Untitled",
      medium: recommendation.medium || recommendation.candidate?.medium || "Other",
      score: recommendation.score || 0,
      confidence: recommendation.explanation?.confidence || recommendation.reasoning?.confidence || "Unknown",
      supportingEvidence: recommendation.explanation?.reasons || recommendation.reasoning?.supportingEvidence || [],
      conflictingEvidence: recommendation.explanation?.risks || recommendation.reasoning?.conflictingEvidence || [],
      sources: recommendation.explanation?.sources || recommendation.sources || [],
      feedback: recommendation.feedback || null,
      learningAdjustment: recommendation.learningAdjustment || 0,
      explanationGraphRoot: recommendation.explanationGraph?.root || "",
      explanationGraphSummary: recommendation.explanationGraph && global.OpenPCMExplanationGraph
        ? global.OpenPCMExplanationGraph.graphSummary(recommendation.explanationGraph)
        : null
    };
  }

  function recordDecisions(recommendations = [], options = {}) {
    return (recommendations || []).map((rec, index) => normalizeDecision(rec, {
      ...options,
      id: options.id ? `${options.id}-${index + 1}` : undefined
    }));
  }

  function loadHistory(storage = global.localStorage, key = DEFAULT_STORAGE_KEY) {
    try {
      const raw = storage?.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveHistory(history = [], storage = global.localStorage, key = DEFAULT_STORAGE_KEY) {
    storage?.setItem(key, JSON.stringify(history));
    return history;
  }

  function appendDecisions(history = [], decisions = [], limit = 250) {
    return [...(decisions || []), ...(history || [])].slice(0, limit);
  }

  function decisionHistorySummary(history = []) {
    const byTitle = {};
    for (const decision of history || []) byTitle[decision.title] = (byTitle[decision.title] || 0) + 1;
    return { total: (history || []).length, uniqueTitles: Object.keys(byTitle).length, latest: (history || [])[0] || null, byTitle };
  }

  function scoreTrend(history = [], title = "") {
    return (history || [])
      .filter(decision => decision.title === title)
      .map(decision => ({
        timestamp_utc: decision.timestamp_utc,
        score: decision.score,
        confidence: decision.confidence,
        learningAdjustment: decision.learningAdjustment || 0
      }))
      .reverse();
  }

  global.OpenPCMDecisionHistory = {
    DEFAULT_STORAGE_KEY, normalizeDecision, recordDecisions, loadHistory, saveHistory,
    appendDecisions, decisionHistorySummary, scoreTrend
  };
})(window);
