(function (global) {
  const STATE_PROFILES = {
    high: {
      id: "high",
      label: "High capacity",
      capacity: 3,
      preferred: ["complex", "geopolitics", "strategy", "worldbuilding", "subtitles", "mandarin"],
      avoid: [],
      note: "Good time for dense, high-engagement recommendations."
    },
    medium: {
      id: "medium",
      label: "Medium capacity",
      capacity: 2,
      preferred: ["familiar", "episodic", "action", "clear stakes"],
      avoid: ["very complex", "high cognitive load"],
      note: "Prefer engaging but not punishing choices."
    },
    low: {
      id: "low",
      label: "Low capacity",
      capacity: 1,
      preferred: ["comfort", "familiar", "kids", "comedy", "short"],
      avoid: ["complex", "subtitles", "heavy", "brutal", "dense", "high cognitive load"],
      note: "Prefer low-friction, familiar, easy-start options."
    },
    flare: {
      id: "flare",
      label: "Symptom flare / recovery",
      capacity: 0,
      preferred: ["comfort", "familiar", "kids", "gentle", "short"],
      avoid: ["complex", "subtitles", "horror", "brutal", "stressful", "heavy", "high cognitive load"],
      note: "Protect capacity; recommend safe, low-load options first."
    }
  };

  const LOAD_SIGNALS = {
    "complex": 3,
    "very complex": 3,
    "geopolitics": 3,
    "politics": 3,
    "strategy": 2,
    "worldbuilding": 3,
    "dense": 3,
    "subtitles": 2,
    "mandarin": 2,
    "language learning": 2,
    "horror": 3,
    "brutal": 3,
    "stressful": 3,
    "heavy": 3,
    "military": 2,
    "thriller": 2,
    "action": 2,
    "episodic": 1,
    "familiar": 1,
    "comfort": 0,
    "kids": 0,
    "comedy": 1,
    "gentle": 0,
    "short": 0
  };

  function normalizeText(value = "") {
    return String(value || "").trim().toLowerCase();
  }

  function normalizeState(state = "") {
    const text = normalizeText(state).replaceAll("_", " ");
    if (["high", "high capacity", "morning", "morning / high capacity"].includes(text)) return "high";
    if (["medium", "medium capacity", "afternoon", "afternoon / recovery"].includes(text)) return "medium";
    if (["low", "low capacity", "evening", "evening / low load"].includes(text)) return "low";
    if (["flare", "symptom flare", "symptom flare / recovery", "recovery"].includes(text)) return "flare";
    return "medium";
  }

  function stateProfile(state = "") {
    const profile = STATE_PROFILES[normalizeState(state)] || STATE_PROFILES.medium;
    return {
      ...profile,
      preferred: [...profile.preferred],
      avoid: [...profile.avoid]
    };
  }

  function candidateSignals(candidate = {}) {
    const signals = [
      candidate.medium,
      candidate.type,
      candidate.cognitive_load,
      candidate.load,
      ...(Array.isArray(candidate.tags) ? candidate.tags : []),
      ...(Array.isArray(candidate.reasons) ? candidate.reasons : []),
      ...(Array.isArray(candidate.matches) ? candidate.matches : []),
      ...(Array.isArray(candidate.risks) ? candidate.risks : [])
    ];

    return Array.from(new Set(signals.map(normalizeText).filter(Boolean)));
  }

  function candidateLoad(candidate = {}) {
    if (Number.isFinite(Number(candidate.cognitiveLoad))) return Math.max(0, Math.min(3, Number(candidate.cognitiveLoad)));
    if (Number.isFinite(Number(candidate.cognitive_load))) return Math.max(0, Math.min(3, Number(candidate.cognitive_load)));

    const signals = candidateSignals(candidate);
    const loads = signals
      .map(signal => LOAD_SIGNALS[signal])
      .filter(value => Number.isFinite(value));

    if (!loads.length) return 2;
    return Math.max(...loads);
  }

  function scoreCognitiveFit(candidate = {}, state = "Medium capacity") {
    const profile = stateProfile(state);
    const signals = candidateSignals(candidate);
    const load = candidateLoad(candidate);
    const preferredMatches = profile.preferred.filter(signal => signals.includes(signal));
    const avoidMatches = profile.avoid.filter(signal => signals.includes(signal));
    const protectiveLowLoadMatch = profile.id === "flare" && !avoidMatches.length && preferredMatches.some(signal => ["comfort", "gentle", "kids", "short", "familiar"].includes(signal));
    const loadGap = protectiveLowLoadMatch ? 0 : Math.max(0, load - profile.capacity);
    const capacityBonus = load <= profile.capacity || protectiveLowLoadMatch ? 10 : 0;
    const score = Math.max(0, Math.min(100, Math.round(70 + capacityBonus + (preferredMatches.length * 8) - (avoidMatches.length * 14) - (loadGap * 18))));
    const adjustment = Math.max(-25, Math.min(15, Math.round((score - 70) / 2)));
    const label = score >= 80 ? "Good fit now" : score >= 60 ? "Possible fit" : "Save for later";

    return {
      state: profile.id,
      stateLabel: profile.label,
      candidateLoad: load,
      capacity: profile.capacity,
      score,
      adjustment,
      label,
      preferredMatches,
      avoidMatches,
      explanation: avoidMatches.length || loadGap
        ? `${profile.label}: ${candidate.title || candidate.name || "this"} may be too demanding right now.`
        : `${profile.label}: ${candidate.title || candidate.name || "this"} fits your current capacity.`
    };
  }

  function applyCognitiveFit(recommendations = [], state = "Medium capacity", options = {}) {
    return (recommendations || []).map(recommendation => {
      const cognitiveFit = scoreCognitiveFit(recommendation.candidate || recommendation, state);
      const baseScore = Number(recommendation.score || 0);
      const adjustedScore = Math.max(0, Math.min(100, Math.round(baseScore + cognitiveFit.adjustment)));
      return {
        ...recommendation,
        cognitiveFit,
        adjustedScore,
        score: options.replaceScore ? adjustedScore : recommendation.score,
        explanation: {
          ...(recommendation.explanation || {}),
          cognitiveFit: cognitiveFit.explanation
        }
      };
    }).sort((a, b) => (b.adjustedScore ?? b.score ?? 0) - (a.adjustedScore ?? a.score ?? 0) || String(a.title || "").localeCompare(String(b.title || "")));
  }

  function cognitiveFitInsights(recommendations = [], state = "Medium capacity") {
    const fitted = recommendations.some(item => item.cognitiveFit) ? recommendations : applyCognitiveFit(recommendations, state);
    const saveForLater = fitted.filter(item => item.cognitiveFit?.label === "Save for later");
    const goodNow = fitted.filter(item => item.cognitiveFit?.label === "Good fit now");
    const cards = [];

    if (goodNow.length) {
      cards.push({
        type: "good_now",
        title: "Good for right now",
        priority: "High",
        text: `${goodNow[0].title} fits your current capacity best.`,
        recommendationTitle: goodNow[0].title
      });
    }

    if (saveForLater.length) {
      cards.push({
        type: "save_for_later",
        title: "Save demanding picks",
        priority: "Medium",
        text: `${saveForLater.length} recommendation${saveForLater.length === 1 ? "" : "s"} may be better when capacity is higher.`
      });
    }

    if (!cards.length) {
      cards.push({
        type: "neutral_fit",
        title: "No capacity warnings",
        priority: "Low",
        text: "Current recommendations do not show major cognitive-load conflicts."
      });
    }

    return cards;
  }

  global.OpenPCMCognitiveFit = {
    STATE_PROFILES,
    normalizeState,
    stateProfile,
    candidateSignals,
    candidateLoad,
    scoreCognitiveFit,
    applyCognitiveFit,
    cognitiveFitInsights
  };
})(window);
