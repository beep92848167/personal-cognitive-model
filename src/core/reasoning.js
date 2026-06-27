(function (global) {
  function normalizeText(value = "") {
    return String(value || "").trim().toLowerCase();
  }

  function label(value = "") {
    return String(value || "")
      .replaceAll("_", " ")
      .replace(/\b\w/g, letter => letter.toUpperCase());
  }

  function candidateSignals(candidate = {}) {
    return [
      ...(Array.isArray(candidate.tags) ? candidate.tags : []),
      candidate.medium,
      candidate.catalogueStatus
    ].filter(Boolean).map(normalizeText);
  }

  function evaluateCandidate(candidate = {}, preferenceModel = {}, options = {}) {
    const signals = candidateSignals(candidate);
    const positive = [];
    const conflicts = [];
    let rawScore = 0;

    for (const signal of signals) {
      const weight = global.OpenPCMPreferences
        ? global.OpenPCMPreferences.signalWeight(preferenceModel, signal)
        : 0;

      if (weight > 0) {
        positive.push({
          signal,
          label: label(signal),
          weight,
          source: "preference-model"
        });
        rawScore += weight;
      } else if (weight < 0) {
        conflicts.push({
          signal,
          label: label(signal),
          weight,
          source: "preference-model"
        });
        rawScore += weight;
      }
    }

    if (candidate.catalogueStatus === "recommended") rawScore += 8;
    if (candidate.catalogueStatus === "known-positive") rawScore += 4;
    if (candidate.catalogueStatus === "known-negative") rawScore -= 100;

    const score = Math.max(0, Math.min(100, Math.round(rawScore)));
    const uncertainty = positive.length === 0 ? "high" : positive.length < 3 ? "medium" : "low";
    const confidence = conflicts.length ? "Medium" : positive.length >= 3 ? "High" : positive.length ? "Medium" : "Low";

    return {
      title: candidate.title || "",
      score,
      confidence,
      uncertainty,
      supportingEvidence: positive.sort((a, b) => b.weight - a.weight || a.signal.localeCompare(b.signal)),
      conflictingEvidence: conflicts.sort((a, b) => a.weight - b.weight || a.signal.localeCompare(b.signal)),
      sources: candidate.sources || (candidate.source ? [candidate.source] : []),
      explanationTree: {
        candidate: candidate.title || "",
        matchedSignals: positive.map(item => item.signal),
        conflictingSignals: conflicts.map(item => item.signal),
        sourceCount: (candidate.sources || []).length || (candidate.source ? 1 : 0)
      }
    };
  }

  function reasonAboutCatalogue(candidates = [], preferenceModel = {}, options = {}) {
    return (candidates || [])
      .map(candidate => ({
        candidate,
        reasoning: evaluateCandidate(candidate, preferenceModel, options)
      }))
      .filter(item => item.reasoning.score > 0)
      .sort((a, b) => b.reasoning.score - a.reasoning.score || (a.candidate.title || "").localeCompare(b.candidate.title || ""));
  }

  function buildRecommendationFromReasoning(item = {}) {
    const candidate = item.candidate || {};
    const reasoning = item.reasoning || {};
    const recommendation = {
      title: candidate.title || reasoning.title || "Untitled",
      medium: candidate.medium || "Other",
      score: reasoning.score || 0,
      reasons: (reasoning.supportingEvidence || []).map(item => item.signal),
      risks: (reasoning.conflictingEvidence || []).map(item => item.signal),
      source: candidate.source || "",
      sources: reasoning.sources || [],
      note: candidate.note || "",
      candidate,
      reasoning,
      explanation: {
        headline: (reasoning.supportingEvidence || []).length
          ? `Recommended because it matches ${(reasoning.supportingEvidence || []).slice(0, 3).map(item => item.label).join(", ")}.`
          : "Recommended from catalogue evidence.",
        reasons: reasoning.supportingEvidence || [],
        risks: reasoning.conflictingEvidence || [],
        confidence: reasoning.confidence || "Low",
        sources: reasoning.sources || []
      }
    };

    recommendation.explanationGraph = global.OpenPCMExplanationGraph
      ? global.OpenPCMExplanationGraph.buildExplanationGraph(recommendation)
      : null;

    return recommendation;
  }

  global.OpenPCMReasoning = {
    candidateSignals,
    evaluateCandidate,
    reasonAboutCatalogue,
    buildRecommendationFromReasoning
  };
})(window);
