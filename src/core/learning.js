(function (global) {
  function normalizeText(value = "") {
    return String(value || "").trim().toLowerCase();
  }

  function classifyFeedback(feedback = {}) {
    const value = Number(feedback.value || 0);
    if (value > 0) return "positive";
    if (value < 0) return "negative";
    return "neutral";
  }

  function daysSince(timestampUtc, options = {}) {
    if (!timestampUtc) return 365;
    const nowMs = options.now ? new Date(options.now).getTime() : Date.now();
    const thenMs = new Date(timestampUtc).getTime();
    if (!Number.isFinite(thenMs)) return 365;
    return Math.max(0, Math.round((nowMs - thenMs) / 86400000));
  }

  function feedbackRecencyMultiplier(feedback = {}, options = {}) {
    const days = daysSince(feedback.timestamp_utc || feedback.timestampUtc || feedback.date, options);
    if (days <= 14) return 1.3;
    if (days <= 60) return 1;
    if (days <= 180) return 0.8;
    return 0.65;
  }

  const feedbackRecencyWeight = feedbackRecencyMultiplier;

  function feedbackStrength(feedback = {}) {
    const raw = Math.abs(Number(feedback.value || 0));
    const bounded = raw ? Math.min(3, raw) : 0;
    const noteMultiplier = normalizeText(feedback.reason || feedback.note || feedback.why).length ? 1.1 : 1;
    return Math.round(bounded * noteMultiplier * 100) / 100;
  }

  function feedbackWeight(feedback = {}, options = {}) {
    const classification = classifyFeedback(feedback);
    if (classification === "neutral") return 0;
    const direction = classification === "positive" ? 1 : -1;
    return Math.round(direction * feedbackStrength(feedback) * feedbackRecencyMultiplier(feedback, options) * 100) / 100;
  }

  function uniqueSignals(signals = []) {
    return [...new Set((signals || []).map(normalizeText).filter(Boolean))];
  }

  function recommendationSignals(recommendation = {}) {
    const reasons = recommendation.reasons || [];
    const explanationReasons = (recommendation.explanation?.reasons || []).map(reason => reason.signal || reason.tag || reason.label);
    const matches = recommendation.matches || [];
    return uniqueSignals([...reasons, ...explanationReasons, ...matches]);
  }

  function signalActivity(feedbackItems = [], recommendations = [], options = {}) {
    const byTitle = new Map((recommendations || []).map(rec => [normalizeText(rec.title), rec]));
    const activity = new Map();

    for (const feedback of feedbackItems || []) {
      const rec = byTitle.get(normalizeText(feedback.title || "")) || feedback.recommendation || {};
      const signals = recommendationSignals(rec);
      const weight = feedbackWeight(feedback, options);
      if (!signals.length || !weight) continue;

      for (const signal of signals) {
        const existing = activity.get(signal) || {
          signal,
          score: 0,
          positive: 0,
          negative: 0,
          latestDaysAgo: 365,
          examples: []
        };
        existing.score = Math.round((existing.score + weight) * 100) / 100;
        if (weight > 0) existing.positive += 1;
        if (weight < 0) existing.negative += 1;
        existing.latestDaysAgo = Math.min(existing.latestDaysAgo, daysSince(feedback.timestamp_utc || feedback.timestampUtc || feedback.date, options));
        existing.examples.push(feedback.title || rec.title || "Untitled");
        activity.set(signal, existing);
      }
    }

    return [...activity.values()].sort((a, b) => Math.abs(b.score) - Math.abs(a.score) || a.signal.localeCompare(b.signal));
  }

  function detectEmergingInterests(feedbackItems = [], recommendations = [], options = {}) {
    const horizonDays = Number(options.emergingDays || 30);
    return signalActivity(feedbackItems, recommendations, options)
      .filter(signal => signal.score > 0 && signal.latestDaysAgo <= horizonDays && signal.positive > signal.negative)
      .sort((a, b) => b.score - a.score || a.signal.localeCompare(b.signal));
  }

  function detectStaleSignals(feedbackItems = [], recommendations = [], options = {}) {
    const staleDays = Number(options.staleDays || 180);
    return signalActivity(feedbackItems, recommendations, options)
      .filter(signal => signal.score > 0 && signal.latestDaysAgo >= staleDays)
      .sort((a, b) => b.latestDaysAgo - a.latestDaysAgo || a.signal.localeCompare(b.signal));
  }

  function buildLearningProfile(feedbackItems = [], recommendations = [], options = {}) {
    const byTitle = new Map((recommendations || []).map(rec => [normalizeText(rec.title), rec]));
    const falsePositives = [];
    const confirmedMatches = [];
    const neutral = [];
    const signalAdjustments = new Map();
    const weightedSignalAdjustments = new Map();

    for (const feedback of feedbackItems || []) {
      const title = feedback.title || "";
      const key = normalizeText(title);
      const rec = byTitle.get(key) || feedback.recommendation || {};
      const classification = classifyFeedback(feedback);
      const reasons = recommendationSignals(rec);
      const weight = feedbackWeight(feedback, options);

      if (classification === "negative") {
        falsePositives.push({ title, reasons, feedback, weight });
        for (const reason of reasons) {
          signalAdjustments.set(reason, (signalAdjustments.get(reason) || 0) - 1);
          weightedSignalAdjustments.set(reason, Math.round(((weightedSignalAdjustments.get(reason) || 0) + weight) * 100) / 100);
        }
      } else if (classification === "positive") {
        confirmedMatches.push({ title, reasons, feedback, weight });
        for (const reason of reasons) {
          signalAdjustments.set(reason, (signalAdjustments.get(reason) || 0) + 1);
          weightedSignalAdjustments.set(reason, Math.round(((weightedSignalAdjustments.get(reason) || 0) + weight) * 100) / 100);
        }
      } else {
        neutral.push({ title, reasons, feedback, weight });
      }
    }

    const emergingInterests = detectEmergingInterests(feedbackItems, recommendations, options);
    const staleSignals = detectStaleSignals(feedbackItems, recommendations, options);

    return {
      schemaVersion: "openpcm_learning_profile_v2",
      confirmedMatches,
      falsePositives,
      neutral,
      signalAdjustments: Object.fromEntries([...signalAdjustments.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))),
      weightedSignalAdjustments: Object.fromEntries([...weightedSignalAdjustments.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))),
      emergingInterests,
      staleSignals,
      summary: {
        totalFeedback: (feedbackItems || []).length,
        confirmedMatches: confirmedMatches.length,
        falsePositives: falsePositives.length,
        neutral: neutral.length,
        emergingInterests: emergingInterests.length,
        staleSignals: staleSignals.length
      }
    };
  }

  function learningAdjustmentForSignals(signals = [], learningProfile = {}, options = {}) {
    const adjustments = options.weighted
      ? learningProfile.weightedSignalAdjustments || learningProfile.signalAdjustments || {}
      : learningProfile.signalAdjustments || {};
    const multiplier = options.weighted ? 4 : 5;
    return Math.round(signals.reduce((total, signal) => total + (adjustments[signal] || 0) * multiplier, 0));
  }

  function learningSignalDetails(recommendation = {}, learningProfile = {}) {
    const signals = recommendationSignals(recommendation);
    const adjustments = learningProfile.weightedSignalAdjustments || learningProfile.signalAdjustments || {};
    return signals
      .map((signal, index) => ({
        signal,
        adjustment: adjustments[signal] || 0,
        status: (adjustments[signal] || 0) > 0 ? "prefer" : (adjustments[signal] || 0) < 0 ? "avoid" : "neutral",
        index
      }))
      .filter(item => item.adjustment)
      .sort((a, b) => Math.abs(b.adjustment) - Math.abs(a.adjustment) || a.index - b.index)
      .map(({ index, ...item }) => item);
  }

  function learningExplanationText(adjustment = 0, signalDetails = []) {
    const labels = signalDetails.slice(0, 3).map(item => item.signal).join(", ");
    if (adjustment > 0) return `Boosted by feedback on ${labels}.`;
    if (adjustment < 0) return `Reduced by feedback on ${labels}.`;
    return "No learned feedback adjustment yet.";
  }

  function learningExplanation(recommendation = {}, learningProfile = {}, adjustment = 0) {
    const signals = recommendationSignals(recommendation);
    const contributing = learningSignalDetails(recommendation, learningProfile);

    return {
      headline: adjustment > 0
        ? "Boosted by feedback from recommendations you accepted."
        : adjustment < 0
          ? "Reduced by feedback from recommendations you rejected."
          : "No learned feedback adjustment yet.",
      signals: contributing.slice(0, 5),
      emergingInterests: (learningProfile.emergingInterests || []).filter(item => signals.includes(item.signal)).map(item => item.signal),
      staleSignals: (learningProfile.staleSignals || []).filter(item => signals.includes(item.signal)).map(item => item.signal)
    };
  }

  function applyLearningAdjustments(recommendations = [], learningProfile = {}, options = {}) {
    return (recommendations || [])
      .map(rec => {
        const signals = recommendationSignals(rec);
        const adjustment = learningAdjustmentForSignals(signals, learningProfile, options);
        const learnedScore = Math.max(0, Math.min(100, Math.round((rec.score || 0) + adjustment)));
        return {
          ...rec,
          learningAdjustment: adjustment,
          learningSignals: learningSignalDetails(rec, learningProfile),
          learningExplanation: learningExplanation(rec, learningProfile, adjustment),
          learningDetails: learningExplanation(rec, learningProfile, adjustment),
          learningExplanationText: learningExplanationText(adjustment, learningSignalDetails(rec, learningProfile)),
          score: learnedScore
        };
      })
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  }

  function learningInsightCards(profile = {}) {
    const cards = [];
    const emerging = profile.emergingInterests || [];
    const stale = profile.staleSignals || [];
    const falsePositives = profile.falsePositives || [];

    if (emerging.length) {
      cards.push({
        type: "emerging_interest",
        title: "Emerging interest",
        priority: "High",
        text: `Recent positive feedback is strengthening ${emerging.slice(0, 2).map(item => item.signal.replaceAll("_", " ")).join(", ")}.`,
        signals: emerging.slice(0, 5).map(item => item.signal)
      });
    }

    if (falsePositives.length) {
      cards.push({
        type: "false_positive",
        title: "False positive pattern",
        priority: "High",
        text: `${falsePositives.length} rejected recommendation${falsePositives.length === 1 ? "" : "s"} should reduce similar future matches.`,
        signals: [...new Set(falsePositives.flatMap(item => item.reasons || []))].slice(0, 5)
      });
    }

    if (stale.length) {
      cards.push({
        type: "stale_signal",
        title: "Stale preference",
        priority: "Medium",
        text: `Older positive signals like ${stale.slice(0, 2).map(item => item.signal.replaceAll("_", " ")).join(", ")} may need fresh evidence.`,
        signals: stale.slice(0, 5).map(item => item.signal)
      });
    }

    if (!cards.length) {
      cards.push({
        type: "needs_feedback",
        title: "Needs feedback",
        priority: "Medium",
        text: "Rate a few recommendations to teach OpenPCM what actually worked.",
        signals: []
      });
    }

    return cards;
  }

  function learningSummaryText(profile = {}) {
    const s = profile.summary || {};
    const suffix = s.emergingInterests || s.staleSignals
      ? ` · ${s.emergingInterests || 0} emerging · ${s.staleSignals || 0} stale`
      : "";
    return `${s.totalFeedback || 0} feedback items · ${s.confirmedMatches || 0} confirmed · ${s.falsePositives || 0} false positives${suffix}`;
  }

  global.OpenPCMLearning = {
    classifyFeedback,
    daysSince,
    feedbackRecencyMultiplier,
    feedbackRecencyWeight,
    feedbackStrength,
    feedbackWeight,
    recommendationSignals,
    signalActivity,
    detectEmergingInterests,
    detectStaleSignals,
    buildLearningProfile,
    learningAdjustmentForSignals,
    learningSignalDetails,
    learningExplanationText,
    learningExplanation,
    applyLearningAdjustments,
    learningInsightCards,
    learningSummaryText
  };
})(window);
