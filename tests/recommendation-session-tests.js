(function () {
  const { test, assert, assertEqual } = window.OpenPCMTest;
  const session = window.OpenPCMRecommendationSession;

  const evidence = [
    { title: "The Expanse", medium: "TV", reaction: "loved", tags: ["geopolitics", "strategy", "complex"], timestamp_utc: "2026-06-20T00:00:00Z", cognitive_state: "High capacity" },
    { title: "Gentle Kids Show", medium: "TV", reaction: "liked", tags: ["comfort", "kids", "short"], timestamp_utc: "2026-06-29T00:00:00Z", cognitive_state: "Symptom flare / recovery" }
  ];

  const candidates = [
    { title: "Dense Space Politics", medium: "TV", tags: ["geopolitics", "strategy", "complex", "subtitles"] },
    { title: "Comfort Deer Episode", medium: "TV", tags: ["comfort", "kids", "short", "familiar"] }
  ];

  test("currentStateFromEvidence returns the latest cognitive state", ["REQ-RECSESSION-001"], () => {
    assertEqual(session.currentStateFromEvidence(evidence), "Symptom flare / recovery");
  });

  test("buildRecommendationSession creates a unified ranked recommendation session", ["REQ-RECSESSION-001", "REQ-RECSESSION-002"], () => {
    const result = session.buildRecommendationSession({ evidence, candidates, cognitiveState: "Symptom flare / recovery" }, { now: "2026-06-30T00:00:00Z" });

    assertEqual(result.schemaVersion, "openpcm_recommendation_session_v1");
    assertEqual(result.summary.total, 2);
    assertEqual(result.recommendations[0].title, "Comfort Deer Episode");
    assert(result.recommendations[0].finalScore >= result.recommendations[1].finalScore, "should sort by final score");
    assert(result.recommendations.every(item => item.decision && item.nextActions.length), "each recommendation should have a decision and actions");
  });

  test("recommendation session applies learning feedback before final decisions", ["REQ-RECSESSION-002"], () => {
    const priorRecommendations = [
      { title: "Dense Space Politics", score: 90, matches: ["geopolitics", "strategy"], risks: [], confidencePercent: 80 },
      { title: "Comfort Deer Episode", score: 70, matches: ["comfort", "kids"], risks: [], confidencePercent: 70 }
    ];
    const feedback = [
      { title: "Dense Space Politics", value: -3, timestamp_utc: "2026-06-28T00:00:00Z", reason: "Too demanding today" },
      { title: "Comfort Deer Episode", value: 2, timestamp_utc: "2026-06-29T00:00:00Z", reason: "Worked during recovery" }
    ];

    const result = session.buildRecommendationSession({ evidence, candidates, priorRecommendations, feedback, cognitiveState: "Low capacity" }, { now: "2026-06-30T00:00:00Z" });
    const comfort = result.recommendations.find(item => item.title === "Comfort Deer Episode");
    const dense = result.recommendations.find(item => item.title === "Dense Space Politics");

    assert(comfort.learningAdjustment > 0, "positive feedback should boost matching recommendation");
    assert(dense.learningAdjustment < 0, "negative feedback should reduce matching recommendation");
    assert(comfort.rank < dense.rank, "learning and fit should promote the lower-load option");
  });

  test("recommendation session emits insight cards and prediction ledger entries", ["REQ-RECSESSION-003"], () => {
    const result = session.buildRecommendationSession({ evidence, candidates, cognitiveState: "Low capacity" }, { sessionId: "demo", now: "2026-06-30T00:00:00Z" });

    assertEqual(result.ledger.length, result.recommendations.length);
    assert(result.insights.length >= 1, "should emit insight cards");
    assert(result.insights.some(card => ["good_now", "save_for_later", "pending_feedback", "needs_feedback"].includes(card.type)), "should include actionable recommendation insights");
    assert(session.sessionInsightText(result).includes("ranked"), "summary text should be user-readable");
  });
})();
