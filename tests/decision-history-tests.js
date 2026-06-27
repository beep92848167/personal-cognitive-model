(function () {
  const { test, assertEqual } = window.OpenPCMTest;
  const DecisionHistory = window.OpenPCMDecisionHistory;

  const recommendation = {
    title: "Counterpart",
    medium: "TV",
    score: 87,
    explanation: {
      confidence: "High",
      reasons: [{ signal: "institutional conflict" }],
      risks: [{ signal: "slow pacing" }],
      sources: ["pcm:source"]
    },
    feedback: { value: 1 },
    learningAdjustment: 5,
    explanationGraph: { root: "candidate:counterpart", nodes: [{ id: "candidate:counterpart", type: "candidate" }], edges: [] }
  };

  test("normalizeDecision captures recommendation reasoning fields", ["REQ-DECISION-001"], () => {
    const decision = DecisionHistory.normalizeDecision(recommendation, { id: "decision-1", timestamp_utc: "2026-01-01T00:00:00.000Z" });
    assertEqual(decision.id, "decision-1");
    assertEqual(decision.title, "Counterpart");
    assertEqual(decision.score, 87);
    assertEqual(decision.confidence, "High");
    assertEqual(decision.supportingEvidence.length, 1);
    assertEqual(decision.conflictingEvidence.length, 1);
    assertEqual(decision.sources[0], "pcm:source");
    assertEqual(decision.learningAdjustment, 5);
    assertEqual(decision.explanationGraphRoot, "candidate:counterpart");
  });

  test("appendDecisions prepends decisions and respects limit", ["REQ-DECISION-001"], () => {
    const result = DecisionHistory.appendDecisions([{ id: "old" }], [{ id: "new1" }, { id: "new2" }], 2);
    assertEqual(result.length, 2);
    assertEqual(result[0].id, "new1");
    assertEqual(result[1].id, "new2");
  });

  test("decisionHistorySummary counts total and unique titles", ["REQ-DECISION-001"], () => {
    const summary = DecisionHistory.decisionHistorySummary([{ title: "A" }, { title: "A" }, { title: "B" }]);
    assertEqual(summary.total, 3);
    assertEqual(summary.uniqueTitles, 2);
    assertEqual(summary.byTitle.A, 2);
  });

  test("scoreTrend returns chronological score changes for one title", ["REQ-DECISION-001"], () => {
    const trend = DecisionHistory.scoreTrend([
      { title: "A", timestamp_utc: "2026-01-02", score: 80 },
      { title: "B", timestamp_utc: "2026-01-02", score: 50 },
      { title: "A", timestamp_utc: "2026-01-01", score: 70 }
    ], "A");
    assertEqual(trend.length, 2);
    assertEqual(trend[0].score, 70);
    assertEqual(trend[1].score, 80);
  });

  test("saveHistory and loadHistory round-trip through storage", ["REQ-DECISION-001"], () => {
    const storage = { data: {}, getItem(key) { return this.data[key] || null; }, setItem(key, value) { this.data[key] = value; } };
    DecisionHistory.saveHistory([{ id: "x" }], storage, "history");
    assertEqual(DecisionHistory.loadHistory(storage, "history")[0].id, "x");
  });
})();
