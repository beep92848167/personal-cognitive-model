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

  function buildLearningProfile(feedbackItems = [], recommendations = []) {
    const byTitle = new Map((recommendations || []).map(rec => [normalizeText(rec.title), rec]));
    const falsePositives = [];
    const confirmedMatches = [];
    const neutral = [];
    const signalAdjustments = new Map();

    for (const feedback of feedbackItems || []) {
      const title = feedback.title || "";
      const key = normalizeText(title);
      const rec = byTitle.get(key) || {};
      const classification = classifyFeedback(feedback);
      const reasons = rec.reasons || rec.explanation?.reasons?.map(reason => reason.signal) || [];

      if (classification === "negative") {
        falsePositives.push({ title, reasons, feedback });
        for (const reason of reasons) {
          signalAdjustments.set(reason, (signalAdjustments.get(reason) || 0) - 1);
        }
      } else if (classification === "positive") {
        confirmedMatches.push({ title, reasons, feedback });
        for (const reason of reasons) {
          signalAdjustments.set(reason, (signalAdjustments.get(reason) || 0) + 1);
        }
      } else {
        neutral.push({ title, reasons, feedback });
      }
    }

    return {
      schemaVersion: "openpcm_learning_profile_v1",
      confirmedMatches,
      falsePositives,
      neutral,
      signalAdjustments: Object.fromEntries([...signalAdjustments.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))),
      summary: {
        totalFeedback: (feedbackItems || []).length,
        confirmedMatches: confirmedMatches.length,
        falsePositives: falsePositives.length,
        neutral: neutral.length
      }
    };
  }

  function applyLearningAdjustments(recommendations = [], learningProfile = {}) {
    const adjustments = learningProfile.signalAdjustments || {};
    return (recommendations || [])
      .map(rec => {
        const signals = rec.reasons || rec.explanation?.reasons?.map(reason => reason.signal) || [];
        const adjustment = signals.reduce((total, signal) => total + (adjustments[signal] || 0) * 5, 0);
        return {
          ...rec,
          learningAdjustment: adjustment,
          score: Math.max(0, Math.min(100, Math.round((rec.score || 0) + adjustment)))
        };
      })
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  }

  function learningSummaryText(profile = {}) {
    const s = profile.summary || {};
    return `${s.totalFeedback || 0} feedback items · ${s.confirmedMatches || 0} confirmed · ${s.falsePositives || 0} false positives`;
  }

  global.OpenPCMLearning = {
    classifyFeedback,
    buildLearningProfile,
    applyLearningAdjustments,
    learningSummaryText
  };
})(window);
