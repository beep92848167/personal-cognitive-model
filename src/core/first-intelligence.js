(function (global) {
  const REACTION_WEIGHTS = {
    loved: 5,
    liked: 3,
    mixed: 1,
    "not sure yet": 0,
    bounced: -4,
    disliked: -5
  };

  function normalizeText(value = "") {
    return String(value || "").trim().toLowerCase();
  }

  function normalizeTags(tags = []) {
    return Array.isArray(tags) ? tags.map(normalizeText).filter(Boolean) : [];
  }

  function reactionWeight(reaction = "") {
    return REACTION_WEIGHTS[normalizeText(reaction)] ?? 0;
  }

  function daysSince(timestampUtc, options = {}) {
    if (!timestampUtc) return 365;
    const nowMs = options.now ? new Date(options.now).getTime() : Date.now();
    const thenMs = new Date(timestampUtc).getTime();
    if (!Number.isFinite(thenMs)) return 365;
    return Math.max(0, Math.round((nowMs - thenMs) / 86400000));
  }

  function recencyMultiplier(timestampUtc, options = {}) {
    const days = daysSince(timestampUtc, options);
    if (days <= 7) return 1.25;
    if (days <= 30) return 1.1;
    if (days <= 120) return 1;
    return 0.75;
  }

  function entryEvidenceWeight(entry = {}, options = {}) {
    const base = reactionWeight(entry.reaction);
    const explicitness = normalizeText(entry.note).length || normalizeTags(entry.tags).length ? 1.1 : 1;
    return Math.round(base * recencyMultiplier(entry.timestamp_utc, options) * explicitness * 10) / 10;
  }

  function buildWeightedSignals(evidence = [], options = {}) {
    const signals = new Map();
    const media = new Map();

    for (const entry of evidence || []) {
      const weight = entryEvidenceWeight(entry, options);
      const source = {
        title: entry.title || "Untitled",
        reaction: entry.reaction || "Not sure yet",
        weight
      };

      for (const tag of normalizeTags(entry.tags)) {
        const existing = signals.get(tag) || { signal: tag, weight: 0, evidence: [] };
        existing.weight = Math.round((existing.weight + weight) * 10) / 10;
        existing.evidence.push(source);
        signals.set(tag, existing);
      }

      const medium = normalizeText(entry.medium);
      if (medium) {
        const existing = media.get(medium) || { signal: medium, weight: 0, evidence: [] };
        existing.weight = Math.round((existing.weight + Math.max(-3, Math.min(3, weight))) * 10) / 10;
        existing.evidence.push(source);
        media.set(medium, existing);
      }
    }

    const sort = items => [...items.values()].sort((a, b) => b.weight - a.weight || a.signal.localeCompare(b.signal));
    return {
      tags: sort(signals),
      media: sort(media),
      summary: {
        evidenceCount: (evidence || []).length,
        positiveSignalCount: sort(signals).filter(signal => signal.weight > 0).length,
        negativeSignalCount: sort(signals).filter(signal => signal.weight < 0).length
      }
    };
  }

  function candidateTags(candidate = {}) {
    return normalizeTags(candidate.tags || candidate.reasons || candidate.features || []);
  }

  function candidateMedium(candidate = {}) {
    return normalizeText(candidate.medium || candidate.type);
  }

  function scoreCandidate(candidate = {}, weighted = buildWeightedSignals([])) {
    const tagMap = new Map((weighted.tags || []).map(signal => [signal.signal, signal]));
    const mediumMap = new Map((weighted.media || []).map(signal => [signal.signal, signal]));
    const matches = [];
    const risks = [];
    let raw = 0;

    for (const tag of candidateTags(candidate)) {
      const signal = tagMap.get(tag);
      if (!signal) continue;
      raw += signal.weight * 8;
      (signal.weight >= 0 ? matches : risks).push({ ...signal, type: "tag" });
    }

    const medium = candidateMedium(candidate);
    const mediumSignal = mediumMap.get(medium);
    if (mediumSignal) {
      raw += mediumSignal.weight * 3;
      (mediumSignal.weight >= 0 ? matches : risks).push({ ...mediumSignal, type: "medium" });
    }

    const positiveEvidence = matches.reduce((sum, signal) => sum + Math.max(0, signal.evidence.length), 0);
    const riskCount = risks.length;
    const score = Math.max(0, Math.min(100, Math.round(raw)));
    const confidencePercent = Math.max(5, Math.min(95, Math.round((positiveEvidence * 18) + (matches.length * 12) - (riskCount * 20))));
    const confidence = confidencePercent >= 70 ? "High" : confidencePercent >= 40 ? "Medium" : "Low";

    return {
      title: candidate.title || candidate.name || "Untitled",
      score,
      confidence,
      confidencePercent,
      matches: matches.sort((a, b) => b.weight - a.weight || a.signal.localeCompare(b.signal)),
      risks: risks.sort((a, b) => a.weight - b.weight || a.signal.localeCompare(b.signal))
    };
  }

  function explainScore(scored = {}) {
    const topMatches = (scored.matches || []).slice(0, 3).map(signal => signal.signal.replaceAll("_", " "));
    const topRisks = (scored.risks || []).slice(0, 2).map(signal => signal.signal.replaceAll("_", " "));
    return {
      headline: topMatches.length
        ? `Matches your evidence for ${topMatches.join(", ")}.`
        : "Not enough matching evidence yet.",
      evidence: (scored.matches || []).slice(0, 5).map(signal => ({
        signal: signal.signal,
        type: signal.type,
        weight: signal.weight,
        examples: signal.evidence.slice(0, 3).map(item => item.title)
      })),
      risks: (scored.risks || []).slice(0, 4).map(signal => ({
        signal: signal.signal,
        type: signal.type,
        weight: signal.weight,
        examples: signal.evidence.slice(0, 3).map(item => item.title)
      })),
      summary: topRisks.length ? `Watch for possible mismatch: ${topRisks.join(", ")}.` : "No major negative evidence matched."
    };
  }

  function rankRecommendations(candidates = [], evidence = [], options = {}) {
    const weighted = options.weighted || buildWeightedSignals(evidence, options);
    return (candidates || [])
      .map(candidate => {
        const scored = scoreCandidate(candidate, weighted);
        return {
          title: scored.title,
          medium: candidate.medium || candidate.type || "Other",
          score: scored.score,
          confidence: scored.confidence,
          confidencePercent: scored.confidencePercent,
          explanation: explainScore(scored),
          matches: scored.matches.map(signal => signal.signal),
          risks: scored.risks.map(signal => signal.signal),
          candidate
        };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score || b.confidencePercent - a.confidencePercent || a.title.localeCompare(b.title));
  }

  global.OpenPCMFirstIntelligence = {
    normalizeText,
    reactionWeight,
    recencyMultiplier,
    entryEvidenceWeight,
    buildWeightedSignals,
    scoreCandidate,
    explainScore,
    rankRecommendations
  };
})(window);
