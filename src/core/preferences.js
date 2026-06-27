(function (global) {
  function normalizeText(value = "") {
    return String(value || "").trim().toLowerCase();
  }

  function mergeSignal(map, key, amount, source = "unknown") {
    const signalKey = normalizeText(key);
    if (!signalKey) return;

    const existing = map.get(signalKey) || {
      key: signalKey,
      label: signalKey.replaceAll("_", " ").replace(/\b\w/g, letter => letter.toUpperCase()),
      weight: 0,
      sources: []
    };

    existing.weight += Number(amount || 0);
    existing.sources = [...new Set([...existing.sources, source])];
    map.set(signalKey, existing);
  }

  function profileSignals(profileSource = {}) {
    const signals = new Map();

    if (global.OpenPCMProfile) {
      for (const signal of global.OpenPCMProfile.positiveFeatureSignals(profileSource, 20)) {
        mergeSignal(signals, signal.tag, signal.weight + signal.confidence, "pcm:profile.positive");
      }

      for (const signal of global.OpenPCMProfile.negativeFeatureSignals(profileSource, 20)) {
        mergeSignal(signals, signal.tag, signal.weight, "pcm:profile.negative");
      }
    }

    return signals;
  }

  function evidenceSignals(evidence = []) {
    const signals = new Map();
    const recent = new Map();

    for (const entry of evidence || []) {
      const reaction = normalizeText(entry.reaction);
      const weight = reaction === "loved" ? 4
        : reaction === "liked" ? 2
        : reaction === "bounced" ? -3
        : reaction === "disliked" ? -4
        : 0;

      for (const tag of Array.isArray(entry.tags) ? entry.tags : []) {
        mergeSignal(signals, tag, weight, "openpcm:evidence");
        mergeSignal(recent, tag, weight, "openpcm:recent");
      }

      if (entry.medium) {
        mergeSignal(signals, entry.medium, Math.max(-2, Math.min(3, weight)), "openpcm:medium");
      }
    }

    return { signals, recent };
  }

  function sortSignals(signals) {
    return [...signals.values()].sort((a, b) => b.weight - a.weight || a.key.localeCompare(b.key));
  }

  function buildPreferenceModel(profileSource = {}, evidence = []) {
    const longTerm = profileSignals(profileSource);
    const fromEvidence = evidenceSignals(evidence);

    const combined = new Map();

    for (const signal of longTerm.values()) {
      mergeSignal(combined, signal.key, signal.weight, signal.sources.join(","));
    }

    for (const signal of fromEvidence.signals.values()) {
      mergeSignal(combined, signal.key, signal.weight * 3, signal.sources.join(","));
    }

    const positive = sortSignals(combined).filter(signal => signal.weight > 0);
    const negative = sortSignals(combined).filter(signal => signal.weight < 0);
    const recent = sortSignals(fromEvidence.recent).filter(signal => signal.weight !== 0);

    const conflicts = positive
      .filter(pos => negative.some(neg => neg.key === pos.key))
      .map(pos => pos.key);

    return {
      schemaVersion: "openpcm_preference_model_v1",
      positive,
      negative,
      recent,
      conflicts,
      summary: {
        positiveCount: positive.length,
        negativeCount: negative.length,
        recentCount: recent.length,
        conflictCount: conflicts.length
      }
    };
  }

  function topPreferenceTags(model = {}, limit = 8) {
    return (model.positive || [])
      .slice(0, limit)
      .map(signal => signal.key);
  }

  function signalWeight(model = {}, key = "") {
    const signalKey = normalizeText(key);
    const found = [...(model.positive || []), ...(model.negative || [])].find(signal => signal.key === signalKey);
    return found ? found.weight : 0;
  }

  global.OpenPCMPreferences = {
    normalizeText,
    mergeSignal,
    buildPreferenceModel,
    topPreferenceTags,
    signalWeight
  };
})(window);
