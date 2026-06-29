(function (global) {
  const DEFAULT_STORAGE_KEY = "openpcm_prediction_ledger_v1";

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function normalizeText(value = "") {
    return String(value || "").trim().toLowerCase();
  }

  function normalizePrediction(recommendation = {}, options = {}) {
    const predictedScore = Number(options.predictedScore ?? recommendation.score ?? 0);
    const confidencePercent = Number(options.confidencePercent ?? recommendation.confidencePercent ?? 0);
    const candidate = recommendation.candidate || {};

    return {
      id: options.id || global.crypto?.randomUUID?.() || `prediction-${Date.now()}`,
      timestamp_utc: options.timestamp_utc || new Date().toISOString(),
      title: recommendation.title || candidate.title || candidate.name || "Untitled",
      medium: recommendation.medium || candidate.medium || candidate.type || "Other",
      predictedScore: clamp(Math.round(predictedScore), 0, 100),
      confidence: options.confidence || recommendation.confidence || recommendation.explanation?.confidence || "Unknown",
      confidencePercent: clamp(Math.round(confidencePercent), 0, 100),
      predictedReaction: options.predictedReaction || scoreToPredictedReaction(predictedScore),
      reasons: recommendation.matches || recommendation.reasons || recommendation.explanation?.reasons || [],
      risks: recommendation.risks || recommendation.explanation?.risks || [],
      sources: recommendation.explanation?.sources || recommendation.sources || [],
      actualReaction: null,
      actualScore: null,
      predictionError: null,
      outcome: "pending",
      mismatchReason: ""
    };
  }

  function scoreToPredictedReaction(score = 0) {
    const value = Number(score || 0);
    if (value >= 85) return "loved";
    if (value >= 70) return "liked";
    if (value >= 45) return "mixed";
    return "unlikely";
  }

  function reactionToActualScore(reaction = "") {
    const normalized = normalizeText(reaction);
    if (["loved", "love", "excellent"].includes(normalized)) return 100;
    if (["liked", "like", "good"].includes(normalized)) return 80;
    if (["mixed", "okay", "ok"].includes(normalized)) return 55;
    if (["bounced", "bounce", "dropped"].includes(normalized)) return 25;
    if (["disliked", "dislike", "bad"].includes(normalized)) return 10;
    return null;
  }

  function classifyError(error = 0) {
    const absolute = Math.abs(Number(error || 0));
    if (absolute <= 10) return "accurate";
    if (absolute <= 25) return "minor_miss";
    return "major_miss";
  }

  function attachOutcome(prediction = {}, feedback = {}) {
    const actualScore = Number.isFinite(Number(feedback.actualScore))
      ? clamp(Math.round(Number(feedback.actualScore)), 0, 100)
      : reactionToActualScore(feedback.actualReaction || feedback.reaction);
    const predictedScore = Number(prediction.predictedScore || 0);
    const predictionError = actualScore === null ? null : actualScore - predictedScore;

    return {
      ...prediction,
      feedback_timestamp_utc: feedback.timestamp_utc || feedback.timestampUtc || new Date().toISOString(),
      actualReaction: feedback.actualReaction || feedback.reaction || prediction.actualReaction || null,
      actualScore,
      predictionError,
      outcome: predictionError === null ? "pending" : classifyError(predictionError),
      mismatchReason: feedback.mismatchReason || feedback.reason || feedback.note || prediction.mismatchReason || ""
    };
  }

  function buildPredictionLedger(recommendations = [], feedbackItems = [], options = {}) {
    const byTitle = new Map((feedbackItems || []).map(item => [normalizeText(item.title), item]));
    return (recommendations || []).map((recommendation, index) => {
      const prediction = normalizePrediction(recommendation, {
        ...options,
        id: options.id ? `${options.id}-${index + 1}` : undefined
      });
      const feedback = byTitle.get(normalizeText(prediction.title));
      return feedback ? attachOutcome(prediction, feedback) : prediction;
    });
  }

  function ledgerSummary(ledger = []) {
    const completed = (ledger || []).filter(item => item.predictionError !== null && item.predictionError !== undefined);
    const pending = (ledger || []).length - completed.length;
    const absoluteErrors = completed.map(item => Math.abs(Number(item.predictionError || 0)));
    const averageAbsoluteError = absoluteErrors.length
      ? Math.round((absoluteErrors.reduce((sum, value) => sum + value, 0) / absoluteErrors.length) * 10) / 10
      : 0;
    const majorMisses = completed.filter(item => item.outcome === "major_miss").length;
    const accurate = completed.filter(item => item.outcome === "accurate").length;

    return {
      total: (ledger || []).length,
      completed: completed.length,
      pending,
      averageAbsoluteError,
      accurate,
      majorMisses,
      calibration: completed.length < 3 ? "Needs more feedback" : averageAbsoluteError <= 15 ? "Well calibrated" : averageAbsoluteError <= 25 ? "Needs tuning" : "Poorly calibrated"
    };
  }

  function signalPredictionErrors(ledger = []) {
    const signals = new Map();
    for (const item of ledger || []) {
      if (item.predictionError === null || item.predictionError === undefined) continue;
      for (const signal of [...(item.reasons || []), ...(item.risks || [])].map(reason => reason.signal || reason.label || reason).map(normalizeText).filter(Boolean)) {
        const existing = signals.get(signal) || { signal, count: 0, totalError: 0, examples: [] };
        existing.count += 1;
        existing.totalError += Number(item.predictionError || 0);
        existing.examples.push({ title: item.title, error: item.predictionError, reason: item.mismatchReason });
        signals.set(signal, existing);
      }
    }

    return [...signals.values()].map(signal => ({
      ...signal,
      averageError: Math.round((signal.totalError / signal.count) * 10) / 10,
      averageAbsoluteError: Math.round((signal.examples.reduce((sum, item) => sum + Math.abs(item.error), 0) / signal.count) * 10) / 10
    })).sort((a, b) => b.averageAbsoluteError - a.averageAbsoluteError || a.signal.localeCompare(b.signal));
  }

  function predictionLedgerInsights(ledger = []) {
    const summary = ledgerSummary(ledger);
    const signalErrors = signalPredictionErrors(ledger);
    const cards = [];

    if (summary.pending) {
      cards.push({
        type: "pending_feedback",
        title: "Feedback needed",
        priority: "High",
        text: `${summary.pending} recommendation${summary.pending === 1 ? "" : "s"} still need actual reaction feedback.`
      });
    }

    const majorSignals = signalErrors.filter(signal => signal.averageAbsoluteError > 25).slice(0, 3);
    if (majorSignals.length) {
      cards.push({
        type: "calibration_gap",
        title: "Calibration gap",
        priority: "High",
        text: `Signals like ${majorSignals.map(item => item.signal.replaceAll("_", " ")).join(", ")} are causing larger prediction errors.`,
        signals: majorSignals.map(item => item.signal)
      });
    }

    if (summary.completed >= 3 && summary.averageAbsoluteError <= 15) {
      cards.push({
        type: "well_calibrated",
        title: "Reliable predictions",
        priority: "Low",
        text: `Average prediction error is ${summary.averageAbsoluteError} points across ${summary.completed} completed predictions.`
      });
    }

    if (!cards.length) {
      cards.push({
        type: "ledger_empty",
        title: "No prediction outcomes yet",
        priority: "Medium",
        text: "Accept or reject recommendations to start measuring prediction accuracy."
      });
    }

    return cards;
  }

  function loadLedger(storage = global.localStorage, key = DEFAULT_STORAGE_KEY) {
    try {
      const raw = storage?.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveLedger(ledger = [], storage = global.localStorage, key = DEFAULT_STORAGE_KEY) {
    storage?.setItem(key, JSON.stringify(ledger));
    return ledger;
  }

  global.OpenPCMPredictionLedger = {
    DEFAULT_STORAGE_KEY,
    normalizePrediction,
    scoreToPredictedReaction,
    reactionToActualScore,
    classifyError,
    attachOutcome,
    buildPredictionLedger,
    ledgerSummary,
    signalPredictionErrors,
    predictionLedgerInsights,
    loadLedger,
    saveLedger
  };
})(window);
