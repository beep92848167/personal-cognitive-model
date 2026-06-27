(function () {
  const { test, assert, assertEqual } = window.OpenPCMTest;
  const Timeline = window.OpenPCMRecommendationTimeline;

  const history = [
    {
      id: "late",
      timestamp_utc: "2026-01-02T00:00:00.000Z",
      title: "Counterpart",
      score: 90,
      confidence: "High",
      learningAdjustment: 5,
      feedback: { value: 1 },
      supportingEvidence: [{ signal: "institutional conflict" }],
      conflictingEvidence: [],
      sources: ["pcm:source"],
      explanationGraphSummary: { nodes: 5, edges: 4 }
    },
    {
      id: "early",
      timestamp_utc: "2026-01-01T00:00:00.000Z",
      title: "Counterpart",
      score: 80,
      confidence: "Medium",
      supportingEvidence: [],
      conflictingEvidence: [{ signal: "slow pacing" }],
      sources: [],
      explanationGraphSummary: { nodes: 2, edges: 1 }
    },
    {
      id: "other",
      timestamp_utc: "2026-01-01T00:00:00.000Z",
      title: "Other",
      score: 50
    }
  ];

  test("buildTimeline filters title and sorts chronologically", ["REQ-TIMELINE-001"], () => {
    const timeline = Timeline.buildTimeline(history, "Counterpart");
    assertEqual(timeline.schemaVersion, "openpcm_recommendation_timeline_v1");
    assertEqual(timeline.events.length, 2);
    assertEqual(timeline.events[0].id, "early");
    assertEqual(timeline.events[1].id, "late");
  });

  test("timelineSummary calculates score and confidence changes", ["REQ-TIMELINE-001"], () => {
    const summary = Timeline.timelineSummary(Timeline.buildTimeline(history, "Counterpart"));
    assertEqual(summary.totalEvents, 2);
    assertEqual(summary.firstScore, 80);
    assertEqual(summary.latestScore, 90);
    assertEqual(summary.scoreDelta, 10);
    assertEqual(summary.confidenceChanges, 1);
  });

  test("renderTimelineHtml shows timeline metrics", ["REQ-TIMELINE-001"], () => {
    const html = Timeline.renderTimelineHtml(Timeline.buildTimeline(history, "Counterpart"));
    assert(html.includes("Recommendation timeline"), "should include title");
    assert(html.includes("score delta +10"), "should include score delta");
    assert(html.includes("support 1"), "should include support count");
    assert(html.includes("graph 5/4"), "should include graph count");
  });
})();
