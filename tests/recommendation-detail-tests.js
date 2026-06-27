(function () {
  const { test, assert, assertEqual } = window.OpenPCMTest;
  const RecommendationDetail = window.OpenPCMRecommendationDetail;

  const recommendation = {
    title: "Counterpart",
    medium: "TV",
    score: 88,
    explanation: {
      confidence: "High",
      headline: "Recommended because it matches Institutional Conflict.",
      reasons: [{ label: "Institutional Conflict", signal: "institutional conflict" }],
      risks: [{ label: "Slow Pacing", signal: "slow pacing" }],
      sources: ["pcm:knowledge.recommendations.current.tv"]
    },
    feedback: { value: 1 },
    learningAdjustment: 5,
    explanationGraph: {
      nodes: [{ id: "a", type: "candidate" }, { id: "b", type: "score" }],
      edges: [{ from: "a", to: "b", type: "produces" }]
    }
  };

  test("buildRecommendationDetailModel extracts recommendation explanation fields", ["REQ-RECDETAIL-001"], () => {
    const model = RecommendationDetail.buildRecommendationDetailModel(recommendation);
    assertEqual(model.title, "Counterpart");
    assertEqual(model.score, 88);
    assertEqual(model.confidence, "High");
    assertEqual(model.reasons.length, 1);
    assertEqual(model.risks.length, 1);
    assertEqual(model.sources.length, 1);
    assertEqual(model.graphSummary.nodes, 2);
  });

  test("renderRecommendationDetailHtml renders score confidence sources and graph", ["REQ-RECDETAIL-001"], () => {
    const html = RecommendationDetail.renderRecommendationDetailHtml(recommendation);
    assert(html.includes("Counterpart"), "detail should include title");
    assert(html.includes("88%"), "detail should include score");
    assert(html.includes("Confidence: High"), "detail should include confidence");
    assert(html.includes("Institutional Conflict"), "detail should include supporting signal");
    assert(html.includes("Slow Pacing"), "detail should include risk");
    assert(html.includes("pcm:knowledge.recommendations.current.tv"), "detail should include source");
    assert(html.includes("2 nodes"), "detail should include graph summary");
  });

  test("renderRecommendationDetailHtml escapes unsafe text", ["REQ-RECDETAIL-001"], () => {
    const html = RecommendationDetail.renderRecommendationDetailHtml({
      title: "<script>alert(1)</script>",
      score: 1
    });
    assert(html.includes("&lt;script&gt;alert(1)&lt;/script&gt;"), "title should be escaped");
  });
})();
