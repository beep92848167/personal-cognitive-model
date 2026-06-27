(function (global) {
  function titleKey(title = "") {
    return String(title || "").trim().toLowerCase();
  }

  function cleanTitle(title = "") {
    return String(title || "").trim();
  }

  function addCandidate(candidates, seen, raw, defaults = {}) {
    const title = cleanTitle(typeof raw === "string" ? raw : raw?.title);
    if (!title) return;

    const key = titleKey(title);
    const existing = seen.get(key);
    const source = defaults.source || raw?.source || "unknown";
    const medium = defaults.medium || raw?.medium || raw?.type || "Other";
    const tags = [
      ...(defaults.tags || []),
      ...(Array.isArray(raw?.tags) ? raw.tags : []),
      ...(raw?.reason ? [raw.reason] : [])
    ].filter(Boolean);

    if (existing) {
      existing.sources = [...new Set([...(existing.sources || []), source])];
      existing.tags = [...new Set([...(existing.tags || []), ...tags])];
      return;
    }

    const candidate = {
      title,
      medium,
      tags: [...new Set(tags)],
      note: defaults.note || raw?.note || raw?.description || "",
      source,
      sources: [source],
      catalogueStatus: defaults.status || raw?.status || "candidate"
    };

    seen.set(key, candidate);
    candidates.push(candidate);
  }

  function positiveTagsFromProfile(profileSource = {}) {
    if (!global.OpenPCMProfile) return [];
    return global.OpenPCMProfile.positiveFeatureSignals(profileSource, 6).map(signal => signal.tag);
  }

  function ingestTelevision(candidates, seen, media = {}, profileSource = {}) {
    const tags = positiveTagsFromProfile(profileSource);
    for (const title of media.television?.loved || []) {
      addCandidate(candidates, seen, title, {
        medium: "TV",
        tags,
        source: "pcm:media.television.loved",
        status: "known-positive",
        note: "Known positive television signal from PCM."
      });
    }
    for (const item of media.television?.bounced_or_disliked || []) {
      addCandidate(candidates, seen, item, {
        medium: "TV",
        source: "pcm:media.television.bounced_or_disliked",
        status: "known-negative",
        note: "Known negative or bounced television signal from PCM."
      });
    }
    for (const title of media.television?.comfort_rewatches || []) {
      addCandidate(candidates, seen, title, {
        medium: "TV",
        tags: [...tags, "comfort rewatches", "recovery"],
        source: "pcm:media.television.comfort_rewatches",
        status: "comfort"
      });
    }
  }

  function ingestMovies(candidates, seen, media = {}, profileSource = {}) {
    const tags = positiveTagsFromProfile(profileSource);
    for (const title of media.movies?.loved_or_liked || []) {
      addCandidate(candidates, seen, title, {
        medium: "Movie",
        tags,
        source: "pcm:media.movies.loved_or_liked",
        status: "known-positive"
      });
    }
    for (const title of media.movies?.recommended_unwatched_or_unknown || []) {
      addCandidate(candidates, seen, title, {
        medium: "Movie",
        tags,
        source: "pcm:media.movies.recommended_unwatched_or_unknown",
        status: "candidate"
      });
    }
  }

  function ingestSimpleModule(candidates, seen, moduleData = {}, medium, sourcePrefix, profileSource = {}) {
    const tags = positiveTagsFromProfile(profileSource);
    for (const [key, value] of Object.entries(moduleData || {})) {
      if (key === "module") continue;
      const source = `${sourcePrefix}.${key}`;
      if (Array.isArray(value)) {
        for (const item of value) {
          addCandidate(candidates, seen, item, { medium, tags, source, status: key });
        }
      }
    }
  }

  function ingestRecommendations(candidates, seen, recommendations = {}, profileSource = {}) {
    const tags = positiveTagsFromProfile(profileSource);
    const current = recommendations.current || {};
    for (const title of current.tv || []) {
      addCandidate(candidates, seen, title, {
        medium: "TV",
        tags,
        source: "pcm:knowledge.recommendations.current.tv",
        status: "recommended"
      });
    }
    for (const title of current.books_low_load || []) {
      addCandidate(candidates, seen, title, {
        medium: "Book",
        tags: [...tags, "low cognitive load"],
        source: "pcm:knowledge.recommendations.current.books_low_load",
        status: "recommended"
      });
    }
    for (const title of current.games_ps5 || []) {
      addCandidate(candidates, seen, title, {
        medium: "Game",
        tags: [...tags, "systems thinker", "stewardship"],
        source: "pcm:knowledge.recommendations.current.games_ps5",
        status: "recommended"
      });
    }
  }

  function buildCatalogue(profileSource = {}) {
    const candidates = [];
    const seen = new Map();
    const media = profileSource.media || {};
    const knowledge = profileSource.knowledge || {};

    ingestTelevision(candidates, seen, media, profileSource);
    ingestMovies(candidates, seen, media, profileSource);
    ingestSimpleModule(candidates, seen, media.novels, "Book", "pcm:media.novels", profileSource);
    ingestSimpleModule(candidates, seen, media.games, "Game", "pcm:media.games", profileSource);
    ingestSimpleModule(candidates, seen, media.documentaries, "Documentary", "pcm:media.documentaries", profileSource);
    ingestSimpleModule(candidates, seen, media.comedy, "Comedy", "pcm:media.comedy", profileSource);
    ingestSimpleModule(candidates, seen, media.integrated_m2m, "Mixed Media", "pcm:media.integrated_m2m", profileSource);
    ingestRecommendations(candidates, seen, knowledge.recommendations, profileSource);

    return candidates.sort((a, b) => a.title.localeCompare(b.title));
  }

  function catalogueSummary(candidates = []) {
    const byMedium = {};
    const byStatus = {};
    for (const candidate of candidates) {
      byMedium[candidate.medium] = (byMedium[candidate.medium] || 0) + 1;
      byStatus[candidate.catalogueStatus] = (byStatus[candidate.catalogueStatus] || 0) + 1;
    }

    return {
      total: candidates.length,
      byMedium,
      byStatus
    };
  }

  global.OpenPCMCatalogue = {
    titleKey,
    buildCatalogue,
    catalogueSummary,
    addCandidate
  };
})(window);
