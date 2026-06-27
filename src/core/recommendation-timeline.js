(function (global) {
  function normalizeTitle(title = "") {
    return String(title || "").trim();
  }

  function buildTimeline(history = [], title = "") {
    const target = normalizeTitle(title);
    const events = (history || [])
      .filter(decision => !target || decision.title === target)
      .map(decision => ({
        id: decision.id || "",
        timestamp_utc: decision.timestamp_utc || "",
        title: decision.title || "Untitled",
        score: decision.score || 0,
        confidence: decision.confidence || "Unknown",
        learningAdjustment: decision.learningAdjustment || 0,
        feedbackValue: decision.feedback?.value ?? null,
        supportingCount: (decision.supportingEvidence || []).length,
        conflictingCount: (decision.conflictingEvidence || []).length,
        sourceCount: (decision.sources || []).length,
        graphNodeCount: decision.explanationGraphSummary?.nodes || 0,
        graphEdgeCount: decision.explanationGraphSummary?.edges || 0
      }))
      .sort((a, b) => String(a.timestamp_utc).localeCompare(String(b.timestamp_utc)));

    return {
      schemaVersion: "openpcm_recommendation_timeline_v1",
      title: target || "All recommendations",
      events
    };
  }

  function timelineSummary(timeline = {}) {
    const events = timeline.events || [];
    const first = events[0] || null;
    const latest = events[events.length - 1] || null;
    const scoreDelta = first && latest ? latest.score - first.score : 0;
    const confidenceChanges = events.reduce((total, event, index) => {
      if (index === 0) return total;
      return total + (event.confidence !== events[index - 1].confidence ? 1 : 0);
    }, 0);

    return {
      totalEvents: events.length,
      firstScore: first?.score ?? null,
      latestScore: latest?.score ?? null,
      scoreDelta,
      confidenceChanges,
      latest
    };
  }

  function renderTimelineHtml(timeline = {}) {
    const summary = timelineSummary(timeline);
    const events = timeline.events || [];

    return `
      <div class="timeline">
        <h3>Recommendation timeline</h3>
        <p class="meta">${summary.totalEvents} events · score delta ${summary.scoreDelta > 0 ? "+" : ""}${summary.scoreDelta}</p>
        ${events.length ? `
          <ol>
            ${events.map(event => `
              <li>
                <strong>${event.score}%</strong>
                <span class="meta">${event.confidence} · ${event.timestamp_utc}</span>
                <div class="tags">
                  support ${event.supportingCount} · conflict ${event.conflictingCount} · sources ${event.sourceCount} · graph ${event.graphNodeCount}/${event.graphEdgeCount}
                  ${event.learningAdjustment ? ` · learning ${event.learningAdjustment > 0 ? "+" : ""}${event.learningAdjustment}` : ""}
                  ${event.feedbackValue !== null ? ` · feedback ${event.feedbackValue}` : ""}
                </div>
              </li>
            `).join("")}
          </ol>
        ` : `<p class="meta">No timeline events yet.</p>`}
      </div>`;
  }

  global.OpenPCMRecommendationTimeline = {
    buildTimeline,
    timelineSummary,
    renderTimelineHtml
  };
})(window);
