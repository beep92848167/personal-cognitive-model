(function (global) {
  function humanizeKey(key = "") {
    return String(key || "")
      .replaceAll("_", " ")
      .replace(/\b\w/g, letter => letter.toUpperCase());
  }

  function normalizeText(value = "") {
    return String(value || "").trim();
  }

  function positiveFeatureSignals(source = {}, limit = 8) {
    const positive = source.knowledge?.features?.positive || {};
    return Object.entries(positive)
      .map(([key, value]) => ({
        key,
        tag: humanizeKey(key).toLowerCase(),
        label: humanizeKey(key),
        weight: Number(value.weight || 0),
        confidence: Number(value.confidence || 0),
        note: value.note || ""
      }))
      .sort((a, b) => (b.weight + b.confidence) - (a.weight + a.confidence) || a.label.localeCompare(b.label))
      .slice(0, limit);
  }

  function negativeFeatureSignals(source = {}, limit = 8) {
    const negative = source.knowledge?.features?.negative || {};
    return Object.entries(negative)
      .map(([key, value]) => ({
        key,
        tag: humanizeKey(key).toLowerCase(),
        label: humanizeKey(key),
        weight: Number(value.weight || 0),
        confidence: Number(value.confidence || 0)
      }))
      .sort((a, b) => a.weight - b.weight || a.label.localeCompare(b.label))
      .slice(0, limit);
  }

  function profileSummary(source = {}) {
    return {
      cognition: source.profile?.cognition?.summary || "",
      capacityRule: source.profile?.daily_capacity?.rule || "",
      positiveSignals: positiveFeatureSignals(source),
      negativeSignals: negativeFeatureSignals(source)
    };
  }

  function pushCandidate(candidates, seen, title, medium, tags, note, source) {
    const cleanTitle = normalizeText(title);
    if (!cleanTitle) return;
    const key = cleanTitle.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    candidates.push({
      title: cleanTitle,
      medium,
      tags,
      note,
      source
    });
  }

  function buildCandidateCatalogue(source = {}) {
    const candidates = [];
    const seen = new Set();
    const signals = positiveFeatureSignals(source, 6).map(signal => signal.tag);
    const current = source.knowledge?.recommendations?.current || {};
    const media = source.media || {};

    for (const title of current.tv || []) {
      pushCandidate(candidates, seen, title, "TV", signals, "From current PCM television recommendations.", "pcm:recommendations.current.tv");
    }

    for (const title of current.books_low_load || []) {
      pushCandidate(candidates, seen, title, "Book", [...signals, "low cognitive load"], "From current low-load book recommendations.", "pcm:recommendations.current.books_low_load");
    }

    for (const title of current.games_ps5 || []) {
      pushCandidate(candidates, seen, title, "Game", [...signals, "systems thinker", "stewardship"], "From current PS5 game recommendations.", "pcm:recommendations.current.games_ps5");
    }

    for (const title of media.movies?.recommended_unwatched_or_unknown || []) {
      pushCandidate(candidates, seen, title, "Movie", signals, "From PCM movie recommendations/unknowns.", "pcm:media.movies.recommended_unwatched_or_unknown");
    }

    for (const title of media.television?.comfort_rewatches || []) {
      pushCandidate(candidates, seen, title, "TV", [...signals, "comfort rewatches", "recovery"], "Comfort rewatch candidate from PCM.", "pcm:media.television.comfort_rewatches");
    }

    return candidates;
  }

  function buildEvidenceFromProfile(source = {}) {
    const evidence = [];
    const media = source.media || {};

    for (const title of media.television?.loved || []) {
      evidence.push({ title, medium: "TV", reaction: "Loved", tags: positiveFeatureSignals(source, 6).map(signal => signal.tag) });
    }

    for (const title of media.movies?.loved_or_liked || []) {
      evidence.push({ title, medium: "Movie", reaction: "Liked", tags: positiveFeatureSignals(source, 4).map(signal => signal.tag) });
    }

    for (const item of media.television?.bounced_or_disliked || []) {
      const title = typeof item === "string" ? item : item.title;
      const reason = typeof item === "string" ? "" : item.reason;
      evidence.push({ title, medium: "TV", reaction: "Bounced", tags: reason ? [reason] : negativeFeatureSignals(source, 2).map(signal => signal.tag) });
    }

    return evidence;
  }

  global.OpenPCMProfile = {
    humanizeKey,
    positiveFeatureSignals,
    negativeFeatureSignals,
    profileSummary,
    buildCandidateCatalogue,
    buildEvidenceFromProfile
  };
})(window);
