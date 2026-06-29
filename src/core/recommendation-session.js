(function (global) {
  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function normalizeText(value = "") {
    return String(value || "").trim().toLowerCase();
  }

  function currentStateFromEvidence(evidence = []) {
    const sorted = [...(evidence || [])]
      .filter(item => item.cognitive_state || item.cognitiveState || item.time_of_day_mode || item.timeOfDayMode)
      .sort((a, b) => String(b.timestamp_utc || b.updated_at || "").localeCompare(String(a.timestamp_utc || a.updated_at || "")));
    const latest = sorted[0] || {};
    return latest.cognitive_state || latest.cognitiveState || latest.time_of_day_mode || latest.timeOfDayMode || "Medium capacity";
  }

  function mergeInsightCards(...groups) {
    const priorityRank = { High: 3, Medium: 2, Low: 1 };
    return groups
      .flat()
      .filter(Boolean)
      .map((card, index) => ({ ...card, index }))
      .sort((a, b) => (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0) || a.index - b.index)
      .map(({ index, ...card }) => card);
  }

  function decisionLabel(recommendation = {}) {
    const score = Number(recommendation.adjustedScore ?? recommendation.score ?? 0);
    const confidence = Number(recommendation.confidencePercent || 0);
    const fitLabel = recommendation.cognitiveFit?.label || "";
    const hasRisk = (recommendation.risks || []).length > 0;

    if (fitLabel === "Save for later") return "save_for_later";
    if (score >= 80 && confidence >= 60 && !hasRisk) return "try_now";
    if (score >= 65) return "consider";
    return "skip_for_now";
  }

  function decisionReason(recommendation = {}) {
    const label = decisionLabel(recommendation);
    if (label === "save_for_later") return recommendation.cognitiveFit?.explanation || "Good taste match, but not right for current capacity.";
    if (label === "try_now") return "Strong match with enough confidence to try now.";
    if (label === "consider") return "Potential match, but collect more evidence or check the risks first.";
    return "Weak match or insufficient confidence right now.";
  }

  function addDecisionActions(recommendations = []) {
    return (recommendations || []).map((recommendation, index) => {
      const decision = decisionLabel(recommendation);
      return {
        ...recommendation,
        rank: index + 1,
        decision,
        decisionReason: decisionReason(recommendation),
        nextActions: actionsForDecision(decision)
      };
    });
  }

  function actionsForDecision(decision = "consider") {
    if (decision === "try_now") return ["start", "record_reaction", "add_to_ledger"];
    if (decision === "save_for_later") return ["save_for_later", "revisit_high_capacity", "add_to_ledger"];
    if (decision === "skip_for_now") return ["dismiss", "record_reason"];
    return ["inspect_details", "save_or_dismiss", "record_reaction"];
  }

  function sessionSummary(recommendations = [], context = {}) {
    const counts = recommendations.reduce((acc, item) => {
      acc[item.decision] = (acc[item.decision] || 0) + 1;
      return acc;
    }, {});
    const top = recommendations[0];
    return {
      total: recommendations.length,
      tryNow: counts.try_now || 0,
      consider: counts.consider || 0,
      saveForLater: counts.save_for_later || 0,
      skipForNow: counts.skip_for_now || 0,
      cognitiveState: context.cognitiveState || "Medium capacity",
      topTitle: top?.title || null,
      headline: top
        ? `${top.title} is the best current recommendation (${top.decision.replaceAll("_", " ")}).`
        : "No recommendations are ready yet."
    };
  }

  function buildRecommendationSession(input = {}, options = {}) {
    const evidence = input.evidence || [];
    const candidates = input.candidates || [];
    const feedback = input.feedback || [];
    const priorRecommendations = input.priorRecommendations || [];
    const cognitiveState = input.cognitiveState || currentStateFromEvidence(evidence);

    const ranked = global.OpenPCMFirstIntelligence.rankRecommendations(candidates, evidence, options);
    const learningProfile = global.OpenPCMLearning.buildLearningProfile(feedback, priorRecommendations.length ? priorRecommendations : ranked, options);
    const learned = global.OpenPCMLearning.applyLearningAdjustments(ranked, learningProfile, { weighted: true });
    const fitted = global.OpenPCMCognitiveFit.applyCognitiveFit(learned, cognitiveState, { replaceScore: false });
    const recommendations = addDecisionActions(fitted)
      .map(item => ({
        ...item,
        finalScore: clamp(Math.round(item.adjustedScore ?? item.score ?? 0), 0, 100)
      }))
      .sort((a, b) => b.finalScore - a.finalScore || b.confidencePercent - a.confidencePercent || a.title.localeCompare(b.title))
      .map((item, index) => ({ ...item, rank: index + 1 }));

    const ledger = global.OpenPCMPredictionLedger.buildPredictionLedger(recommendations, input.outcomes || [], { id: options.sessionId || "session" });
    const insights = mergeInsightCards(
      global.OpenPCMLearning.learningInsightCards(learningProfile),
      global.OpenPCMCognitiveFit.cognitiveFitInsights(recommendations, cognitiveState),
      global.OpenPCMPredictionLedger.predictionLedgerInsights(ledger)
    );

    return {
      schemaVersion: "openpcm_recommendation_session_v1",
      generatedAt: options.now || new Date().toISOString(),
      context: {
        cognitiveState,
        evidenceCount: evidence.length,
        candidateCount: candidates.length,
        feedbackCount: feedback.length
      },
      summary: sessionSummary(recommendations, { cognitiveState }),
      recommendations,
      learningProfile,
      ledger,
      insights
    };
  }

  function sessionInsightText(session = {}) {
    const summary = session.summary || {};
    const parts = [
      `${summary.total || 0} ranked`,
      `${summary.tryNow || 0} try now`,
      `${summary.saveForLater || 0} save for later`
    ];
    return `${summary.headline || "No recommendation session available."} ${parts.join(" · ")}.`;
  }

  global.OpenPCMRecommendationSession = {
    currentStateFromEvidence,
    decisionLabel,
    decisionReason,
    actionsForDecision,
    addDecisionActions,
    mergeInsightCards,
    sessionSummary,
    buildRecommendationSession,
    sessionInsightText
  };
})(window);
