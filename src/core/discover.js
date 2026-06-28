(function (global) {
  const DEFAULT_WEIGHTS = {
    loved: 4,
    liked: 2,
    mixed: 0,
    bounced: -3,
    disliked: -4
  };

  function normalizeText(value = "") {
    return String(value || "").trim().toLowerCase();
  }

  function normalizeTags(tags = []) {
    return Array.isArray(tags)
      ? tags.map(normalizeText).filter(Boolean)
      : [];
  }

  function reactionWeight(reaction = "") {
    return DEFAULT_WEIGHTS[normalizeText(reaction)] ?? 0;
  }

  function buildPreferenceProfile(evidence = []) {
    const tags = new Map();
    const media = new Map();
    const positiveEvidence = [];

    for (const entry of evidence || []) {
      const weight = reactionWeight(entry.reaction);
      const entryTags = normalizeTags(entry.tags);
      const medium = normalizeText(entry.medium);

      if (weight > 0) positiveEvidence.push(entry);

      for (const tag of entryTags) {
        tags.set(tag, (tags.get(tag) || 0) + weight);
      }

      if (medium) {
        media.set(medium, (media.get(medium) || 0) + Math.max(-2, Math.min(3, weight)));
      }
    }

    return {
      tags: Object.fromEntries([...tags.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))),
      media: Object.fromEntries([...media.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))),
      positiveEvidenceCount: positiveEvidence.length
    };
  }

  function candidateTitle(candidate = {}) {
    return candidate.title || candidate.name || "Untitled";
  }

  function candidateTags(candidate = {}) {
    return normalizeTags(candidate.tags || candidate.reasons || candidate.features || []);
  }

  function alreadyInEvidence(candidate = {}, evidence = []) {
    const title = normalizeText(candidateTitle(candidate));
    if (!title) return false;
    return (evidence || []).some(entry => normalizeText(entry.title) === title);
  }

  function reasonLabel(reason = {}) {
    return String(reason.tag || "")
      .replaceAll("_", " ")
      .replace(/\b\w/g, letter => letter.toUpperCase());
  }

  function sourceLabel(source = "") {
    const value = String(source || "");
    if (value.startsWith("pcm:recommendations.current.tv")) return "Personal Cognitive Model: current TV recommendations";
    if (value.startsWith("pcm:recommendations.current.books_low_load")) return "Personal Cognitive Model: low-load book recommendations";
    if (value.startsWith("pcm:recommendations.current.games_ps5")) return "Personal Cognitive Model: PS5 game recommendations";
    if (value.startsWith("pcm:media.movies.recommended_unwatched_or_unknown")) return "Personal Cognitive Model: movie recommendation list";
    if (value.startsWith("pcm:media.television.comfort_rewatches")) return "Personal Cognitive Model: comfort rewatches";
    if (value.startsWith("profile")) return "Personal Cognitive Model profile";
    return value || "OpenPCM evidence";
  }

  function buildExplanation(candidate = {}, scored = {}, options = {}) {
    const reasons = (scored.matchedReasons || []).slice(0, 5).map(reason => ({
      label: reasonLabel(reason),
      signal: reason.tag,
      weight: reason.weight,
      detail: reason.type === "medium"
        ? "Preferred medium based on saved evidence."
        : "Matches a positive preference signal."
    }));

    const risks = (scored.risks || []).slice(0, 4).map(risk => ({
      label: reasonLabel(risk),
      signal: risk.tag,
      weight: risk.weight,
      detail: risk.reason || "Potential mismatch based on prior evidence."
    }));

    const sources = [
      sourceLabel(candidate.source),
      options.profileSource ? "Personal Cognitive Model profile seed" : "",
      options.feedback ? "Recommendation feedback calibration" : ""
    ].filter(Boolean);

    return {
      headline: reasons.length
        ? `Recommended because it matches ${reasons.slice(0, 3).map(reason => reason.label).join(", ")}.`
        : "Recommended from available catalogue evidence.",
      reasons,
      risks,
      sources: [...new Set(sources)],
      confidence: reasons.length >= 3 ? "High" : reasons.length >= 1 ? "Medium" : "Low"
    };
  }

  function scoreCandidate(candidate = {}, evidence = [], options = {}) {
    const profile = options.profile || buildPreferenceProfile(evidence);
    const tags = candidateTags(candidate);
    const medium = normalizeText(candidate.medium || candidate.type);
    const matchedReasons = [];
    const risks = [];

    let score = 0;

    for (const tag of tags) {
      const weight = profile.tags[tag] || 0;
      if (weight > 0) {
        score += weight * 10;
        matchedReasons.push({ tag, weight });
      } else if (weight < 0) {
        score += weight * 6;
        risks.push({ tag, weight, reason: "Previously negative evidence for this signal." });
      }
    }

    if (medium && profile.media[medium] > 0) {
      score += profile.media[medium] * 4;
      matchedReasons.push({ tag: medium, weight: profile.media[medium], type: "medium" });
    }

    if (alreadyInEvidence(candidate, evidence)) {
      score -= 100;
      risks.push({ tag: "already captured", weight: -10, reason: "Already exists in evidence." });
    }

    const normalizedScore = Math.max(0, Math.min(100, Math.round(score)));

    return {
      score: normalizedScore,
      matchedReasons: matchedReasons.sort((a, b) => b.weight - a.weight || a.tag.localeCompare(b.tag)),
      risks: risks.sort((a, b) => a.weight - b.weight || a.tag.localeCompare(b.tag))
    };
  }

  function buildRecommendation(candidate = {}, evidence = [], options = {}) {
    const scored = scoreCandidate(candidate, evidence, options);
    const explanation = buildExplanation(candidate, scored, options);
    return {
      title: candidateTitle(candidate),
      medium: candidate.medium || candidate.type || "Other",
      score: scored.score,
      reasons: scored.matchedReasons.map(reason => reason.tag),
      risks: scored.risks.map(risk => risk.tag),
      explanation,
      note: candidate.note || candidate.description || "",
      source: candidate.source || "",
      candidate
    };
  }

  function rankCandidates(candidates = [], evidence = [], options = {}) {
    const profile = options.profile || buildPreferenceProfile(evidence);
    return (candidates || [])
      .map(candidate => buildRecommendation(candidate, evidence, { ...options, profile }))
      .filter(recommendation => recommendation.score > 0)
      .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title));
  }

  function buildDiscoverSummary(evidence = [], candidates = [], options = {}) {
    const profileSource = options.profileSource || null;
    const profileEvidence = profileSource && global.OpenPCMProfile
      ? global.OpenPCMProfile.buildEvidenceFromProfile(profileSource)
      : [];
    const combinedEvidence = [...profileEvidence, ...(evidence || [])];
    const candidateSource = candidates && candidates.length
      ? candidates
      : (profileSource && global.OpenPCMProfile ? global.OpenPCMProfile.buildCandidateCatalogue(profileSource) : []);

    const preferenceModel = global.OpenPCMPreferences
      ? global.OpenPCMPreferences.buildPreferenceModel(profileSource || {}, evidence || [])
      : null;
    const profile = buildPreferenceProfile(combinedEvidence);
    const ranked = global.OpenPCMReasoning && preferenceModel
      ? global.OpenPCMReasoning.reasonAboutCatalogue(candidateSource, preferenceModel, options)
          .map(item => global.OpenPCMReasoning.buildRecommendationFromReasoning(item))
      : rankCandidates(candidateSource, combinedEvidence, { ...options, profile });
    const calibrated = global.OpenPCMCalibration && options.feedback
      ? global.OpenPCMCalibration.applyFeedback(ranked, options.feedback)
      : ranked;
    const learningProfile = global.OpenPCMLearning && options.feedback
      ? global.OpenPCMLearning.buildLearningProfile(options.feedback, calibrated)
      : null;
    const learned = global.OpenPCMLearning && learningProfile
      ? global.OpenPCMLearning.applyLearningAdjustments(calibrated, learningProfile)
      : calibrated;
    const experiment = options.experiment || (global.OpenPCMExperiments ? global.OpenPCMExperiments.defineExperiment({
      id: "discover-ranking-v1",
      name: "Discover Ranking V1",
      variants: [
        { id: "baseline", name: "Baseline", strategy: "baseline" },
        { id: "confidence", name: "Confidence weighted", strategy: "confidence-weighted" },
        { id: "source-rich", name: "Source rich", strategy: "source-rich" }
      ]
    }) : null);
    const experimentResult = global.OpenPCMExperiments && experiment
      ? global.OpenPCMExperiments.runExperiment(experiment, learned, String((evidence || []).length))
      : null;
    const recommendations = experimentResult ? experimentResult.recommendations : learned;
    const topTags = preferenceModel
      ? global.OpenPCMPreferences.topPreferenceTags(preferenceModel, 5)
      : Object.entries(profile.tags)
        .filter(([, value]) => value > 0)
        .slice(0, 5)
        .map(([tag]) => tag);

    return {
      profile,
      preferenceModel,
      profileSourceSummary: profileSource && global.OpenPCMProfile ? global.OpenPCMProfile.profileSummary(profileSource) : null,
      topTags,
      learningProfile,
      experimentResult,
      recommendations
    };
  }

  global.OpenPCMDiscover = {
    buildPreferenceProfile,
    scoreCandidate,
    buildRecommendation,
    buildExplanation,
    sourceLabel,
    rankCandidates,
    buildDiscoverSummary,
    alreadyInEvidence
  };
})(window);
