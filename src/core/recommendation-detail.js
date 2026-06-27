(function (global) {
  function escapeHtml(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function buildRecommendationDetailModel(recommendation = {}) {
    const graphSummary = recommendation.explanationGraph && global.OpenPCMExplanationGraph
      ? global.OpenPCMExplanationGraph.graphSummary(recommendation.explanationGraph)
      : null;

    return {
      title: recommendation.title || "Untitled",
      medium: recommendation.medium || "Other",
      score: recommendation.score || 0,
      confidence: recommendation.explanation?.confidence || recommendation.reasoning?.confidence || "Unknown",
      headline: recommendation.explanation?.headline || "",
      reasons: recommendation.explanation?.reasons || [],
      risks: recommendation.explanation?.risks || [],
      sources: recommendation.explanation?.sources || recommendation.sources || [],
      feedback: recommendation.feedback || null,
      learningAdjustment: recommendation.learningAdjustment || 0,
      graphSummary,
      note: recommendation.note || ""
    };
  }

  function renderRecommendationDetailHtml(recommendation = {}) {
    const model = buildRecommendationDetailModel(recommendation);

    return `
      <p class="eyebrow">Recommendation detail</p>
      <h2>${escapeHtml(model.title)} <span class="badge">${escapeHtml(String(model.score))}%</span></h2>
      <p class="meta">${escapeHtml(model.medium)} · Confidence: ${escapeHtml(model.confidence)}</p>
      ${model.headline ? `<div class="note"><strong>Why:</strong> ${escapeHtml(model.headline)}</div>` : ""}
      ${model.reasons.length ? `
        <h3>Supporting signals</h3>
        <ul>${model.reasons.map(reason => `<li>${escapeHtml(reason.label || reason.signal || reason)}</li>`).join("")}</ul>
      ` : ""}
      ${model.risks.length ? `
        <h3>Watch-outs</h3>
        <ul>${model.risks.map(risk => `<li>${escapeHtml(risk.label || risk.signal || risk)}</li>`).join("")}</ul>
      ` : ""}
      ${model.sources.length ? `
        <h3>Sources</h3>
        <ul>${model.sources.map(source => `<li><code>${escapeHtml(source)}</code></li>`).join("")}</ul>
      ` : ""}
      ${model.feedback ? `<p class="confirm">Feedback: ${model.feedback.value > 0 ? "Good fit" : model.feedback.value < 0 ? "Not for me" : "Neutral"}</p>` : ""}
      ${model.learningAdjustment ? `<p class="meta">Learning adjustment: ${model.learningAdjustment > 0 ? "+" : ""}${escapeHtml(String(model.learningAdjustment))}</p>` : ""}
      ${model.graphSummary ? `<p class="meta">Explanation graph: ${model.graphSummary.nodes} nodes · ${model.graphSummary.edges} links</p>` : ""}
      ${recommendation.explanationGraph && global.OpenPCMGraphViewer ? global.OpenPCMGraphViewer.renderGraphHtml(recommendation.explanationGraph) : ""}
      ${model.note ? `<div class="note">${escapeHtml(model.note)}</div>` : ""}
      <div class="detail-actions">
        <button class="secondary" data-nav="discover">Back to Discover</button>
      </div>`;
  }

  global.OpenPCMRecommendationDetail = {
    buildRecommendationDetailModel,
    renderRecommendationDetailHtml
  };
})(window);
