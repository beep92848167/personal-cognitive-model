(function () {
  const { test, assertEqual } = window.OpenPCMTest;
  const Graph = window.OpenPCMExplanationGraph;

  const recommendation = {
    title: "Counterpart",
    medium: "TV",
    score: 87,
    explanation: {
      confidence: "High",
      reasons: [
        { signal: "institutional conflict", label: "Institutional Conflict", weight: 20 },
        { signal: "competence under pressure", label: "Competence Under Pressure", weight: 18 }
      ],
      risks: [
        { signal: "slow pacing", label: "Slow Pacing", weight: -3 }
      ],
      sources: ["pcm:knowledge.recommendations.current.tv"]
    },
    feedback: { value: 1 },
    learningAdjustment: 5
  };

  test("buildExplanationGraph creates candidate score and signal nodes", ["REQ-EXPLANATION-GRAPH-001"], () => {
    const graph = Graph.buildExplanationGraph(recommendation);
    assertEqual(graph.schemaVersion, "openpcm_explanation_graph_v1");
    assertEqual(graph.nodes.some(n => n.type === "candidate"), true);
    assertEqual(graph.nodes.some(n => n.type === "score"), true);
    assertEqual(graph.nodes.some(n => n.type === "supporting-signal"), true);
    assertEqual(graph.nodes.some(n => n.type === "conflicting-signal"), true);
  });

  test("buildExplanationGraph links sources feedback and learning", ["REQ-EXPLANATION-GRAPH-001"], () => {
    const graph = Graph.buildExplanationGraph(recommendation);
    assertEqual(graph.nodes.some(n => n.type === "source"), true);
    assertEqual(graph.nodes.some(n => n.type === "feedback"), true);
    assertEqual(graph.nodes.some(n => n.type === "learning-adjustment"), true);
    assertEqual(graph.edges.some(e => e.type === "calibrates"), true);
    assertEqual(graph.edges.some(e => e.type === "adjusts"), true);
  });

  test("graphSummary counts nodes by type", ["REQ-EXPLANATION-GRAPH-001"], () => {
    const summary = Graph.graphSummary(Graph.buildExplanationGraph(recommendation));
    assertEqual(summary.counts.candidate, 1);
    assertEqual(summary.counts["supporting-signal"], 2);
  });

  test("safeId creates stable graph ids", ["REQ-EXPLANATION-GRAPH-001"], () => {
    assertEqual(Graph.safeId("candidate", "Counterpart!"), "candidate:counterpart");
  });
})();
