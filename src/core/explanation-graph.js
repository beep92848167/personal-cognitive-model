(function (global) {
  function node(id, type, label, data = {}) {
    return { id, type, label, data };
  }

  function edge(from, to, type, data = {}) {
    return { from, to, type, data };
  }

  function safeId(prefix, value = "") {
    return `${prefix}:${String(value || "unknown").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "unknown"}`;
  }

  function buildExplanationGraph(recommendation = {}) {
    const nodes = [];
    const edges = [];
    const title = recommendation.title || recommendation.candidate?.title || "Untitled";
    const candidateId = safeId("candidate", title);
    const scoreId = safeId("score", title);

    nodes.push(node(candidateId, "candidate", title, {
      medium: recommendation.medium || recommendation.candidate?.medium || "Other",
      note: recommendation.note || ""
    }));

    nodes.push(node(scoreId, "score", `${recommendation.score || 0}%`, {
      score: recommendation.score || 0,
      confidence: recommendation.explanation?.confidence || recommendation.reasoning?.confidence || "Unknown"
    }));
    edges.push(edge(candidateId, scoreId, "produces"));

    for (const reason of recommendation.explanation?.reasons || []) {
      const signal = reason.signal || reason.label || reason;
      const id = safeId("support", signal);
      nodes.push(node(id, "supporting-signal", reason.label || String(signal), {
        signal,
        weight: reason.weight || 0,
        source: reason.source || ""
      }));
      edges.push(edge(id, candidateId, "supports"));
    }

    for (const risk of recommendation.explanation?.risks || []) {
      const signal = risk.signal || risk.label || risk;
      const id = safeId("risk", signal);
      nodes.push(node(id, "conflicting-signal", risk.label || String(signal), {
        signal,
        weight: risk.weight || 0,
        source: risk.source || ""
      }));
      edges.push(edge(id, candidateId, "conflicts"));
    }

    for (const source of recommendation.explanation?.sources || recommendation.sources || []) {
      const id = safeId("source", source);
      nodes.push(node(id, "source", source));
      edges.push(edge(id, candidateId, "provides"));
    }

    if (recommendation.feedback) {
      const feedbackId = safeId("feedback", title);
      nodes.push(node(feedbackId, "feedback", recommendation.feedback.value > 0 ? "Good fit" : "Not for me", recommendation.feedback));
      edges.push(edge(feedbackId, scoreId, "calibrates"));
    }

    if (recommendation.learningAdjustment) {
      const learningId = safeId("learning", title);
      nodes.push(node(learningId, "learning-adjustment", `${recommendation.learningAdjustment > 0 ? "+" : ""}${recommendation.learningAdjustment}`, {
        adjustment: recommendation.learningAdjustment
      }));
      edges.push(edge(learningId, scoreId, "adjusts"));
    }

    return {
      schemaVersion: "openpcm_explanation_graph_v1",
      root: candidateId,
      nodes: dedupeNodes(nodes),
      edges
    };
  }

  function dedupeNodes(nodes = []) {
    const seen = new Map();
    for (const item of nodes) {
      if (!seen.has(item.id)) seen.set(item.id, item);
    }
    return [...seen.values()];
  }

  function graphSummary(graph = {}) {
    const counts = {};
    for (const n of graph.nodes || []) {
      counts[n.type] = (counts[n.type] || 0) + 1;
    }

    return {
      nodes: (graph.nodes || []).length,
      edges: (graph.edges || []).length,
      counts
    };
  }

  global.OpenPCMExplanationGraph = {
    safeId,
    buildExplanationGraph,
    graphSummary
  };
})(window);
